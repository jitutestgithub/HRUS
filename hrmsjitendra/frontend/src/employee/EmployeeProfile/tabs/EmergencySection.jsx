import React, { useState } from "react";

export default function EmergencySection({ profile, onUpdate }) {
  const [form, setForm] = useState({
    emergency_name: profile.emergency_name || "",
    emergency_phone: profile.emergency_phone || "",
    relationship: profile.relationship || "",
  });

  const submit = (e) => {
    e.preventDefault();
    onUpdate(form);
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Emergency Contact</h2>

      <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Person Name"
          value={form.emergency_name}
          onChange={(e) => setForm({ ...form, emergency_name: e.target.value })}
        />

        <Field
          label="Phone Number"
          value={form.emergency_phone}
          onChange={(e) => setForm({ ...form, emergency_phone: e.target.value })}
        />

        <Field
          label="Relationship"
          value={form.relationship}
          onChange={(e) => setForm({ ...form, relationship: e.target.value })}
        />

        <div className="col-span-2 flex justify-end mt-2">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg shadow text-sm">
            Save Emergency Info
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
        className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-green-400 outline-none"
        {...props}
      />
    </div>
  );
}
