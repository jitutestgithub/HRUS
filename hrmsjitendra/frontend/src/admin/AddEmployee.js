import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function AddEmployee() {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);

  const [emp, setEmp] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    department_id: "",
    designation: "",
    join_date: "",
    employment_type: "full_time",
  });

  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const res = await api.get("/departments");
      setDepartments(res.data);
    } catch (err) {
      console.error("DEPT LOAD ERROR:", err);
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    const payload = {
      ...emp,
      department_id: Number(emp.department_id), // IMPORTANT FIX
    };

    console.log("FINAL PAYLOAD:", payload);

    try {
      await api.post("/employees", payload);
      navigate("/employees");
    } catch (err) {
      console.error("EMP ADD ERROR:", err?.response?.data || err);
      setMsg(err?.response?.data?.message || "Failed to add employee");
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">
        Add Employee
      </h2>

      {msg && (
        <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{msg}</p>
      )}

      <form
        onSubmit={submit}
        className="bg-white shadow border p-6 rounded-xl space-y-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            value={emp.first_name}
            onChange={(v) => setEmp({ ...emp, first_name: v })}
          />
          <Input
            label="Last Name"
            value={emp.last_name}
            onChange={(v) => setEmp({ ...emp, last_name: v })}
          />
        </div>

        <Input
          label="Email"
          value={emp.email}
          onChange={(v) => setEmp({ ...emp, email: v })}
        />

        <Input
          label="Phone"
          value={emp.phone}
          onChange={(v) => setEmp({ ...emp, phone: v })}
        />

        {/* FIXED Select */}
        <Select
          label="Department"
          value={emp.department_id}
          options={departments.map((d) => ({ value: d.id, label: d.name }))}
          onChange={(v) => setEmp({ ...emp, department_id: v })}
        />

        <Input
          label="Designation"
          value={emp.designation}
          onChange={(v) => setEmp({ ...emp, designation: v })}
        />

        <Input
          type="date"
          label="Joining Date"
          value={emp.join_date}
          onChange={(v) => setEmp({ ...emp, join_date: v })}
        />

        <Select
          label="Employment Type"
          value={emp.employment_type}
          options={[
            { value: "full_time", label: "Full Time" },
            { value: "part_time", label: "Part Time" },
            { value: "intern", label: "Intern" },
          ]}
          onChange={(v) => setEmp({ ...emp, employment_type: v })}
        />

        <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
          Save Employee
        </button>
      </form>
    </div>
  );
}

function Input({ label, value, type = "text", onChange }) {
  return (
    <div>
      <label className="block text-sm text-slate-600 mb-1">{label}</label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded p-2 focus:ring-2 focus:ring-indigo-400"
      />
    </div>
  );
}

function Select({ label, value, options, onChange }) {
  return (
    <div>
      <label className="block text-sm text-slate-600 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded p-2 focus:ring-2 focus:ring-indigo-400"
      >
        <option value="">Select...</option>
        {options.map((opt, i) => (
          <option key={i} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
