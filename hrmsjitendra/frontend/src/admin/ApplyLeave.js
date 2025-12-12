import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function ApplyLeave() {
  const navigate = useNavigate();
  const [msg, setMsg] = useState("");

  const [lv, setLv] = useState({
    leave_type: "casual",
    start_date: "",
    end_date: "",
    reason: "",
  });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/leaves", lv);
      navigate("/leaves");
    } catch (err) {
      console.error("APPLY ERROR:", err);
      setMsg("Failed to apply leave");
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Apply Leave</h2>

      {msg && <p className="bg-red-100 text-red-700 p-3 rounded">{msg}</p>}

      <form
        onSubmit={submit}
        className="bg-white shadow border p-6 rounded-xl space-y-4"
      >
        <div>
          <label className="text-sm text-slate-600">Leave Type</label>
          <select
            className="w-full border rounded p-2 focus:ring-2 focus:ring-indigo-400"
            value={lv.leave_type}
            onChange={(e) => setLv({ ...lv, leave_type: e.target.value })}
          >
            <option value="casual">Casual Leave</option>
            <option value="sick">Sick Leave</option>
            <option value="earned">Earned Leave</option>
            <option value="unpaid">Unpaid Leave</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="date"
            label="Start Date"
            value={lv.start_date}
            onChange={(v) => setLv({ ...lv, start_date: v })}
          />
          <Input
            type="date"
            label="End Date"
            value={lv.end_date}
            onChange={(v) => setLv({ ...lv, end_date: v })}
          />
        </div>

        <div>
          <label className="text-sm text-slate-600">Reason</label>
          <textarea
            className="w-full border rounded p-2 h-24 focus:ring-2 focus:ring-indigo-400"
            value={lv.reason}
            onChange={(e) => setLv({ ...lv, reason: e.target.value })}
          ></textarea>
        </div>

        <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
          Apply
        </button>
      </form>
    </div>
  );
}

function Input({ label, value, type = "text", onChange }) {
  return (
    <div>
      <label className="text-sm text-slate-600">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded p-2 focus:ring-2 focus:ring-indigo-400"
      />
    </div>
  );
}
