import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import InvoiceEditor from "./components/InvoiceEditor";
import {
  emptyInvoice,
  normalizeInvoice,
  computeTotals,
} from "./utils";

export default function App() {
  const [user, setUser] = useState(undefined); // undefined = loading
  const [saved, setSaved] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [invoice, setInvoice] = useState(() => emptyInvoice(2));
  const [status, setStatus] = useState("");
  const pageRef = useRef(null);
  const statusTimer = useRef(null);

  // ---- Auth ----
  useEffect(() => onAuthStateChanged(auth, (u) => setUser(u || null)), []);

  // ---- Live subscription to this user's invoices ----
  useEffect(() => {
    if (!user) {
      setSaved([]);
      return;
    }
    const q = query(
      collection(db, "invoices"),
      where("ownerId", "==", user.uid),
      orderBy("savedAt", "desc")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setSaved(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => flash("⚠ " + err.message)
    );
    return unsub;
  }, [user]);

  // Open sidebar by default on desktop.
  useEffect(() => {
    if (window.innerWidth >= 820) document.body.classList.add("sidebar-open");
  }, []);

  function flash(msg) {
    setStatus(msg);
    clearTimeout(statusTimer.current);
    statusTimer.current = setTimeout(() => setStatus(""), 3000);
  }

  function nextInvoiceNumber() {
    let max = 1;
    saved.forEach((e) => {
      const n = parseInt(e.data?.invNum || "", 10);
      if (!isNaN(n) && n > max) max = n;
    });
    return String(max + 1);
  }

  // ---- Firestore actions ----
  async function save() {
    if (!user) return;
    const { net } = computeTotals(invoice);
    const payload = {
      ownerId: user.uid,
      data: invoice,
      invNum: invoice.invNum,
      invDate: invoice.invDate,
      net,
      savedAt: new Date().toISOString(),
    };
    try {
      if (currentId) {
        await updateDoc(doc(db, "invoices", currentId), payload);
      } else {
        const ref = await addDoc(collection(db, "invoices"), payload);
        setCurrentId(ref.id);
      }
      flash("✓ Saved to cloud");
    } catch (e) {
      flash("⚠ Save failed: " + e.message);
    }
  }

  function loadEntry(entry) {
    setCurrentId(entry.id);
    setInvoice(normalizeInvoice(entry.data));
    flash("✓ Loaded Invoice #" + (entry.data?.invNum || ""));
    if (window.innerWidth < 820) document.body.classList.remove("sidebar-open");
  }

  async function remove(entry) {
    if (!confirm("Delete saved Invoice #" + (entry.data?.invNum || "") + "?")) return;
    try {
      await deleteDoc(doc(db, "invoices", entry.id));
      if (currentId === entry.id) setCurrentId(null);
      flash("Deleted");
    } catch (e) {
      flash("⚠ Delete failed: " + e.message);
    }
  }

  function newInvoice() {
    if (!confirm("Start a new blank invoice? Unsaved changes will be lost.")) return;
    setCurrentId(null);
    setInvoice(emptyInvoice(nextInvoiceNumber()));
  }

  async function downloadPDF() {
    const el = pageRef.current;
    const num = invoice.invNum || "invoice";
    const { default: html2pdf } = await import("html2pdf.js");
    document.body.classList.add("pdf-mode");
    flash("Generating PDF…");
    try {
      await html2pdf()
        .set({
          margin: 10,
          filename: "invoice-" + num + ".pdf",
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["css", "legacy"] },
        })
        .from(el)
        .save();
      flash("✓ PDF downloaded");
    } catch (e) {
      flash("⚠ PDF failed — using print");
      window.print();
    } finally {
      document.body.classList.remove("pdf-mode");
    }
  }

  if (user === undefined) return <div className="loader">Loading…</div>;
  if (user === null) return <Login />;

  return (
    <div className="app-shell">
      <Sidebar
        saved={saved}
        currentId={currentId}
        onSelect={loadEntry}
        onDelete={remove}
      />

      <div className="main">
        <div className="toolbar no-print">
          <button
            title="Show / hide saved invoices"
            onClick={() => document.body.classList.toggle("sidebar-open")}
          >
            ☰ Saved
          </button>
          <button className="primary" onClick={save}>💾 Save</button>
          <button onClick={newInvoice}>＋ New Invoice</button>
          <button onClick={downloadPDF}>⬇ Download PDF</button>
          <span className="spacer" />
          <span className="status">{status}</span>
          <div className="user-chip">
            {user.photoURL && <img src={user.photoURL} alt="" referrerPolicy="no-referrer" />}
            <span>{user.displayName || user.email}</span>
          </div>
          <button onClick={() => signOut(auth)}>Sign out</button>
        </div>

        <InvoiceEditor
          invoice={invoice}
          setInvoice={setInvoice}
          pageRef={pageRef}
        />
      </div>
    </div>
  );
}
