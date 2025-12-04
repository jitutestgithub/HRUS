import React, { useState } from "react";

export default function AddressSection({ profile, onUpdate }) {
  const [form, setForm] = useState({
    address: profile.address || "",
    city: profile.city || "",
    state: profile.state || "",
    pincode: profile.pincode || "",
  });

  const submit = (e) => {
    e.preventDefault();
    onUpdate(form);
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Address Information</h2>

      <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Address"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />

        <Field
          label="City"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
        />

        <Field
          label="State"
          value={form.state}
          onChange={(e) => setForm({ ...form, state: e.target.value })}
        />

        <Field
          label="Pincode"
          value={form.pincode}
          onChange={(e) => setForm({ ...form, pincode: e.target.value })}
        />

        <div className="col-span-2 flex justify-end mt-2">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg shadow text-sm">
            Save Address
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
