import React, { useEffect, useState } from "react";
import api from "../api";
import Layout from "../components/Layout";

export default function AdminLeaveApproval() {
  const [loading, setLoading] = useState(true);
  const [leaves, setLeaves] = useState([]);
  const [filter, setFilter] = useState("pending");

  useEffect(() => {
    loadLeaves();
  }, [filter]);

  // Load Leaves
  const loadLeaves = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/leaves/admin?status=${filter}`);
      setLeaves(res.data);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (d) => (d ? d.split("T")[0] : "");

  // Update Status
  const updateStatus = async (id, status) => {
    const note = prompt(`Enter remark for ${status}:`) || "";

    try {
      await api.put(`/leaves/status/${id}`, {
        status,
        remark: note,
      });

      alert("Status updated successfully!");
      loadLeaves();
    } catch (err) {
      console.log(err);
      alert("Error updating status");
    }
  };

  const statusBadge = (status) => {
    const cls = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
      approved: "bg-green-100 text-green-700 border-green-300",
      rejected: "bg-red-100 text-red-700 border-red-300",
    };
    return cls[status] || "";
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Leave Approval Panel</h1>

      {/* FILTER TABS */}
      <div className="flex gap-4 mb-6">
        {["pending", "approved", "rejected"].map((s) => (
          <button
            key={s}
            className={`px-4 py-2 rounded border ${
              filter === s ? "bg-blue-600 text-white" : "bg-white"
            }`}
            onClick={() => setFilter(s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="bg-white p-6 rounded shadow w-full overflow-auto">
        {loading ? (
          <p>Loading...</p>
        ) : leaves.length === 0 ? (
          <p className="text-gray-500 text-center">No leave requests found.</p>
        ) : (
          <table className="w-full min-w-[1000px] border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Employee</th>
                <th className="p-2 border">Leave Type</th>
                <th className="p-2 border">From</th>
                <th className="p-2 border">To</th>
                <th className="p-2 border">Reason</th>
                <th className="p-2 border">Status</th>

                {/* Remark column only for Approved/Rejected */}
                {filter !== "pending" && <th className="p-2 border">Remark</th>}

                {/* Action only for Pending */}
                {filter === "pending" && <th className="p-2 border">Action</th>}
              </tr>
            </thead>

            <tbody>
              {leaves.map((lv) => (
                <tr key={lv.id} className="border">
                  <td className="p-2 border">
                    {lv.first_name} {lv.last_name}
                  </td>

                  <td className="p-2 border">{lv.leave_type}</td>
                  <td className="p-2 border">{formatDate(lv.start_date)}</td>
                  <td className="p-2 border">{formatDate(lv.end_date)}</td>
                  <td className="p-2 border">{lv.reason}</td>

                  <td className="p-2 border">
                    <span
                      className={`px-3 py-1 rounded border text-sm font-medium ${statusBadge(
                        lv.status
                      )}`}
                    >
                      {lv.status.toUpperCase()}
                    </span>
                  </td>

                  {/* REMARK only for approved/rejected */}
                  {filter !== "pending" && (
                    <td className="p-2 border text-sm">
                      {lv.remark ? (
                        <span className="text-gray-800">{lv.remark}</span>
                      ) : (
                        <span className="text-gray-400 italic">No remark</span>
                      )}
                    </td>
                  )}

                  {/* ACTION only for pending */}
                  {filter === "pending" && (
                    <td className="p-2 border">
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-1 bg-green-600 text-white rounded"
                          onClick={() => updateStatus(lv.id, "approved")}
                        >
                          Approve
                        </button>

                        <button
                          className="px-3 py-1 bg-red-600 text-white rounded"
                          onClick={() => updateStatus(lv.id, "rejected")}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
