import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function LeavesList() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaves();
  }, []);

  const loadLeaves = async () => {
    try {
      const res = await api.get("/leaves");
      setLeaves(res.data);
      setLoading(false);
    } catch (err) {
      console.error("LEAVES LOAD ERROR:", err);
    }
  };

  const statusBadge = (status) => {
    const map = {
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-emerald-100 text-emerald-700",
      rejected: "bg-red-100 text-red-700",
    };
    return map[status] || "bg-gray-100 text-gray-700";
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Leave Requests</h2>

        <Link
          to="/leaves/apply"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700"
        >
          Apply Leave
        </Link>
      </div>

      <div className="bg-white shadow border rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-100 border-b">
            <tr>
              <th className="p-3">Employee</th>
              <th className="p-3">Leave Type</th>
              <th className="p-3">Dates</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {leaves.map((lv) => (
              <tr key={lv.id} className="border-b hover:bg-slate-50">
                <td className="p-3 font-medium">{lv.employee_name}</td>

                <td className="p-3 capitalize">{lv.leave_type}</td>

                <td className="p-3">
                  {lv.start_date} → {lv.end_date}
                </td>

                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${statusBadge(
                      lv.status
                    )}`}
                  >
                    {lv.status}
                  </span>
                </td>

                <td className="p-3 text-right">
                  <Link
                    to={`/leaves/${lv.id}`}
                    className="text-indigo-600 hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {leaves.length === 0 && (
          <p className="text-center py-6 text-slate-500">
            No leave requests found.
          </p>
        )}
      </div>
    </div>
  );
}
