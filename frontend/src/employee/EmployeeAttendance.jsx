import React, { useEffect, useState } from "react";
import api from "../api";
import EmployeeLayout from "./EmployeeLayout";

export default function EmployeeAttendance() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [date, setDate] = useState("");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/attendance/history");
      setRecords(res.data);
      setLoading(false);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const filterByDate = async () => {
    try {
      if (!date) return load();
      const res = await api.get(`/attendance/date/${date}`);
      setRecords(res.data);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <EmployeeLayout>
        <div className="text-center py-10 text-lg font-semibold">
          Loading attendance...
        </div>
      </EmployeeLayout>
    );
  }

  // Pagination Logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = records.slice(indexOfFirstRecord, indexOfLastRecord);

  const totalPages = Math.ceil(records.length / recordsPerPage);

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <EmployeeLayout>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">My Attendance</h1>

      {/* DATE FILTER */}
      <div className="flex flex-wrap items-center gap-4 mb-6 bg-white p-4 rounded-xl shadow">
        <input
          type="date"
          className="border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <button
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          onClick={filterByDate}
        >
          Filter
        </button>

        <button
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition"
          onClick={() => {
            setDate("");
            load();
          }}
        >
          Reset
        </button>
      </div>

      {/* ATTENDANCE TABLE */}
      <div className="bg-white p-5 rounded-xl shadow-lg overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-3 border text-sm">Date</th>
              <th className="p-3 border text-sm">Check In</th>
              <th className="p-3 border text-sm">Check Out</th>
              <th className="p-3 border text-sm">Work Minutes</th>
              <th className="p-3 border text-sm">Break Minutes</th>
              <th className="p-3 border text-sm">Status</th> {/* NEW COLUMN */}
            </tr>
          </thead>

          <tbody>
            {currentRecords.length === 0 && (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  No attendance found.
                </td>
              </tr>
            )}

            {currentRecords.map((r) => {
              const isPresent = r.total_minutes >= 480; // 8 Hours = 480 Minutes

              return (
                <tr
                  key={r.id}
                  className="border hover:bg-blue-50 transition"
                >
                  <td className="p-3 border">{r.date}</td>

                  <td className="p-3 border">
                    {r.check_in
                      ? new Date(r.check_in).toLocaleTimeString()
                      : "--"}
                  </td>

                  <td className="p-3 border">
                    {r.check_out
                      ? new Date(r.check_out).toLocaleTimeString()
                      : "--"}
                  </td>

                  <td className="p-3 border text-blue-600 font-medium">
                    {r.total_minutes} min
                  </td>

                  <td className="p-3 border text-red-600 font-medium">
                    {r.break_minutes} min
                  </td>

                  {/* NEW STATUS COLUMN */}
                  <td
                    className={`p-3 border font-semibold ${
                      isPresent ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isPresent ? "Present" : "Absent"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            {/* Prev Button */}
            <button
              className={`px-4 py-2 rounded-lg border ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => changePage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Prev
            </button>

            {/* Page Numbers */}
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => changePage(i + 1)}
                className={`px-4 py-2 rounded-lg border ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                {i + 1}
              </button>
            ))}

            {/* Next Button */}
            <button
              className={`px-4 py-2 rounded-lg border ${
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
    </EmployeeLayout>
  );
}
