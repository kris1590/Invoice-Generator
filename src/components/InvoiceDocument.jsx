import { forwardRef } from "react";
import {
  SECTIONS,
  SECTION_TITLES,
  money,
  lineTotal,
  computeTotals,
} from "../utils";

function fmtDate(iso) {
  if (!iso) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Clean, print-ready invoice rendered purely from the entered data.
const InvoiceDocument = forwardRef(function InvoiceDocument({ invoice }, ref) {
  const { subtotals, gross, fee, net } = computeTotals(invoice);
  const activeSections = SECTIONS.filter(
    (s) => (invoice.sections[s] || []).length > 0
  );

  return (
    <div className="doc" ref={ref}>
      <header className="doc-head">
        <div>
          <div className="doc-title">INVOICE</div>
          <div className="doc-from">Anusha B.M</div>
        </div>
        <div className="doc-meta">
          <div className="doc-meta-row">
            <span className="k">Invoice No.</span>
            <span className="v">{invoice.invNum || "—"}</span>
          </div>
          <div className="doc-meta-row">
            <span className="k">Date</span>
            <span className="v">{fmtDate(invoice.invDate) || "—"}</span>
          </div>
        </div>
      </header>

      <div className="doc-parties">
        <div className="doc-party">
          <div className="doc-party-label">Billed To</div>
          <div className="doc-party-name">Manushee</div>
          <div>Plot No. 55, IP Extension</div>
          <div>Delhi 110092</div>
        </div>
        <div className="doc-party">
          <div className="doc-party-label">Payable To</div>
          <div className="doc-party-name">Anusha B.M</div>
          <div className="doc-kv"><span>Account No.</span><span>50100722584595</span></div>
          <div className="doc-kv"><span>IFSC Code</span><span>HDFC0004051</span></div>
          <div className="doc-kv"><span>PAN No.</span><span>AUQPA7613P</span></div>
        </div>
      </div>

      <table className="doc-table">
        <thead>
          <tr>
            <th className="c-desc">Description</th>
            <th className="c-mode">Payment</th>
            <th className="c-num">Sessions</th>
            <th className="c-num">Rate</th>
            <th className="c-num">Amount</th>
          </tr>
        </thead>
        <tbody>
          {activeSections.map((section) => (
            <SectionRows
              key={section}
              title={SECTION_TITLES[section]}
              clients={invoice.sections[section]}
              subtotal={subtotals[section]}
            />
          ))}
          {activeSections.length === 0 && (
            <tr>
              <td colSpan={5} className="doc-empty">
                No line items entered.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="doc-totals-wrap">
        <table className="doc-totals">
          <tbody>
            <tr>
              <td className="k">Gross Total</td>
              <td className="v">{money(gross)}</td>
            </tr>
            <tr>
              <td className="k">Platform Fee (15%)</td>
              <td className="v">−{money(fee)}</td>
            </tr>
            <tr className="grand">
              <td className="k">Net Payable</td>
              <td className="v">{money(net)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {invoice.notes && (
        <div className="doc-notes">
          <div className="doc-notes-label">Notes</div>
          <div className="doc-notes-body">{invoice.notes}</div>
        </div>
      )}

      <div className="doc-foot">Thank you for your business.</div>
    </div>
  );
});

function SectionRows({ title, clients, subtotal }) {
  return (
    <>
      <tr className="doc-section-row">
        <td colSpan={5}>{title}</td>
      </tr>
      {clients.map((c) => {
        const dates = (c.dates || []).filter(Boolean);
        return (
          <tr key={c.id} className="doc-item-row">
            <td className="c-desc">
              <div className="doc-item-name">{c.name || "Unnamed client"}</div>
              {dates.length > 0 && (
                <div className="doc-item-sub">
                  {c.trackBy}: {dates.map(fmtDate).join(", ")}
                </div>
              )}
              {c.paidBy && c.paidBy !== "Client" && (
                <div className="doc-item-sub">Paid by: {c.paidBy}</div>
              )}
            </td>
            <td className="c-mode">{c.mode}</td>
            <td className="c-num">{parseInt(c.sessions, 10) || 0}</td>
            <td className="c-num">{money(c.rate)}</td>
            <td className="c-num">{money(lineTotal(c))}</td>
          </tr>
        );
      })}
      <tr className="doc-subtotal-row">
        <td colSpan={4} className="k">Subtotal</td>
        <td className="c-num v">{money(subtotal)}</td>
      </tr>
    </>
  );
}

export default InvoiceDocument;
