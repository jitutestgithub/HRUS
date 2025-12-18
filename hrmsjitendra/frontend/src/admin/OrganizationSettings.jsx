import React, { useEffect, useState, useMemo } from "react";
import api from "../api";

export default function OrganizationSettings() {
  const [org, setOrg] = useState(null); // original
  const [form, setForm] = useState(null); // editable copy
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("success"); // 'success' | 'error'
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/organizations/me");
      setOrg(res.data);
      setForm(res.data); // editable copy
      setLoading(false);
    } catch (err) {
      console.error("ORG LOAD ERROR:", err);
      setMsg("Failed to load organization details.");
      setMsgType("error");
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // clear error for this field
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.name?.trim()) newErrors.name = "Organization name is required.";
    if (!form.domain?.trim()) newErrors.domain = "Domain is required.";

    if (
      form.contact_email &&
      !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.contact_email)
    ) {
      newErrors.contact_email = "Please enter a valid email address.";
    }

    if (
      form.contact_phone &&
      !/^[0-9+\-\s()]{6,20}$/.test(form.contact_phone)
    ) {
      newErrors.contact_phone = "Please enter a valid phone number.";
    }

    if (
      form.theme_color &&
      !/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(form.theme_color)
    ) {
      newErrors.theme_color =
        "Theme color must be a valid HEX (e.g. #4F46E5).";
    }

    // ✅ Office lat/lng validation (optional but if filled, must be valid)
    if (form.office_lat || form.office_lng) {
      const lat = parseFloat(form.office_lat);
      const lng = parseFloat(form.office_lng);

      if (
        Number.isNaN(lat) ||
        lat < -90 ||
        lat > 90
      ) {
        newErrors.office_lat = "Latitude must be between -90 and 90.";
      }

      if (
        Number.isNaN(lng) ||
        lng < -180 ||
        lng > 180
      ) {
        newErrors.office_lng = "Longitude must be between -180 and 180.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateOrg = async (e) => {
    e?.preventDefault();

    if (!validate()) {
      setMsg("Please fix the highlighted fields.");
      setMsgType("error");
      return;
    }

    try {
      setSaving(true);
      setMsg("");

      await api.put("/organizations/me", form);

      setMsg("Organization updated successfully!");
      setMsgType("success");
      setOrg(form);
      setSaving(false);
    } catch (err) {
      console.error("ORG UPDATE ERROR:", err);
      setMsg("Failed to update organization. Please try again.");
      setMsgType("error");
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm(org);
    setErrors({});
    setMsg("");
  };

  // ⭐ Use current browser location → office_lat / office_lng
  const useCurrentLocationAsOffice = () => {
    if (!navigator.geolocation) {
      setMsgType("error");
      setMsg("Geolocation is not supported in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);

        setForm((prev) => ({
          ...prev,
          office_lat: lat,
          office_lng: lng,
        }));
        setErrors((prev) => ({
          ...prev,
          office_lat: "",
          office_lng: "",
        }));
        setMsgType("success");
        setMsg("Office location set from your current position.");
      },
      (err) => {
        console.error("GEO ERROR:", err);
        setMsgType("error");
        setMsg("Unable to fetch current location. Please allow location access.");
      }
    );
  };

  const subscriptionLabel = useMemo(() => {
    if (!form) return "";
    if (!form.subscription_plan) return "No active plan";

    const plan = String(form.subscription_plan).toUpperCase();
    const status = form.subscription_status
      ? ` • ${String(form.subscription_status).toUpperCase()}`
      : "";
    return `${plan}${status}`;
  }, [form]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="h-10 w-48 bg-slate-100 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 animate-pulse">
            <div className="h-6 bg-slate-100 rounded-md" />
            <div className="h-4 bg-slate-100 rounded-md w-3/4" />
            <div className="h-4 bg-slate-100 rounded-md w-1/2" />
          </div>
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 space-y-4 animate-pulse">
            <div className="h-5 bg-slate-100 rounded-md w-1/3" />
            <div className="h-10 bg-slate-100 rounded-md" />
            <div className="h-10 bg-slate-100 rounded-md" />
            <div className="h-10 bg-slate-100 rounded-md w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="max-w-3xl mx-auto text-center text-slate-500">
        Unable to load organization settings.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Organization Settings
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage your company profile, contact details, branding,
            office location and subscription.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-60"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={updateOrg}
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 flex items-center gap-2"
          >
            {saving && (
              <span className="h-4 w-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Message / Alert */}
      {msg && (
        <div
          className={`rounded-lg px-4 py-3 text-sm border ${
            msgType === "success"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-rose-50 text-rose-700 border-rose-200"
          }`}
        >
          {msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Overview Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-xl font-semibold text-indigo-600 overflow-hidden">
              {form.logo_url ? (
                <img
                  src={form.logo_url}
                  alt="Logo"
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                (form.name || "?")
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
              )}
            </div>
            <div>
              <p className="text-base font-semibold text-slate-800">
                {form.name || "Organization"}
              </p>
              <p className="text-xs text-slate-500">
                {form.industry || "Industry not set"}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <InfoRow label="Domain" value={form.domain || "Not set"} />
            <InfoRow
              label="Contact"
              value={
                form.contact_email || form.contact_phone
                  ? [form.contact_email, form.contact_phone]
                      .filter(Boolean)
                      .join(" • ")
                  : "Not set"
              }
            />
            <InfoRow
              label="Location"
              value={
                form.city || form.country
                  ? [form.city, form.state, form.country]
                      .filter(Boolean)
                      .join(", ")
                  : "Not set"
              }
            />
            <InfoRow label="Timezone" value={form.timezone || "Default"} />
            <InfoRow
              label="Office Coords"
              value={
                form.office_lat && form.office_lng
                  ? `${form.office_lat}, ${form.office_lng}`
                  : "Not set"
              }
            />
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Subscription
            </p>
            <p className="text-xs text-slate-500">{subscriptionLabel}</p>

            <div className="flex flex-wrap gap-2 mt-1 text-[11px] text-slate-400">
              {form.billing_cycle && (
                <span className="px-2 py-0.5 rounded-full bg-slate-100">
                  {String(form.billing_cycle).toUpperCase()} BILLING
                </span>
              )}
              {form.subscription_end && (
                <span className="px-2 py-0.5 rounded-full bg-slate-100">
                  Expires on{" "}
                  {new Date(form.subscription_end).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <form
          onSubmit={updateOrg}
          className="lg:col-span-2 bg-white shadow-sm border border-slate-200 rounded-xl p-6 space-y-8"
        >
          {/* Basic Info */}
          <SectionTitle
            title="Basic Information"
            subtitle="Company name, domain and description."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Organization Name"
              value={form.name}
              onChange={(v) => handleChange("name", v)}
              error={errors.name}
              required
            />
            <Input
              label="Domain"
              placeholder="example.com"
              value={form.domain}
              onChange={(v) => handleChange("domain", v)}
              error={errors.domain}
              required
            />
            <Input
              label="Industry"
              value={form.industry}
              onChange={(v) => handleChange("industry", v)}
            />
            <Input
              label="Zip / Postal Code"
              value={form.zipcode}
              onChange={(v) => handleChange("zipcode", v)}
            />
          </div>

          <Textarea
            label="Description"
            value={form.description}
            onChange={(v) => handleChange("description", v)}
          />

          {/* Contact */}
          <SectionTitle
            title="Contact Details"
            subtitle="These will be used in communication and documents."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email"
              value={form.contact_email}
              onChange={(v) => handleChange("contact_email", v)}
              error={errors.contact_email}
            />
            <Input
              label="Phone"
              value={form.contact_phone}
              onChange={(v) => handleChange("contact_phone", v)}
              error={errors.contact_phone}
            />
            <Input
              label="Address"
              value={form.address}
              onChange={(v) => handleChange("address", v)}
            />
            <Input
              label="City"
              value={form.city}
              onChange={(v) => handleChange("city", v)}
            />
            <Input
              label="State"
              value={form.state}
              onChange={(v) => handleChange("state", v)}
            />
            <Input
              label="Country"
              value={form.country}
              onChange={(v) => handleChange("country", v)}
            />
          </div>

          {/* Branding */}
          <SectionTitle
            title="Branding"
            subtitle="Customize how your organization appears to employees."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <Input
              label="Logo URL"
              value={form.logo_url}
              onChange={(v) => handleChange("logo_url", v)}
            />
            <div className="flex flex-col gap-2">
              <label className="text-sm text-slate-600 mb-1">
                Theme Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.theme_color || "#4f46e5"}
                  onChange={(e) =>
                    handleChange("theme_color", e.target.value)
                  }
                  className="h-9 w-12 rounded-md border border-slate-300 cursor-pointer bg-transparent"
                />
                <input
                  value={form.theme_color || ""}
                  onChange={(e) =>
                    handleChange("theme_color", e.target.value)
                  }
                  placeholder="#4F46E5"
                  className={`flex-1 border rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400 ${
                    errors.theme_color
                      ? "border-rose-400"
                      : "border-slate-300"
                  }`}
                />
              </div>
              {errors.theme_color && (
                <p className="text-xs text-rose-500">{errors.theme_color}</p>
              )}
            </div>
          </div>

          {/* ✅ Office Location (Geo Attendance) */}
          <SectionTitle
            title="Office Location (Geo Attendance)"
            subtitle="Used to validate employee GPS check-in radius."
          />
          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1.2fr_auto] gap-4 items-end">
            <Input
              label="Office Latitude"
              value={form.office_lat}
              onChange={(v) => handleChange("office_lat", v)}
              error={errors.office_lat}
              placeholder="e.g. 28.613939"
            />
            <Input
              label="Office Longitude"
              value={form.office_lng}
              onChange={(v) => handleChange("office_lng", v)}
              error={errors.office_lng}
              placeholder="e.g. 77.209021"
            />
            <button
              type="button"
              onClick={useCurrentLocationAsOffice}
              className="px-4 py-2 rounded-lg border border-indigo-300 text-xs font-medium text-indigo-700 hover:bg-indigo-50"
            >
              Use Current Location
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            Employees will only be able to punch attendance if they are within
            100m of this office location.
          </p>

          {/* Subscription (editable basic fields only) */}
          <SectionTitle
            title="Subscription"
            subtitle="Plan and billing preferences."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Plan"
              options={["free", "basic", "pro", "enterprise"]}
              value={form.subscription_plan || "free"}
              onChange={(v) => handleChange("subscription_plan", v)}
            />
            <Select
              label="Billing Cycle"
              options={["monthly", "yearly"]}
              value={form.billing_cycle || "monthly"}
              onChange={(v) => handleChange("billing_cycle", v)}
            />
          </div>

          {/* Footer buttons (mobile friendly) */}
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleReset}
              disabled={saving}
              className="px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-60"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 flex items-center gap-2"
            >
              {saving && (
                <span className="h-4 w-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
              )}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------ Small Reusable Components -------------- */

function SectionTitle({ title, subtitle }) {
  return (
    <div className="mb-2">
      <h3 className="font-semibold text-base text-slate-800">{title}</h3>
      {subtitle && (
        <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-700 text-right">{value}</span>
    </div>
  );
}

function Input({ label, value, onChange, error, required, placeholder }) {
  return (
    <div className="flex flex-col">
      <label className="text-sm text-slate-600 mb-1">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input
        value={value || ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`border rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400 ${
          error ? "border-rose-400" : "border-slate-300"
        }`}
      />
      {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
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
        className="border border-slate-300 rounded-lg p-2 h-24 focus:ring-2 focus:ring-indigo-400 outline-none text-sm"
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col">
      <label className="text-sm text-slate-600 mb-1">{label}</label>
      <select
        value={value || options[0]}
        onChange={(e) => onChange(e.target.value)}
        className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-400 outline-none text-sm"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
}
