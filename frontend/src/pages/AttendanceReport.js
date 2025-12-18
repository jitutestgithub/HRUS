import React, { useEffect, useState } from "react";
import api from "../api";

export default function AttendanceReport() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await api.get("/attendance/report");
      setRecords(res.data);
      setLoading(false);
    } catch (err) {
      console.error("REPORT LOAD ERROR:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Attendance Report</h2>

      <table className="w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Check In</th>
            <th className="p-2 border">Check Out</th>
            <th className="p-2 border">Hours</th>
            <th className="p-2 border">Status</th>
          </tr>
        </thead>
        <tbody>
          {records.map((item) => (
            <tr key={item.id} className="border">
              <td className="p-2 border">{item.date}</td>
              <td className="p-2 border">{item.check_in || "-"}</td>
              <td className="p-2 border">{item.check_out || "-"}</td>
              <td className="p-2 border">{item.total_hours || "-"}</td>
              <td className="p-2 border">{item.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
