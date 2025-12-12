// src/employee/EmployeeProfile/tabs/BasicInfo.jsx
import React, { useState } from "react";
export default function BasicInfo({ profile, onUpdate }) {
  const [form, setForm] = useState({
    first_name: profile.first_name || "",
    last_name: profile.last_name || "",
    phone: profile.phone || "",
    designation: profile.designation || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(form);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Basic Info</h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <Field
          label="First Name"
          value={form.first_name}
          onChange={(e) => setForm({ ...form, first_name: e.target.value })}
        />
        <Field
          label="Last Name"
          value={form.last_name}
          onChange={(e) => setForm({ ...form, last_name: e.target.value })}
        />
        <Field
          label="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <Field
          label="Designation"
          value={form.designation}
          onChange={(e) => setForm({ ...form, designation: e.target.value })}
        />

        <div className="col-span-1 sm:col-span-2 flex justify-end mt-2">
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow text-sm">
            Save Basic Info
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <div>
      <label className="block mb-1 text-sm font-medium">{label}</label>
      <input
        className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-green-400 outline-none text-sm"
        {...props}
      />
    </div>
  );
}
