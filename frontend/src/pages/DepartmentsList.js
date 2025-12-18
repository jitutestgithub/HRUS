import React, { useEffect, useState } from "react";
import api from "../api";

export default function DepartmentsList() {
  const [departments, setDepartments] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  // Load Departments
  const loadDepartments = async () => {
    const res = await api.get("/departments");
    setDepartments(res.data);
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  // Update Department
  const handleUpdate = async () => {
    if (!editName.trim()) return alert("Name required");

    await api.put(`/departments/${editing.id}`, { name: editName });

    setEditing(null);
    setEditName("");
    loadDepartments();
  };

  // Delete Department
  const handleDelete = async () => {
    await api.delete(`/departments/${deleteId}`);

    setDeleteId(null);
    loadDepartments();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Departments</h2>

        <a
          href="/departments/add"
          className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition"
        >
          + Add Department
        </a>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-semibold">#</th>
              <th className="py-3 px-4 text-left text-sm font-semibold">
                Department Name
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {departments.length > 0 ? (
              departments.map((d, i) => (
                <tr
                  key={d.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="py-3 px-4 text-sm text-gray-700">{i + 1}</td>

                  <td className="py-3 px-4 text-sm text-gray-800">{d.name}</td>

                  <td className="py-3 px-4 text-sm text-gray-800 flex gap-2">
                    {/* Edit Button */}
                    <button
                      className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      onClick={() => {
                        setEditing(d);
                        setEditName(d.name);
                      }}
                    >
                      Edit
                    </button>

                    {/* Delete Button */}
                    <button
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                      onClick={() => setDeleteId(d.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="py-4 text-center text-gray-500">
                  No departments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ============================== */}
      {/* EDIT MODAL */}
      {/* ============================== */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-96 shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Edit Department</h3>

            <input
              type="text"
              className="w-full p-2 border rounded mb-4"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleUpdate}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================== */}
      {/* DELETE CONFIRM MODAL */}
      {/* ============================== */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-80 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">
              Confirm Delete?
            </h3>

            <p className="mb-6 text-gray-700">
              Are you sure you want to delete this department?
            </p>

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
