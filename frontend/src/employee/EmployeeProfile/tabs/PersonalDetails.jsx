// src/employee/EmployeeProfile/tabs/PersonalDetails.jsx
import React, { useState } from "react";

export default function PersonalDetails({ profile, onUpdate }) {
  const [form, setForm] = useState({
    gender: profile.gender || "",
    dob: profile.dob || "",
    marital_status: profile.marital_status || "",
    blood_group: profile.blood_group || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(form);
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Personal Details</h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <div>
          <label className="block mb-1 text-sm font-medium">Gender</label>
          <select
            className="w-full border p-2 rounded-lg text-sm"
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <Field
          label="Date of Birth"
          type="date"
          value={form.dob || ""}
          onChange={(e) => setForm({ ...form, dob: e.target.value })}
        />

        <div>
          <label className="block mb-1 text-sm font-medium">Marital Status</label>
          <select
            className="w-full border p-2 rounded-lg text-sm"
            value={form.marital_status || ""}
            onChange={(e) =>
              setForm({ ...form, marital_status: e.target.value })
            }
          >
            <option value="">Select</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
          </select>
        </div>

        <Field
          label="Blood Group"
          value={form.blood_group || ""}
          onChange={(e) => setForm({ ...form, blood_group: e.target.value })}
          placeholder="e.g. O+, A-, B+"
        />

        <div className="col-span-1 sm:col-span-2 flex justify-end mt-2">
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow text-sm">
            Save Personal Details
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
