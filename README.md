# Antarika Invoice Generator

A React (Vite) port of the original `invoice.html`, with invoices saved to
**Cloud Firestore** as JSON and per-user **Google sign-in**.

## Stack
- React 18 + Vite
- Firebase Auth (Google) + Cloud Firestore
- `html2pdf.js` for PDF export (lazy-loaded)

Firebase project: **antarika-invoice-gen**

## One-time setup (required)

Google sign-in must be enabled once in the console (this is a console toggle,
not scriptable via CLI):

1. Open **https://console.firebase.google.com/project/antarika-invoice-gen/authentication/providers**
2. Click **Get started** (if prompted) → enable the **Google** provider → **Save**.
3. Under Authentication → **Settings → Authorized domains**, confirm `localhost`
   is listed (it is by default). Add your production domain when you deploy.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173, sign in with Google, and start creating invoices.

Firebase web config lives in `.env.local` (already filled in). It is safe to
expose — access is protected by the Firestore security rules, not by the key.

## Data model

Collection **`invoices`**, one document per saved invoice:

```json
{
  "ownerId": "<google-user-uid>",
  "invNum": "2",
  "invDate": "2026-07-03",
  "net": 8500,
  "savedAt": "2026-07-03T09:00:00.000Z",
  "data": {
    "invNum": "2",
    "invDate": "2026-07-03",
    "notes": "",
    "sections": {
      "somatic": [
        {
          "id": "c_...",
          "name": "Client name",
          "paidBy": "Client",
          "mode": "Bank transfer",
          "rate": "1000",
          "sessions": 5,
          "trackBy": "Date of Session",
          "dates": ["2026-07-01", "..."]
        }
      ],
      "consultation": []
    }
  }
}
```

The full invoice JSON is stored under `data`; the top-level `invNum`, `invDate`,
`net`, and `savedAt` are duplicated for cheap sidebar listing/sorting.

## Security rules

See `firestore.rules` — a user can only read/write/delete invoices whose
`ownerId` matches their auth uid. Already deployed. Re-deploy with:

```bash
firebase deploy --only firestore:rules
```

## Deploy the app (optional)

```bash
npm run build
firebase deploy --only hosting
```
