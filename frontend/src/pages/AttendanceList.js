import React, { useEffect, useState } from "react";
import api from "../api";

export default function AttendanceList() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const loadData = async () => {
    try {
      setLoading(true);

      const res = await api.get("/admin/attendance/list");
      setRecords(res.data);

      setLoading(false);
      setCurrentPage(1);
    } catch (err) {
      console.error("ADMIN ATTENDANCE ERROR:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Pagination Logic
  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentRecords = records.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(records.length / recordsPerPage);

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const formatTime = (t) => {
    if (!t) return "--";
    return new Date(t).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Attendance List</h1>
      <p className="text-sm text-gray-500">All employee attendance records</p>

      <div className="bg-white p-4 rounded-xl shadow-lg overflow-hidden border">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-100 border-b">
            <tr>
              <Th>Employee</Th>
              <Th>Date</Th>
              <Th>Check-In</Th>
              <Th>Check-Out</Th>
              <Th>Work Minutes</Th>
              <Th>Break Minutes</Th>
              <Th>Status</Th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <Td colSpan={7} className="text-center py-8 text-gray-400">
                  Loading...
                </Td>
              </tr>
            ) : currentRecords.length === 0 ? (
              <tr>
                <Td colSpan={7} className="text-center py-8 text-gray-400">
                  No attendance found.
                </Td>
              </tr>
            ) : (
              currentRecords.map((r) => {
                const isPresent = r.total_minutes >= 480;

                return (
                  <tr key={r.id} className="border-t hover:bg-gray-50">
                    <Td>{r.first_name} {r.last_name}</Td>
                    <Td>{r.date}</Td>
                    <Td>{formatTime(r.check_in)}</Td>
                    <Td>{formatTime(r.check_out)}</Td>

                    {/* WORK MINUTES */}
                    <Td className="font-semibold text-blue-600">
                      {r.total_minutes} min
                    </Td>

                    {/* BREAK MINUTES */}
                    <Td className="font-semibold text-red-600">
                      {r.break_minutes || 0} min
                    </Td>

                    {/* STATUS */}
                    <Td>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          isPresent
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {isPresent ? "Present" : "Absent"}
                      </span>
                    </Td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            className={`px-4 py-2 border rounded-md text-sm ${
              currentPage === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "hover:bg-gray-100"
            }`}
            onClick={() => changePage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => changePage(i + 1)}
              className={`px-4 py-2 border rounded-md text-sm ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            className={`px-4 py-2 border rounded-md text-sm ${
              currentPage === totalPages
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "hover:bg-gray-100"
            }`}
            onClick={() => changePage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="px-4 py-2 text-left text-[11px] uppercase font-semibold tracking-wide text-gray-600">
      {children}
    </th>
  );
}

function Td({ children, colSpan, className = "" }) {
  return (
    <td
      colSpan={colSpan}
      className={`px-4 py-2 text-sm text-gray-700 align-middle ${className}`}
    >
      {children}
    </td>
  );
}
