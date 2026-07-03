import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import {
  deriveKey,
  encryptJSON,
  decryptJSON,
  randomSaltB64,
  VERIFIER_TOKEN,
} from "../crypto";

// Prompts for the passphrase and returns a derived key via onUnlock(key).
// First-time users set a passphrase; returning users must match it.
export default function Unlock({ user, onUnlock }) {
  const [meta, setMeta] = useState(undefined); // undefined=loading, null=first time
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const metaRef = doc(db, "userKeys", user.uid);

  useEffect(() => {
    getDoc(metaRef)
      .then((snap) => setMeta(snap.exists() ? snap.data() : null))
      .catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.uid]);

  const isFirstTime = meta === null;

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!pass) return setError("Enter a passphrase.");
    if (isFirstTime && pass !== pass2)
      return setError("Passphrases do not match.");
    if (isFirstTime && pass.length < 8)
      return setError("Use at least 8 characters.");

    setBusy(true);
    try {
      if (isFirstTime) {
        const salt = randomSaltB64();
        const key = await deriveKey(pass, salt);
        const verifier = await encryptJSON(key, VERIFIER_TOKEN);
        await setDoc(metaRef, { salt, verifier });
        onUnlock(key);
      } else {
        const key = await deriveKey(pass, meta.salt);
        try {
          const token = await decryptJSON(
            key,
            meta.verifier.iv,
            meta.verifier.ciphertext
          );
          if (token !== VERIFIER_TOKEN) throw new Error("bad");
        } catch {
          setBusy(false);
          return setError("Incorrect passphrase.");
        }
        onUnlock(key);
      }
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }

  if (meta === undefined)
    return <div className="loader">Loading…</div>;

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={submit}>
        <h1>{isFirstTime ? "Set your passphrase" : "Unlock your invoices"}</h1>
        <p>
          {isFirstTime
            ? "Your invoices are encrypted on this device. Choose a passphrase — it is never sent to the server and cannot be recovered if lost."
            : "Enter your passphrase to decrypt your invoices."}
        </p>
        <input
          type="password"
          placeholder="Passphrase"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          autoFocus
          style={{ width: "100%", height: 40, marginBottom: 10 }}
        />
        {isFirstTime && (
          <input
            type="password"
            placeholder="Confirm passphrase"
            value={pass2}
            onChange={(e) => setPass2(e.target.value)}
            style={{ width: "100%", height: 40, marginBottom: 10 }}
          />
        )}
        {error && (
          <div style={{ color: "var(--danger)", fontSize: 13, marginBottom: 10 }}>
            {error}
          </div>
        )}
        <button className="primary" type="submit" disabled={busy} style={{ width: "100%" }}>
          {busy ? "Working…" : isFirstTime ? "Set passphrase" : "Unlock"}
        </button>
      </form>
    </div>
  );
}
