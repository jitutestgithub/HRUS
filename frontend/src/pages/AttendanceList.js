import React, { useEffect, useState } from "react";
import api from "../api";

export default function AttendanceList() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);

      // ADMIN correct route
      const res = await api.get("/admin/attendance/list");
      setRecords(res.data);

      setLoading(false);
    } catch (err) {
      console.error("ADMIN ATTENDANCE ERROR:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Attendance List</h1>
      <p className="text-xs text-slate-500">All attendance records</p>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 border-b">
            <tr>
              <Th>Employee</Th>
              <Th>Date</Th>
              <Th>Check-In</Th>
              <Th>Check-Out</Th>
              <Th>Status</Th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <Td colSpan={5} className="text-center py-8 text-slate-400">
                  Loading...
                </Td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <Td colSpan={5} className="text-center py-8 text-slate-400">
                  No attendance found.
                </Td>
              </tr>
            ) : (
              records.map((r) => (
                <tr key={r.id} className="border-t hover:bg-slate-50">
                  <Td>{r.first_name} {r.last_name}</Td>
                  <Td>{r.date}</Td>
                  <Td>{r.check_in || "-"}</Td>
                  <Td>{r.check_out || "-"}</Td>
                  <Td>
                    <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700">
                      {r.status || "N/A"}
                    </span>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}

function Td({ children, colSpan, className = "" }) {
  return (
    <td
      colSpan={colSpan}
      className={`px-4 py-2 text-sm text-slate-700 align-middle ${className}`}
    >
      {children}
    </td>
  );
}
