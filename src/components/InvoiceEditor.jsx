import ClientCard from "./ClientCard";
import { SECTIONS, SECTION_TITLES, money, computeTotals, newClient } from "../utils";

export default function InvoiceEditor({ invoice, setInvoice, pageRef }) {
  const setField = (patch) => setInvoice({ ...invoice, ...patch });

  const setSection = (section, clients) =>
    setInvoice({
      ...invoice,
      sections: { ...invoice.sections, [section]: clients },
    });

  const addClient = (section) =>
    setSection(section, [...(invoice.sections[section] || []), newClient()]);

  const updateClient = (section, id, next) =>
    setSection(
      section,
      invoice.sections[section].map((c) => (c.id === id ? next : c))
    );

  const removeClient = (section, id) =>
    setSection(
      section,
      invoice.sections[section].filter((c) => c.id !== id)
    );

  const { subtotals, gross, fee, net } = computeTotals(invoice);

  return (
    <div className="page" id="page" ref={pageRef}>
      <header className="inv-head">
        <div>
          <h1 className="inv-title">INVOICE</h1>
          <div style={{ fontSize: 14, color: "var(--muted)", marginTop: 4 }}>
            Anusha B.M
          </div>
        </div>
        <div className="inv-meta">
          <div className="field">
            <label>Invoice No.</label>
            <input
              type="text"
              className="inv-num"
              value={invoice.invNum}
              onChange={(e) => setField({ invNum: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Date</label>
            <input
              type="date"
              value={invoice.invDate}
              onChange={(e) => setField({ invDate: e.target.value })}
            />
          </div>
        </div>
      </header>

      <div className="parties">
        <div className="party">
          <h3>Billed To</h3>
          <div className="box">
            <div className="name">Manushee</div>
            <div>Plot No. 55, IP Extension</div>
            <div>Delhi 110092</div>
          </div>
        </div>
        <div className="party">
          <h3>Payable To</h3>
          <div className="box">
            <div className="name">Anusha B.M</div>
            <div className="row"><span className="k">Account No.</span><span>50100722584595</span></div>
            <div className="row"><span className="k">IFSC Code</span><span>HDFC0004051</span></div>
            <div className="row"><span className="k">PAN No.</span><span>AUQPA7613P</span></div>
          </div>
        </div>
      </div>

      {SECTIONS.map((section, idx) => {
        const clients = invoice.sections[section] || [];
        return (
          <section className="inv-section" key={section}>
            <div className="sec-head">
              <h2>
                {idx + 1} &nbsp;·&nbsp; {SECTION_TITLES[section]}
              </h2>
              <button
                className="small no-print"
                onClick={() => addClient(section)}
              >
                ＋ Add Client
              </button>
            </div>
            <div className="clients">
              {clients.length === 0 && (
                <div className="empty-hint no-print">
                  No clients yet — use “＋ Add Client”.
                </div>
              )}
              {clients.map((c) => (
                <ClientCard
                  key={c.id}
                  client={c}
                  onChange={(next) => updateClient(section, c.id, next)}
                  onRemove={() => removeClient(section, c.id)}
                />
              ))}
            </div>
          </section>
        );
      })}

      <div className="totals">
        <table>
          <tbody>
            <tr>
              <td className="k">Somatic Therapy Subtotal</td>
              <td className="v">{money(subtotals.somatic)}</td>
            </tr>
            <tr>
              <td className="k">Consultation Subtotal</td>
              <td className="v">{money(subtotals.consultation)}</td>
            </tr>
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

      <div className="notes">
        <label style={{ display: "block", marginBottom: 6, fontSize: 11, textTransform: "uppercase", letterSpacing: ".4px" }}>
          Notes
        </label>
        <textarea
          placeholder="Optional notes (payment terms, thank-you message, etc.)"
          value={invoice.notes}
          onChange={(e) => setField({ notes: e.target.value })}
        />
      </div>
    </div>
  );
}
