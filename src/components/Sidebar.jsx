import { money } from "../utils";

export default function Sidebar({ saved, currentId, onSelect, onDelete }) {
  return (
    <>
      <aside className="sidebar no-print">
        <div className="sb-head">Saved Invoices</div>
        <div className="sb-list">
          {saved.length === 0 && (
            <div className="sb-empty">
              No saved invoices yet. Click Save to store one.
            </div>
          )}
          {saved.map((entry) => {
            const d = entry.data || {};
            const when = entry.savedAt ? new Date(entry.savedAt) : null;
            const whenStr =
              when && !isNaN(when)
                ? when.toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "";
            return (
              <div
                key={entry.id}
                className={"sb-item" + (entry.id === currentId ? " active" : "")}
                onClick={() => onSelect(entry)}
              >
                <div className="si-title">Invoice #{d.invNum || "—"}</div>
                <div className="si-sub">{d.invDate || "no date"}</div>
                <div className="si-total">Net {money(entry.net ?? 0)}</div>
                <div className="si-sub">Saved {whenStr}</div>
                <button
                  className="si-del"
                  title="Delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(entry);
                  }}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      </aside>
      <div
        className="sb-overlay no-print"
        onClick={() => document.body.classList.remove("sidebar-open")}
      />
    </>
  );
}
