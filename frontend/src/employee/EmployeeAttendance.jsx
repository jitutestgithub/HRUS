import React, { useEffect, useState } from "react";
import api from "../api";
import EmployeeLayout from "./EmployeeLayout";

export default function EmployeeAttendance() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [date, setDate] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/attendance/history"); // backend API
      setRecords(res.data);
      setLoading(false);
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
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <EmployeeLayout>
        <p>Loading attendance...</p>
      </EmployeeLayout>
    );

  return (
    <EmployeeLayout>
      <h1 className="text-2xl font-bold mb-4">My Attendance</h1>

      {/* DATE FILTER */}
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
          className="px-4 py-2 bg-gray-400 text-white rounded"
          onClick={() => {
            setDate("");
            load();
          }}
        >
          Reset
        </button>
      </div>

      {/* ATTENDANCE TABLE */}
      <div className="bg-white p-5 rounded shadow">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left bg-gray-100">
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Check In</th>
              <th className="p-2 border">Check Out</th>
              <th className="p-2 border">Work Minutes</th>
              <th className="p-2 border">Break Minutes</th>
            </tr>
          </thead>

          <tbody>
            {records.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No attendance found.
                </td>
              </tr>
            )}

            {records.map((r) => (
              <tr key={r.id} className="border">
                <td className="p-2 border">{r.date}</td>
                <td className="p-2 border">
                  {r.check_in ? new Date(r.check_in).toLocaleTimeString() : "--"}
                </td>
                <td className="p-2 border">
                  {r.check_out
                    ? new Date(r.check_out).toLocaleTimeString()
                    : "--"}
                </td>
                <td className="p-2 border">{r.total_minutes} min</td>
                <td className="p-2 border">{r.break_minutes} min</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </EmployeeLayout>
  );
}
