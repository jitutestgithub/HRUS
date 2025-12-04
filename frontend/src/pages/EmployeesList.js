import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function EmployeesList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const res = await api.get("/employees");
      setEmployees(res.data);
      setLoading(false);
    } catch (err) {
      console.error("EMPLOYEE LOAD ERROR:", err);
    }
  };

  const deleteEmployee = async (id) => {
    if (!window.confirm("Delete this employee?")) return;

    try {
      await api.delete(`/employees/${id}`);
      loadEmployees();
    } catch (err) {
      console.error("DELETE ERROR:", err);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Employees</h2>

        <Link
          to="/employees/add"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700"
        >
          + Add Employee
        </Link>
      </div>

      <div className="bg-white shadow border rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-100 border-b">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Department</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((emp) => (
              <tr
                key={emp.id}
                className="border-b hover:bg-slate-50 transition"
              >
                <td className="p-3 font-medium">
                  <Link
                    to={`/employees/${emp.id}`}
                    className="text-indigo-600 hover:underline"
                  >
                    {emp.first_name} {emp.last_name}
                  </Link>
                </td>

                <td className="p-3">{emp.email}</td>
                <td className="p-3">{emp.department_name || "-"}</td>

                <td className="p-3">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      emp.status === "active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {emp.status}
                  </span>
                </td>

                <td className="p-3 text-right space-x-3">
                  <Link
                    to={`/employees/${emp.id}`}
                    className="text-indigo-600 hover:underline"
                  >
                    View
                  </Link>

                  <button
                    onClick={() => deleteEmployee(emp.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {employees.length === 0 && (
          <p className="text-center py-6 text-slate-500">
            No employees found.
          </p>
        )}
      </div>
    </div>
  );
}
