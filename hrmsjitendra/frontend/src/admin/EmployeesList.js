import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function EmployeesList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | active | inactive
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success"); // success | error

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setListError("");
      const res = await api.get("/employees");
      setEmployees(res.data || []);
      setLoading(false);
    } catch (err) {
      console.error("EMPLOYEE LOAD ERROR:", err);
      setListError("Failed to load employees. Please try again.");
      setLoading(false);
    }
  };

  // Unique department list for filter
  const departmentOptions = useMemo(() => {
    const set = new Set();
    (employees || []).forEach((e) => {
      if (e.department_name) set.add(e.department_name);
    });
    return ["all", ...Array.from(set)];
  }, [employees]);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return (employees || [])
      .filter((e) => {
        if (!search.trim()) return true;
        const term = search.toLowerCase();
        const fullName = `${e.first_name || ""} ${e.last_name || ""}`.toLowerCase();
        return (
          fullName.includes(term) ||
          e.email?.toLowerCase().includes(term) ||
          e.department_name?.toLowerCase().includes(term)
        );
      })
      .filter((e) => {
        if (statusFilter === "all") return true;
        const s = (e.status || "").toLowerCase();
        return s === statusFilter;
      })
      .filter((e) => {
        if (departmentFilter === "all") return true;
        return e.department_name === departmentFilter;
      });
  }, [employees, search, statusFilter, departmentFilter]);

  const deleteEmployee = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      setMessage("");

      await api.delete(`/employees/${deleteId}`);

      setDeleting(false);
      setDeleteId(null);
      setMessage("Employee deleted successfully.");
      setMessageType("success");
      loadEmployees();
    } catch (err) {
      console.error("DELETE ERROR:", err);
      setDeleting(false);
      setMessage("Failed to delete employee. Please try again.");
      setMessageType("error");
    }
  };

  const formatName = (emp) => {
    return `${emp.first_name || ""} ${emp.last_name || ""}`.trim() || "Unnamed";
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Employees</h2>
          <p className="text-sm text-slate-500 mt-1">
            View and manage your employees, their departments and status.
          </p>
        </div>

        <Link
          to="/employees/add"
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
        >
          <span className="text-lg mr-1">＋</span> Add Employee
        </Link>
      </div>

      {/* Global message */}
      {message && (
        <div
          className={`rounded-lg px-4 py-3 text-sm border ${
            messageType === "success"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-rose-50 text-rose-700 border-rose-200"
          }`}
        >
          {message}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name, email or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              🔍
            </span>
          </div>

          {/* Status filter */}
          <div className="border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-600 inline-flex items-center gap-2 bg-white">
            <span className="hidden sm:inline">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent outline-none text-sm"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Department filter */}
          <div className="border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-600 inline-flex items-center gap-2 bg-white">
            <span className="hidden sm:inline">Department:</span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-transparent outline-none text-sm max-w-[140px]"
            >
              {departmentOptions.map((d) =>
                d === "all" ? (
                  <option key="all" value="all">
                    All
                  </option>
                ) : (
                  <option key={d} value={d}>
                    {d}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-700">
            {filteredEmployees.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-700">
            {employees.length}
          </span>{" "}
          employees
        </div>
      </div>

      {/* List */}
      <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-10 bg-slate-100 rounded-md animate-pulse"
              />
            ))}
          </div>
        ) : listError ? (
          <div className="p-6 text-center text-sm text-rose-600">
            <p>{listError}</p>
            <button
              onClick={loadEmployees}
              className="mt-3 px-4 py-2 text-xs rounded-lg bg-slate-800 text-white hover:bg-slate-900"
            >
              Retry
            </button>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            <p>No employees found.</p>
            <p className="mt-1">
              Try changing your filters or{" "}
              <Link
                to="/employees/add"
                className="text-indigo-600 hover:underline"
              >
                create a new employee
              </Link>
              .
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-3 text-left text-xs font-semibold text-slate-500">
                  Employee
                </th>
                <th className="p-3 text-left text-xs font-semibold text-slate-500">
                  Department
                </th>
                <th className="p-3 text-left text-xs font-semibold text-slate-500">
                  Role
                </th>
                <th className="p-3 text-left text-xs font-semibold text-slate-500">
                  Joined
                </th>
                <th className="p-3 text-left text-xs font-semibold text-slate-500">
                  Status
                </th>
                <th className="p-3 text-right text-xs font-semibold text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.map((emp) => (
                <tr
                  key={emp.id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition"
                >
                  {/* Employee name + email */}
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700">
                        {formatName(emp)
                          .split(" ")
                          .map((x) => x[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <Link
                          to={`/employees/${emp.id}`}
                          className="text-sm font-medium text-slate-800 hover:text-indigo-600 hover:underline"
                        >
                          {formatName(emp)}
                        </Link>
                        <p className="text-xs text-slate-500">
                          {emp.email || "-"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Department */}
                  <td className="p-3 text-sm text-slate-700">
                    {emp.department_name || "-"}
                  </td>

                  {/* Role / Designation */}
                  <td className="p-3 text-sm text-slate-700">
                    {emp.designation || emp.employment_type || "-"}
                  </td>

                  {/* Join Date */}
                  <td className="p-3 text-xs text-slate-500">
                    {formatDate(emp.join_date)}
                  </td>

                  {/* Status */}
                  <td className="p-3">
                    <StatusBadge status={emp.status} />
                  </td>

                  {/* Actions */}
                  <td className="p-3 text-right">
                    <div className="inline-flex gap-2">
                      <Link
                        to={`/employees/${emp.id}`}
                        className="px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100"
                      >
                        View
                      </Link>

                      <button
                        onClick={() => setDeleteId(emp.id)}
                        className="px-3 py-1.5 text-xs bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-lg">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">
              Delete employee?
            </h3>

            <p className="mb-5 text-sm text-slate-600">
              Are you sure you want to delete this employee? This action cannot
              be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                onClick={() => setDeleteId(null)}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 text-sm bg-rose-600 text-white rounded-lg hover:bg-rose-700 flex items-center gap-2 disabled:opacity-60"
                onClick={deleteEmployee}
                disabled={deleting}
              >
                {deleting && (
                  <span className="h-4 w-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                )}
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* --- Small badge component --- */

function StatusBadge({ status }) {
  const s = (status || "active").toLowerCase();
  const configs = {
    active: {
      label: "Active",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    inactive: {
      label: "Inactive",
      className: "bg-slate-50 text-slate-600 border-slate-200",
    },
  };

  const cfg = configs[s] || configs.active;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border ${cfg.className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current mr-1.5" />
      {cfg.label}
    </span>
  );
}
