export const SECTIONS = ["somatic", "consultation"];

export const SECTION_TITLES = {
  somatic: "Somatic Individual Therapy Session",
  consultation: "Consultation for Somatic Individual Therapy",
};

export const money = (n) =>
  "₹" +
  (Number(n) || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export function todayISO() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

let counter = 0;
export function uid() {
  counter += 1;
  return "c_" + Date.now().toString(36) + "_" + counter.toString(36);
}

export function newClient(overrides = {}) {
  return {
    id: uid(),
    name: "",
    paidBy: "Client",
    mode: "Bank transfer",
    rate: "",
    sessions: 1,
    trackBy: "Date of Session",
    dates: [],
    ...overrides,
  };
}

// Resize a client's dates array to match its session count, preserving entries.
export function syncDates(client) {
  const n = Math.max(0, parseInt(client.sessions, 10) || 0);
  const dates = [];
  for (let i = 0; i < n; i++) dates.push(client.dates[i] || "");
  return dates;
}

export function lineTotal(client) {
  const rate = Number(client.rate) || 0;
  const sessions = parseInt(client.sessions, 10) || 0;
  return rate * sessions;
}

export function computeTotals(invoice) {
  const subtotals = {};
  let gross = 0;
  SECTIONS.forEach((section) => {
    const sub = (invoice.sections[section] || []).reduce(
      (acc, c) => acc + lineTotal(c),
      0
    );
    subtotals[section] = sub;
    gross += sub;
  });
  const fee = gross * 0.15;
  return { subtotals, gross, fee, net: gross - fee };
}

export function emptyInvoice(invNum) {
  return {
    invNum: String(invNum ?? "2"),
    invDate: todayISO(),
    therapistName: "Anusha B.M",
    notes: "",
    sections: {
      somatic: [newClient()],
      consultation: [],
    },
  };
}

// Normalize a stored/loaded invoice so every client has ids and array dates.
export function normalizeInvoice(data) {
  const inv = emptyInvoice(data?.invNum);
  inv.invNum = data?.invNum ?? inv.invNum;
  inv.invDate = data?.invDate || inv.invDate;
  inv.therapistName = data?.therapistName ?? inv.therapistName;
  inv.notes = data?.notes || "";
  SECTIONS.forEach((section) => {
    const rows = (data?.sections && data.sections[section]) || [];
    inv.sections[section] = rows.map((r) =>
      newClient({
        name: r.name || "",
        paidBy: r.paidBy || "Client",
        mode: r.mode || "Bank transfer",
        rate: r.rate ?? "",
        sessions: r.sessions ?? 1,
        trackBy: r.trackBy || "Date of Session",
        dates: Array.isArray(r.dates) ? r.dates : [],
      })
    );
  });
  return inv;
}
