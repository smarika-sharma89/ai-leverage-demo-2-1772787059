import { useState } from "react";

const APPROVERS = [
  { id: "a1", name: "Sarah Mitchell" },
  { id: "a2", name: "James Okafor" },
  { id: "a3", name: "Linda Tran" },
];

const INITIAL_BILLS = [
  {
    id: "BILL-001",
    vendor: "Acme Civil Works",
    amount: 14200.0,
    gstOverride: null,
    subtotal: 12909.09,
    gst: 1290.91,
    approvals: { a1: true, a2: true, a3: true },
    wbs: "WBS-001",
    xeroSynced: true,
    notes: [{ ts: "2024-06-01 09:12", user: "Sarah Mitchell", text: "Checked against PO. All good." }],
  },
  {
    id: "BILL-002",
    vendor: "Ridgeline Earthmoving",
    amount: 8750.0,
    gstOverride: null,
    subtotal: 7954.55,
    gst: 795.45,
    approvals: { a1: true, a2: false, a3: false },
    wbs: "WBS-002",
    xeroSynced: false,
    notes: [],
  },
  {
    id: "BILL-003",
    vendor: "Stormtech Drainage",
    amount: 22100.0,
    gstOverride: null,
    subtotal: 20090.91,
    gst: 2009.09,
    approvals: { a1: true, a2: true, a3: false },
    wbs: "WBS-003",
    xeroSynced: false,
    notes: [{ ts: "2024-06-03 14:45", user: "James Okafor", text: "Awaiting site confirmation from Linda." }],
  },
  {
    id: "BILL-004",
    vendor: "BlueScope Supplies",
    amount: 5400.0,
    gstOverride: null,
    subtotal: 4909.09,
    gst: 490.91,
    approvals: { a1: false, a2: false, a3: false },
    wbs: "WBS-001",
    xeroSynced: false,
    notes: [],
  },
  {
    id: "BILL-005",
    vendor: "Precision Concreting",
    amount: 31600.0,
    gstOverride: null,
    subtotal: 28727.27,
    gst: 2872.73,
    approvals: { a1: true, a2: false, a3: false },
    wbs: "WBS-004",
    xeroSynced: false,
    notes: [],
  },
];

const CHARGE_RATES = [
  { id: "cr1", category: "Labour - Supervisor", unit: "Hour", rate: 125.0 },
  { id: "cr2", category: "Labour - General", unit: "Hour", rate: 88.0 },
  { id: "cr3", category: "Plant - Excavator", unit: "Hour", rate: 210.0 },
  { id: "cr4", category: "Plant - Truck", unit: "Hour", rate: 145.0 },
  { id: "cr5", category: "Materials - Aggregate", unit: "Tonne", rate: 62.0 },
];

function getApprovalStatus(approvals) {
  const done = Object.values(approvals).filter(Boolean).length;
  if (done === 0) return { label: "Awaiting Approval", color: "bg-yellow-100 text-yellow-800" };
  if (done === 1) return { label: "Partially Approved – Awaiting Approver 2", color: "bg-orange-100 text-orange-800" };
  if (done === 2) return { label: "Partially Approved – Awaiting Final Approval", color: "bg-blue-100 text-blue-800" };
  return { label: "Fully Approved", color: "bg-green-100 text-green-800" };
}

function getNextApprover(approvals) {
  const order = ["a1", "a2", "a3"];
  const next = order.find((id) => !approvals[id]);
  return next ? APPROVERS.find((a) => a.id === next) : null;
}

export default function ApprovalStatusVisibility() {
  const [bills, setBills] = useState(INITIAL_BILLS);
  const [selectedBill, setSelectedBill] = useState(null);
  const [filterApprover, setFilterApprover] = useState("all");
  const [activeTab, setActiveTab] = useState("bills");
  const [newNote, setNewNote] = useState("");
  const [gstEdit, setGstEdit] = useState("");
  const [toast, setToast] = useState(null);
  const [chargeRates, setChargeRates] = useState(CHARGE_RATES);
  const [editingRate, setEditingRate] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filteredBills = bills.filter((b) => {
    if (filterApprover === "all") return true;
    const approvedByFilter = b.approvals[filterApprover];
    const approverIndex = APPROVERS.findIndex((a) => a.id === filterApprover);
    const previousApproved = APPROVERS.slice(0, approverIndex).every((a) => b.approvals[a.id]);
    return previousApproved && !approvedByFilter;
  });

  const handleApprove = (billId, approverId) => {
    setBills((prev) =>
      prev.map((b) =>
        b.id === billId ? { ...b, approvals: { ...b.approvals, [approverId]: true } } : b
      )
    );
    if (selectedBill?.id === billId) {
      setSelectedBill((prev) => ({ ...prev, approvals: { ...prev.approvals, [approverId]: true } }));
    }
    showToast("Approval recorded successfully.");
  };

  const handleSyncXero = (billId) => {
    setBills((prev) => prev.map((b) => (b.id === billId ? { ...b, xeroSynced: true } : b)));
    if (selectedBill?.id === billId) setSelectedBill((prev) => ({ ...prev, xeroSynced: true }));
    showToast("Synced to Xero successfully.");
  };

  const handleSaveGst = () => {
    const val = parseFloat(gstEdit);
    if (isNaN(val)) return;
    setBills((prev) => prev.map((b) => (b.id === selectedBill.id ? { ...b, gstOverride: val } : b)));
    setSelectedBill((prev) => ({ ...prev, gstOverride: val }));
    showToast("GST figure updated.");
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const note = {
      ts: new Date().toLocaleString("en-AU", { hour12: false }).replace(",", ""),
      user: "You",
      text: newNote.trim(),
    };
    setBills((prev) =>
      prev.map((b) => (b.id === selectedBill.id ? { ...b, notes: [...b.notes, note] } : b))
    );
    setSelectedBill((prev) => ({ ...prev, notes: [...prev.notes, note] }));
    setNewNote("");
    showToast("Note added (internal only – not printed).");
  };

  const handleCopyWbs = () => {
    if (!selectedBill) return;
    setBills((prev) => prev.map((b) => (b.id === selectedBill.id ? { ...b, wbs: selectedBill.wbs } : b)));
    showToast("WBS copied across all lines.");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-sm relative">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-[#0ea5e9] text-white px-4 py-2 rounded-lg shadow-lg font-medium">
          {toast}
        </div>
      )}

      <div className="flex h-screen overflow-hidden">
        <aside className="w-56 bg-[#0a0a0a] text-white flex flex-col p-4 gap-2 flex-shrink-0">
          <div className="text-lg font-bold text-[#0ea5e9] mb-4">Varicon</div>
          {["bills", "dayworks", "chargerates"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-left px-3 py-2 rounded-lg font-medium capitalize transition-colors ${activeTab === tab ? "bg-[#0ea5e9] text-white" : "text-gray-400 hover:bg-gray-800"}`}
            >
              {tab === "bills" ? "Bill Approvals" : tab === "dayworks" ? "Day Works" : "Charge Rates"}
            </button>
          ))}
        </aside>

        <main className="flex-1 overflow-auto p-6 bg-white">
          {activeTab === "bills" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold">Bill Approvals</h1>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Filter by approver pending:</span>
                  <select
                    className="border rounded-lg px-3 py-1.5 text-sm"
                    value={filterApprover}
                    onChange={(e) => setFilterApprover(e.target.value)}
                  >
                    <option value="all">All Bills</option>
                    {APPROVERS.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border rounded-lg shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      {["Bill ID", "Vendor", "Amount", "GST", "Status", "Next Approver", "Xero", "Actions"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBills.map((bill) => {
                      const status = getApprovalStatus(bill.approvals);
                      const next = getNextApprover(bill.approvals);
                      return (
                        <tr
                          key={bill.id}
                          className="border-b hover:bg-gray-50 cursor-pointer"
                          onClick={() => { setSelectedBill(bill); setGstEdit(String(bill.gstOverride ?? bill.gst)); }}
                        >
                          <td className="px-4 py-3 font-medium text-[#0ea5e9]">{bill.id}</td>
                          <td className="px-4 py-3">{bill.vendor}</td>
                          <td className="px-4 py-3">${bill.amount.toLocaleString()}</td>
                          <td className="px-4 py-3">${(bill.gstOverride ?? bill.gst).toFixed(2)}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>{status.label}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{next ? next.name : "—"}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${bill.xeroSynced ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                              {bill.xeroSynced ? "Synced" : "Pending"}
                            </span>
                          </td>
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            {!bill.xeroSynced && getApprovalStatus(bill.approvals).label === "Fully Approved" && (
                              <button
                                onClick={() => handleSyncXero(bill.id)}
                                className="text-xs bg-[#0ea5e9] text-white px-3 py-1 rounded-lg hover:bg-sky-600"
                              >
                                Sync Xero
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "dayworks" && (
            <div className="space-y-4">
              <h1 className="text-xl font-bold">Day Works – Docket Notes</h1>
              <div className="border rounded-lg shadow-sm p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Docket #DW-2024-047</p>
                    <p className="text-gray-500">Submitted: 03 Jun 2024 – Ridgeline Earthmoving</p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Submitted</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Internal Audit Log (not printed on docket)</p>
                  {(bills[2]?.notes ?? []).map((n, i) => (
                    <div key={i} className="border-l-2 border-[#0ea5e9] pl-3">
                      <p className="text-xs text-gray-400">{n.ts} · {n.user}</p>
                      <p className="text-sm">{n.text}</p>
                    </div>
                  ))}
                  {(bills[2]?.notes ?? []).length === 0 && <p className="text-gray-400 text-xs">No notes yet.</p>}
                </div>
                <div className="flex gap-2">
                  <input
                    className="flex-1 border rounded-lg px-3 py-2 text-sm"
                    placeholder="Add internal note (team-visible only)..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { const note = { ts: new Date().toLocaleString(), user: "You", text: newNote.trim() }; setBills((prev) => prev.map((b, i) => i === 2 ? { ...b, notes: [...b.notes, note] } : b)); setNewNote(""); showToast("Note added (internal only)."); } }}
                  />
                  <button
                    className="bg-[#0ea5e9] text-white px-4 py-2 rounded-lg text-sm hover:bg-sky-600"
                    onClick={() => { if (!newNote.trim()) return; const note = { ts: new Date().toLocaleString(), user: "You", text: newNote.trim() }; setBills((prev) => prev.map((b, i) => i === 2 ? { ...b, notes: [...b.notes, note] } : b)); setNewNote(""); showToast("Note added (internal only)."); }}
                  >
                    Add Note
                  </button>
                </div>
                <div className="border-t pt-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Lost Time / Stand-Down</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[{ label: "Stand-Down Hours", val: "3.5 hrs" }, { label: "Reason", val: "Weather – Rain" }, { label: "Workers Affected", val: "6" }].map((f) => (
                      <div key={f.label} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <p className="text-xs text-gray-500">{f.label}</p>
                        <p className="font-medium">{f.val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "chargerates" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold">Day Works Charge Rates</h1>
                <div className="flex gap-2">
                  <label className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm cursor-pointer font-medium">
                    Upload Spreadsheet
                    <input type="file" className="hidden" onChange={() => showToast("Spreadsheet uploaded – rates updated.")} />
                  </label>
                  <button className="bg-[#0ea5e9] text-white px-3 py-1.5 rounded-lg text-sm hover:bg-sky-600" onClick={() => showToast("New rate row added.")}>
                    + Add Rate
                  </button>
                </div>
              </div>
              <div className="border rounded-lg shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      {["Category", "Unit", "Rate (excl. GST)", "Actions"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {chargeRates.map((cr) => (
                      <tr key={cr.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">{editingRate === cr.id ? <input className="border rounded px-2 py-1 w-full" defaultValue={cr.category} onBlur={(e) => setChargeRates((prev) => prev.map((r) => r.id === cr.id ? { ...r, category: e.target.value } : r))} /> : cr.category}</td>
                        <td className="px-4 py-3">{cr.unit}</td>
                        <td className="px-4 py-3">{editingRate === cr.id ? <input className="border rounded px-2 py-1 w-24" type="number" defaultValue={cr.rate} onBlur={(e) => setChargeRates((prev) => prev.map((r) => r.id === cr.id ? { ...r, rate: parseFloat(e.target.value) } : r))} /> : `$${cr.rate.toFixed(2)}`}</td>
                        <td className="px-4 py-3">
                          {editingRate === cr.id ? (
                            <button className="text-xs bg-green-500 text-white px-3 py-1 rounded-lg" onClick={() => { setEditingRate(null); showToast("Rate saved."); }}>Save</button>
                          ) : (
                            <button className="text-xs border px-3 py-1 rounded-lg hover:bg-gray-100" onClick={() => setEditingRate(cr.id)}>Edit</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {selectedBill && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={() => setSelectedBill(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4 z-50" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold">{selectedBill.id}</h2>
                <p className="text-gray-500">{selectedBill.vendor}</p>
              </div>
              <button className="text-gray-400 hover:text-gray-700 text-xl font-bold" onClick={() => setSelectedBill(null)}>×</button>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Approval Progress</p>
              {APPROVERS.map((a, i) => {
                const approved = selectedBill.approvals[a.id];
                const canApprove = i === 0 || selectedBill.approvals[APPROVERS[i - 1].id];
                return (
                  <div key={a.id} className="flex items-center justify-between border rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${approved ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>{i + 1}</span>
                      <span className="font-medium">{a.name}</span>
                    </div>
                    {approved ? (
                      <span className="text-xs text-green-600 font-medium">✓ Approved</span>
                    ) : canApprove ? (
                      <button className="text-xs bg-[#0ea5e9] text-white px-3 py-1 rounded-lg hover:bg-sky-600" onClick={() => handleApprove(selectedBill.id, a.id)}>Approve</button>
                    ) : (
                      <span className="text-xs text-gray-400">Pending</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">GST Adjustment</p>
              <div className="flex gap-2 items-center">
                <input
                  className="border rounded-lg px-3 py-2 text-sm w-32"
                  value={gstEdit}
                  onChange={(e) => setGstEdit(e.target.value)}
                />
                <button className="bg-[#0ea5e9] text-white px-3 py-2 rounded-lg text-sm hover:bg-sky-600" onClick={handleSaveGst}>Save GST</button>
                <span className="text-gray-400 text-xs">Subtotal: ${selectedBill.subtotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">WBS Assignment</p>
                <button className="text-xs border px-2 py-1 rounded hover:bg-gray-100" onClick={handleCopyWbs}>Copy to All Lines</button>
              </div>
              <input className="border rounded-lg px-3 py-2 text-sm w-full" value={selectedBill.wbs} onChange={(e) => setSelectedBill((p) => ({ ...p, wbs: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Internal Notes</p>
              {selectedBill.notes.map((n, i) => (
                <div key={i} className="border-l-2 border-[#0ea5e9] pl-3 text-sm">
                  <p className="text-xs text-gray-400">{n.ts} · {n.user}</p>
                  <p>{n.text}</p>
                </div>
              ))}
              <div className="flex gap-2">
                <input className="flex-1 border rounded-lg px-3 py-2 text-sm" placeholder="Add note..." value={newNote} onChange={(e) => setNewNote(e.target.value)} />
                <button className="bg-[#0ea5e9] text-white px-3 py-2 rounded-lg text-sm hover:bg-sky-600" onClick={handleAddNote}>Add</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}