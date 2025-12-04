import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function AddDepartment() {
  const navigate = useNavigate();

  const [dept, setDept] = useState({
    name: "",
    description: "",
  });

  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/departments", dept);
      navigate("/departments");
    } catch (err) {
      console.error("ADD ERROR:", err);
      setMsg("Failed to add department");
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">
        Add Department
      </h2>

      {msg && (
        <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{msg}</p>
      )}

      <form
        onSubmit={submit}
        className="bg-white shadow border p-6 rounded-xl space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Name
          </label>
          <input
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
            value={dept.name}
            onChange={(e) => setDept({ ...dept, name: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Description
          </label>
          <textarea
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
            value={dept.description}
            onChange={(e) => setDept({ ...dept, description: e.target.value })}
          />
        </div>

        <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
          Save Department
        </button>
      </form>
    </div>
  );
}
