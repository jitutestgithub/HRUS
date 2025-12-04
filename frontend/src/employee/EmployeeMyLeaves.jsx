import React, { useEffect, useState } from "react";
import api from "../api";
import EmployeeLayout from "./EmployeeLayout";

export default function EmployeeMyLeaves() {
  const [loading, setLoading] = useState(true);
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [date, setDate] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/leaves/my");
      setLeaves(res.data);
      setFilteredLeaves(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const filterByDate = async () =>  
  {
    if (!date) {
      setFilteredLeaves(leaves);
      return;
    }

    try {
      const res = await api.get(`/leaves/my/${date}`);
      setFilteredLeaves(res.data);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toISOString().split("T")[0];
  };

  const statusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700 border-green-300";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
    }
  };

  // Separate tables
  const pending = filteredLeaves.filter((l) => l.status === "pending");
  const approved = filteredLeaves.filter((l) => l.status === "approved");
  const rejected = filteredLeaves.filter((l) => l.status === "rejected");

  // Pagination function
  const paginate = (data) => {
    const startIndex = (currentPage - 1) * pageSize;
    return data.slice(startIndex, startIndex + pageSize);
  };

  return (
    <EmployeeLayout>
      <h1 className="text-2xl font-bold mb-6">My Leaves</h1>

      {/* Filter */}
      <div className="flex items-center gap-4 mb-6">
        <input
          type="date"
          className="border p-2 rounded"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={filterByDate}
        >
          Filter
        </button>

        <button
          className="px-4 py-2 bg-gray-500 text-white rounded"
          onClick={() => {
            setDate("");
            setFilteredLeaves(leaves);
          }}
        >
          Reset
        </button>
      </div>

      {/* Pending Table */}
      <h2 className="text-xl font-semibold my-4">Pending Leaves</h2>
      <div className="bg-white p-6 shadow rounded overflow-auto mb-10">
        {loading ? (
          <p>Loading...</p>
        ) : pending.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No pending records.</p>
        ) : (
          <>
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Leave Type</th>
                  <th className="p-2 border">From</th>
                  <th className="p-2 border">To</th>
                  <th className="p-2 border">Reason</th>
                  <th className="p-2 border">Status</th>
                </tr>
              </thead>

              <tbody>
                {paginate(pending).map((leave) => (
                  <tr key={leave.id} className="border">
                    <td className="p-2 border">{leave.leave_type}</td>
                    <td className="p-2 border">{formatDate(leave.start_date)}</td>
                    <td className="p-2 border">{formatDate(leave.end_date)}</td>
                    <td className="p-2 border">{leave.reason}</td>
                    <td className="p-2 border">
                      <span
                        className={`px-3 py-1 rounded border text-sm font-medium ${statusColor(
                          leave.status
                        )}`}
                      >
                        {leave.status?.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-center mt-4 gap-4">
              <button
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Prev
              </button>

              <button
                disabled={currentPage * pageSize >= pending.length}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {/* Approved Table */}
      <h2 className="text-xl font-semibold my-4">Approved Leaves</h2>
      <div className="bg-white p-6 shadow rounded overflow-auto mb-10">
        {approved.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No approved records.</p>
        ) : (
          <>
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Leave Type</th>
                  <th className="p-2 border">From</th>
                  <th className="p-2 border">To</th>
                  <th className="p-2 border">Reason</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Remark</th>
                </tr>
              </thead>

              <tbody>
                {paginate(approved).map((leave) => (
                  <tr key={leave.id}>
                    <td className="p-2 border">{leave.leave_type}</td>
                    <td className="p-2 border">{formatDate(leave.start_date)}</td>
                    <td className="p-2 border">{formatDate(leave.end_date)}</td>
                    <td className="p-2 border">{leave.reason}</td>

                    <td className="p-2 border">
                      <span
                        className={`px-3 py-1 rounded border text-sm font-medium ${statusColor(
                          leave.status
                        )}`}
                      >
                        {leave.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="p-2 border text-sm">
                      {leave.remark ?? "No remark"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-center mt-4 gap-4">
              <button
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Prev
              </button>

              <button
                disabled={currentPage * pageSize >= approved.length}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {/* Rejected Table */}
      <h2 className="text-xl font-semibold my-4">Rejected Leaves</h2>
      <div className="bg-white p-6 shadow rounded overflow-auto mb-10">
        {rejected.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No rejected records.</p>
        ) : (
          <>
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Leave Type</th>
                  <th className="p-2 border">From</th>
                  <th className="p-2 border">To</th>
                  <th className="p-2 border">Reason</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Remark</th>
                </tr>
              </thead>

              <tbody>
                {paginate(rejected).map((leave) => (
                  <tr key={leave.id}>
                    <td className="p-2 border">{leave.leave_type}</td>
                    <td className="p-2 border">{formatDate(leave.start_date)}</td>
                    <td className="p-2 border">{formatDate(leave.end_date)}</td>
                    <td className="p-2 border">{leave.reason}</td>

                    <td className="p-2 border">
                      <span
                        className={`px-3 py-1 rounded border text-sm font-medium ${statusColor(
                          leave.status
                        )}`}
                      >
                        {leave.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="p-2 border text-sm">
                      {leave.remark ?? "No remark"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-center mt-4 gap-4">
              <button
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Prev
              </button>

              <button
                disabled={currentPage * pageSize >= rejected.length}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </EmployeeLayout>
  );
}
