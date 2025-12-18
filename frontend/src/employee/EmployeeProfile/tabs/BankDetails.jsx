import React, { useState, useEffect } from "react";
import api from "../../api";

export default function BankDetails({ profile }) {
  const [form, setForm] = useState({
    account_holder: "",
    account_number: "",
    ifsc: "",
    bank_name: "",
  });

  useEffect(() => {
    loadBank();
  }, []);

  const loadBank = async () => {
    try {
      const res = await api.get("/employee/bank");
      setForm(res.data || form);
    } catch (err) {
      console.error("Bank load error:", err);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.put("/employee/bank", form);
      alert("Bank details updated");
    } catch (err) {
      console.error("Bank update error");
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Bank Details</h2>

      <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Account Holder Name"
          value={form.account_holder}
          onChange={(e) => setForm({ ...form, account_holder: e.target.value })}
        />

        <Field
          label="Account Number"
          value={form.account_number}
          onChange={(e) => setForm({ ...form, account_number: e.target.value })}
        />

        <Field
          label="IFSC Code"
          value={form.ifsc}
          onChange={(e) => setForm({ ...form, ifsc: e.target.value })}
        />

        <Field
          label="Bank Name"
          value={form.bank_name}
          onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
        />

        <div className="col-span-2 flex justify-end mt-3">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg shadow text-sm">
            Save Bank Details
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
        className="w-full border p-2 rounded-lg text-sm"
        {...props}
      />
    </div>
  );
}
