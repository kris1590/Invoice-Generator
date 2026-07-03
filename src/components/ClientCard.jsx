import { useState } from "react";
import Dropdown from "./Dropdown";
import { money, lineTotal, syncDates } from "../utils";

export default function ClientCard({ client, onChange, onRemove }) {
  const [collapsed, setCollapsed] = useState(false);
  // Update a field; keep the dates array in sync when session count changes.
  const set = (patch) => {
    const next = { ...client, ...patch };
    if ("sessions" in patch) next.dates = syncDates(next);
    onChange(next);
  };

  const setDate = (i, val) => {
    const dates = client.dates.slice();
    dates[i] = val;
    onChange({ ...client, dates });
  };

  const sessions = Math.max(0, parseInt(client.sessions, 10) || 0);

  return (
    <div className={"client-card" + (collapsed ? " collapsed" : "")}>
      <div className="client-head no-print">
        <button
          type="button"
          className="cc-toggle"
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? "Expand" : "Collapse"}
        >
          <svg
            className="cc-chev"
            width="12"
            height="8"
            viewBox="0 0 12 8"
            fill="none"
            style={{ transform: collapsed ? "rotate(-90deg)" : "none" }}
          >
            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="cc-name">{client.name || "Unnamed client"}</span>
        </button>
        <span className="cc-total">{money(lineTotal(client))}</span>
      </div>

      {collapsed ? null : (
      <>
      <div className="client-grid">
        <div className="fg">
          <label>Client Name</label>
          <input
            type="text"
            placeholder="Full name"
            value={client.name}
            onChange={(e) => set({ name: e.target.value })}
          />
        </div>
        <div className="fg">
          <label>Paid By</label>
          <Dropdown
            value={client.paidBy}
            options={["Client", "Other"]}
            onChange={(v) => set({ paidBy: v })}
          />
        </div>
        <div className="fg">
          <label>Mode of Payment</label>
          <Dropdown
            value={client.mode}
            options={["Bank transfer", "UPI", "Paypal", "Other"]}
            onChange={(v) => set({ mode: v })}
          />
        </div>
        <div className="fg">
          <label>Amount / Session (₹)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            value={client.rate}
            onChange={(e) => set({ rate: e.target.value })}
          />
        </div>
        <div className="fg">
          <label>No. of Sessions</label>
          <input
            type="number"
            min="0"
            step="1"
            value={client.sessions}
            onChange={(e) => set({ sessions: e.target.value })}
          />
        </div>
        <div className="fg">
          <label>Track By</label>
          <Dropdown
            value={client.trackBy}
            options={["Date of Session", "Date of Payment"]}
            onChange={(v) => set({ trackBy: v })}
          />
        </div>
      </div>

      {sessions > 0 && (
        <div className="dates-wrap">
          <div className="dl-label">{client.trackBy} Dates</div>
          <div className="dates-grid">
            {Array.from({ length: sessions }).map((_, i) => (
              <div className="di" key={i}>
                <span>#{i + 1}</span>
                <input
                  type="date"
                  value={client.dates[i] || ""}
                  onChange={(e) => setDate(i, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="client-foot">
        <div className="line-total">
          <span className="lt-label">Line Total</span>
          <span>{money(lineTotal(client))}</span>
        </div>
        <button className="small ghost-danger no-print" onClick={onRemove}>
          Remove client
        </button>
      </div>
      </>
      )}
    </div>
  );
}
