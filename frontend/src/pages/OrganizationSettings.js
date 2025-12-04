import React, { useEffect, useState } from "react";
import api from "../api";

export default function OrganizationSettings() {
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await api.get("/organizations/me");
      setOrg(res.data);
      setLoading(false);
    } catch (err) {
      console.error("ORG LOAD ERROR:", err);
    }
  };

  const updateOrg = async (e) => {
    e.preventDefault();
    try {
      await api.put("/organizations/me", org);
      setMsg("Organization updated successfully!");
    } catch (err) {
      console.log(err);
      setMsg("Failed to update");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">
        Organization Settings
      </h2>

      {msg && (
        <div className="bg-emerald-100 text-emerald-700 p-3 rounded mb-4">
          {msg}
        </div>
      )}

      <form
        onSubmit={updateOrg}
        className="bg-white shadow-sm border border-slate-200 p-6 rounded-xl space-y-6"
      >
        {/* Basic Info */}
        <div>
          <h3 className="font-semibold text-lg text-slate-700 mb-3">
            Basic Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Organization Name"
              value={org.name}
              onChange={(v) => setOrg({ ...org, name: v })}
            />
            <Input
              label="Domain"
              value={org.domain}
              onChange={(v) => setOrg({ ...org, domain: v })}
            />
            <Input
              label="Industry"
              value={org.industry}
              onChange={(v) => setOrg({ ...org, industry: v })}
            />
          </div>

          <Textarea
            label="Description"
            value={org.description}
            onChange={(v) => setOrg({ ...org, description: v })}
          />
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-semibold text-lg text-slate-700 mb-3">
            Contact Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email"
              value={org.contact_email}
              onChange={(v) => setOrg({ ...org, contact_email: v })}
            />
            <Input
              label="Phone"
              value={org.contact_phone}
              onChange={(v) => setOrg({ ...org, contact_phone: v })}
            />
            <Input
              label="Address"
              value={org.address}
              onChange={(v) => setOrg({ ...org, address: v })}
            />
            <Input
              label="City"
              value={org.city}
              onChange={(v) => setOrg({ ...org, city: v })}
            />
            <Input
              label="State"
              value={org.state}
              onChange={(v) => setOrg({ ...org, state: v })}
            />
            <Input
              label="Country"
              value={org.country}
              onChange={(v) => setOrg({ ...org, country: v })}
            />
          </div>
        </div>

        {/* Branding */}
        <div>
          <h3 className="font-semibold text-lg text-slate-700 mb-3">
            Branding
          </h3>

          <Input
            label="Logo URL"
            value={org.logo_url}
            onChange={(v) => setOrg({ ...org, logo_url: v })}
          />
          <Input
            label="Theme Color"
            value={org.theme_color}
            onChange={(v) => setOrg({ ...org, theme_color: v })}
          />
        </div>

        {/* Subscription */}
        <div>
          <h3 className="font-semibold text-lg text-slate-700 mb-3">
            Subscription
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Plan"
              options={["free", "basic", "pro", "enterprise"]}
              value={org.subscription_plan}
              onChange={(v) => setOrg({ ...org, subscription_plan: v })}
            />
            <Select
              label="Billing Cycle"
              options={["monthly", "yearly"]}
              value={org.billing_cycle}
              onChange={(v) => setOrg({ ...org, billing_cycle: v })}
            />
          </div>
        </div>

        <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
          Save Changes
        </button>
      </form>
    </div>
  );
}

/* ------------ UI Components -------------- */

function Input({ label, value, onChange }) {
  return (
    <div className="flex flex-col">
      <label className="text-sm text-slate-600 mb-1">{label}</label>
      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-400 outline-none"
      />
    </div>
  );
}

function Textarea({ label, value, onChange }) {
  return (
    <div className="flex flex-col">
      <label className="text-sm text-slate-600 mb-1">{label}</label>
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="border border-slate-300 rounded-lg p-2 h-24 focus:ring-2 focus:ring-indigo-400 outline-none"
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col">
      <label className="text-sm text-slate-600 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-400 outline-none"
      >
        {options.map((opt, i) => (
          <option key={i} value={opt}>
            {opt.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
}
