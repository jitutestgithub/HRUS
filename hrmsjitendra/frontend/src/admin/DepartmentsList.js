import React, { useEffect, useState, useMemo } from "react";
import api from "../api";

export default function DepartmentsList() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");

  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState("active");
  const [savingEdit, setSavingEdit] = useState(false);

  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | active | inactive
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success"); // success | error

  // Load Departments
  const loadDepartments = async () => {
    try {
      setLoading(true);
      setListError("");
      const res = await api.get("/departments");
      setDepartments(res.data || []);
      setLoading(false);
    } catch (err) {
      console.error("DEPARTMENTS LOAD ERROR:", err);
      setListError("Failed to load departments. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  // Filtered departments (search + status)
  const filteredDepartments = useMemo(() => {
    return (departments || [])
      .filter((d) => {
        if (!search.trim()) return true;
        const term = search.toLowerCase();
        return (
          d.name?.toLowerCase().includes(term) ||
          d.description?.toLowerCase().includes(term)
        );
      })
      .filter((d) => {
        if (statusFilter === "all") return true;
        const s = (d.status || "").toLowerCase();
        return s === statusFilter;
      });
  }, [departments, search, statusFilter]);

  // Open Edit Modal
  const openEdit = (dept) => {
    setEditing(dept);
    setEditName(dept.name || "");
    setEditDescription(dept.description || "");
    setEditStatus(dept.status || "active");
    setMessage("");
  };

  // Update Department
  const handleUpdate = async () => {
    if (!editName.trim()) {
      setMessage("Department name is required.");
      setMessageType("error");
      return;
    }

    try {
      setSavingEdit(true);
      setMessage("");

      await api.put(`/departments/${editing.id}`, {
        name: editName.trim(),
        description: editDescription.trim(),
        status: editStatus,
      });

      setMessage("Department updated successfully.");
      setMessageType("success");
      setSavingEdit(false);
      setEditing(null);
      setEditName("");
      setEditDescription("");
      setEditStatus("active");
      loadDepartments();
    } catch (err) {
      console.error("DEPARTMENT UPDATE ERROR:", err);
      setMessage("Failed to update department. Please try again.");
      setMessageType("error");
      setSavingEdit(false);
    }
  };

  // Delete Department
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      setMessage("");

      await api.delete(`/departments/${deleteId}`);

      setDeleting(false);
      setDeleteId(null);
      setMessage("Department deleted successfully.");
      setMessageType("success");
      loadDepartments();
    } catch (err) {
      console.error("DEPARTMENT DELETE ERROR:", err);
      setDeleting(false);
      setMessage("Failed to delete department. Please try again.");
      setMessageType("error");
    }
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Departments
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage your organization's departments and keep your structure up to date.
          </p>
        </div>

        <a
          href="/departments/add"
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
        >
          <span className="text-lg mr-1">＋</span> Add Department
        </a>
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
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              🔍
            </span>
          </div>

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
        </div>

        <div className="text-xs text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-700">
            {filteredDepartments.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-700">
            {departments.length}
          </span>{" "}
          departments
        </div>
      </div>

      {/* List / Table */}
      <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
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
              onClick={loadDepartments}
              className="mt-3 px-4 py-2 text-xs rounded-lg bg-slate-800 text-white hover:bg-slate-900"
            >
              Retry
            </button>
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            <p>No departments found.</p>
            <p className="mt-1">
              Try changing your filters or{" "}
              <a
                href="/departments/add"
                className="text-indigo-600 hover:underline"
              >
                create a new department
              </a>
              .
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500">
                  #
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500">
                  Department
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500">
                  Status
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500">
                  Created
                </th>
                <th className="py-3 px-4 text-right text-xs font-semibold text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredDepartments.map((d, i) => (
                <tr
                  key={d.id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition"
                >
                  <td className="py-3 px-4 text-xs text-slate-500">
                    {i + 1}
                  </td>

                  <td className="py-3 px-4">
                    <p className="text-sm font-medium text-slate-800">
                      {d.name}
                    </p>
                    {d.description && (
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        {d.description}
                      </p>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <StatusBadge status={d.status} />
                  </td>

                  <td className="py-3 px-4 text-xs text-slate-500">
                    {formatDate(d.created_at)}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        className="px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100"
                        onClick={() => openEdit(d)}
                      >
                        Edit
                      </button>

                      <button
                        className="px-3 py-1.5 text-xs bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                        onClick={() => setDeleteId(d.id)}
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

      {/* EDIT MODAL */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Edit Department
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-600 mb-1 block">
                  Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 mb-1 block">
                  Description
                </label>
                <textarea
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm h-20 focus:ring-2 focus:ring-indigo-400 outline-none"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 mb-1 block">
                  Status
                </label>
                <select
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                onClick={() => setEditing(null)}
                disabled={savingEdit}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-60"
                onClick={handleUpdate}
                disabled={savingEdit}
              >
                {savingEdit && (
                  <span className="h-4 w-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                )}
                {savingEdit ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-lg">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">
              Delete department?
            </h3>

            <p className="mb-5 text-sm text-slate-600">
              Are you sure you want to delete this department? This action
              cannot be undone.
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
                onClick={handleDelete}
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
