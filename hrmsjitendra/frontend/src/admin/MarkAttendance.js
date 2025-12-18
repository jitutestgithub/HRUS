import React, { useState } from "react";
import api from "../api";

export default function MarkAttendance() {
  const [msg, setMsg] = useState("");

  const checkIn = async () => {
    try {
      const res = await api.post("/attendance/checkin");
      setMsg(res.data.message);
    } catch (err) {
      console.error("CHECK-IN ERROR", err);
      setMsg(err.response?.data?.message || "Check-in failed");
    }
  };

  const checkOut = async () => {
    try {
      const res = await api.post("/attendance/checkout");
      setMsg(res.data.message);
    } catch (err) {
      console.error("CHECK-OUT ERROR", err);
      setMsg(err.response?.data?.message || "Check-out failed");
    }
  };

  return (
    <div className="p-6 bg-white shadow rounded-xl space-y-4">
      <h2 className="text-xl font-bold mb-4">Mark Attendance</h2>

      <button
        onClick={checkIn}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        Check-In
      </button>

      <button
        onClick={checkOut}
        className="px-4 py-2 bg-blue-600 text-white rounded ml-3"
      >
        Check-Out
      </button>

      {msg && <p className="text-sm text-slate-700 mt-3">{msg}</p>}
    </div>
  );
}
