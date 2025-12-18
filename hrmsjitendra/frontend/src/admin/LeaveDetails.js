import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";

export default function LeaveDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lv, setLv] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeave();
  }, []);

  const loadLeave = async () => {
    try {
      const res = await api.get(`/leaves/${id}`);
      setLv(res.data);
      setLoading(false);
    } catch (err) {
      console.error("DETAIL ERROR:", err);
    }
  };

  const updateStatus = async (status) => {
    try {
      await api.put(`/leaves/${id}`, { status });
      navigate("/leaves");
    } catch (err) {
      console.error("STATUS UPDATE ERROR:", err);
    }
  };

  if (loading || !lv) return <p>Loading...</p>;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Leave Request</h2>

      <div className="bg-white shadow border rounded-xl p-6 space-y-3">
        <p><strong>Employee:</strong> {lv.employee_name}</p>
        <p><strong>Type:</strong> {lv.leave_type}</p>
        <p>
          <strong>Dates:</strong> {lv.start_date} → {lv.end_date}
        </p>
        <p><strong>Reason:</strong> {lv.reason}</p>
        <p><strong>Status:</strong> {lv.status}</p>
      </div>

      {/* Approve/Reject */}
      {lv.status === "pending" && (
        <div className="flex gap-4">
          <button
            onClick={() => updateStatus("approved")}
            className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700"
          >
            Approve
          </button>
          <button
            onClick={() => updateStatus("rejected")}
            className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
