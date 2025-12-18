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

  const filterByDate = async () => {
    if (!date) {
      setFilteredLeaves(leaves);
      setCurrentPage(1);
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
        return "bg-green-200 text-green-900";
      case "rejected":
        return "bg-red-200 text-red-900";
      default:
        // pending
        return "bg-yellow-200 text-yellow-900";
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Leaves</h1>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-3 mb-6 bg-white p-4 shadow-sm rounded-xl border border-gray-100">
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-500 mb-1">
            Filter by Date
          </label>
          <input
            type="date"
            className="border px-3 py-2 rounded-md text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-500 outline-none"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="flex gap-2 mt-2 sm:mt-6">
          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 transition text-white rounded-md shadow text-sm"
            onClick={filterByDate}
          >
            Filter
          </button>

          <button
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 transition text-white rounded-md shadow text-sm"
            onClick={() => {
              setDate("");
              setFilteredLeaves(leaves);
              setCurrentPage(1);
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Pending Table */}
      <h2 className="text-xl font-semibold my-4 text-gray-800">
        Pending Leaves
      </h2>
      <div className="bg-white p-6 shadow-sm rounded-xl border border-gray-100 overflow-auto mb-10">
        {loading ? (
          <p className="text-center text-gray-500 py-4 text-sm">
            Loading...
          </p>
        ) : pending.length === 0 ? (
          <p className="text-gray-500 text-center py-4 text-sm">
            No pending records.
          </p>
        ) : (
          <>
            <table className="w-full min-w-[900px] border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 border bg-gray-100 font-semibold text-gray-700 text-left">
                    Leave Type
                  </th>
                  <th className="p-3 border bg-gray-100 font-semibold text-gray-700 text-left">
                    From
                  </th>
                  <th className="p-3 border bg-gray-100 font-semibold text-gray-700 text-left">
                    To
                  </th>
                  <th className="p-3 border bg-gray-100 font-semibold text-gray-700 text-left">
                    Reason
                  </th>
                  <th className="p-3 border bg-gray-100 font-semibold text-gray-700 text-left">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginate(pending).map((leave) => (
                  <tr
                    key={leave.id}
                    className="border hover:bg-gray-50 transition"
                  >
                    <td className="p-3 border text-gray-700">
                      {leave.leave_type}
                    </td>
                    <td className="p-3 border text-gray-700">
                      {formatDate(leave.start_date)}
                    </td>
                    <td className="p-3 border text-gray-700">
                      {formatDate(leave.end_date)}
                    </td>
                    <td className="p-3 border text-gray-700">
                      {leave.reason}
                    </td>
                    <td className="p-3 border">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${statusColor(
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
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 transition rounded shadow disabled:opacity-50 text-sm"
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Prev
              </button>

              <button
                disabled={currentPage * pageSize >= pending.length}
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 transition rounded shadow disabled:opacity-50 text-sm"
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {/* Approved Table */}
      <h2 className="text-xl font-semibold my-4 text-gray-800">
        Approved Leaves
      </h2>
      <div className="bg-white p-6 shadow-sm rounded-xl border border-gray-100 overflow-auto mb-10">
        {approved.length === 0 ? (
          <p className="text-gray-500 text-center py-4 text-sm">
            No approved records.
          </p>
        ) : (
          <>
            <table className="w-full min-w-[900px] border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 border bg-gray-100 font-semibold text-gray-700 text-left">
                    Leave Type
                  </th>
                  <th className="p-3 border bg-gray-100 font-semibold text-gray-700 text-left">
                    From
                  </th>
                  <th className="p-3 border bg-gray-100 font-semibold text-gray-700 text-left">
                    To
                  </th>
                  <th className="p-3 border bg-gray-100 font-semibold text-gray-700 text-left">
                    Reason
                  </th>
                  <th className="p-3 border bg-gray-100 font-semibold text-gray-700 text-left">
                    Status
                  </th>
                  <th className="p-3 border bg-gray-100 font-semibold text-gray-700 text-left">
                    Remark
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginate(approved).map((leave) => (
                  <tr
                    key={leave.id}
                    className="border hover:bg-gray-50 transition"
                  >
                    <td className="p-3 border text-gray-700">
                      {leave.leave_type}
                    </td>
                    <td className="p-3 border text-gray-700">
                      {formatDate(leave.start_date)}
                    </td>
                    <td className="p-3 border text-gray-700">
                      {formatDate(leave.end_date)}
                    </td>
                    <td className="p-3 border text-gray-700">
                      {leave.reason}
                    </td>

                    <td className="p-3 border">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${statusColor(
                          leave.status
                        )}`}
                      >
                        {leave.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="p-3 border text-sm text-gray-700">
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
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 transition rounded shadow disabled:opacity-50 text-sm"
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Prev
              </button>

              <button
                disabled={currentPage * pageSize >= approved.length}
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 transition rounded shadow disabled:opacity-50 text-sm"
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {/* Rejected Table */}
      <h2 className="text-xl font-semibold my-4 text-gray-800">
        Rejected Leaves
      </h2>
      <div className="bg-white p-6 shadow-sm rounded-xl border border-gray-100 overflow-auto mb-10">
        {rejected.length === 0 ? (
          <p className="text-gray-500 text-center py-4 text-sm">
            No rejected records.
          </p>
        ) : (
          <>
            <table className="w-full min-w-[900px] border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 border bg-gray-100 font-semibold text-gray-700 text-left">
                    Leave Type
                  </th>
                  <th className="p-3 border bg-gray-100 font-semibold text-gray-700 text-left">
                    From
                  </th>
                  <th className="p-3 border bg-gray-100 font-semibold text-gray-700 text-left">
                    To
                  </th>
                  <th className="p-3 border bg-gray-100 font-semibold text-gray-700 text-left">
                    Reason
                  </th>
                  <th className="p-3 border bg-gray-100 font-semibold text-gray-700 text-left">
                    Status
                  </th>
                  <th className="p-3 border bg-gray-100 font-semibold text-gray-700 text-left">
                    Remark
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginate(rejected).map((leave) => (
                  <tr
                    key={leave.id}
                    className="border hover:bg-gray-50 transition"
                  >
                    <td className="p-3 border text-gray-700">
                      {leave.leave_type}
                    </td>
                    <td className="p-3 border text-gray-700">
                      {formatDate(leave.start_date)}
                    </td>
                    <td className="p-3 border text-gray-700">
                      {formatDate(leave.end_date)}
                    </td>
                    <td className="p-3 border text-gray-700">
                      {leave.reason}
                    </td>

                    <td className="p-3 border">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${statusColor(
                          leave.status
                        )}`}
                      >
                        {leave.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="p-3 border text-sm text-gray-700">
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
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 transition rounded shadow disabled:opacity-50 text-sm"
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Prev
              </button>

              <button
                disabled={currentPage * pageSize >= rejected.length}
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 transition rounded shadow disabled:opacity-50 text-sm"
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
