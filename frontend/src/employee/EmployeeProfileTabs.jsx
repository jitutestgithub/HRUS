import React, { useEffect, useState } from "react";
import api from "../api";
import EmployeeLayout from "./EmployeeLayout";
import {
  User,
  MapPin,
  CreditCard,
  FileBadge,
  Star,
  Briefcase,
  Camera,
} from "lucide-react";

export default function EmployeeProfileTabs() {
  const [profile, setProfile] = useState({});
  const [activeTab, setActiveTab] = useState("overview");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get("/employee/me");
      setProfile(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // PHOTO UPLOAD
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("photo", file);

    try {
      const res = await api.post("/employee/upload-photo", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProfile((p) => ({ ...p, photo: res.data.photo }));
      setMsg("success: Profile photo updated!");
    } catch (err) {
      console.error(err);
      setMsg("error: Failed to upload photo");
    }
  };

  // PERSONAL INFO UPDATE
  const updatePersonal = async (data) => {
    try {
      await api.put("/employee/update-basic", data);
      setMsg("success: Personal information updated!");
      loadProfile();
    } catch (err) {
      console.error(err);
      setMsg("error: Failed to update personal information");
    }
  };

  // ADDRESS UPDATE
  const updateAddress = async (data) => {
    try {
      await api.put("/employee/update-address", data);
      setMsg("success: Address updated!");
      loadProfile();
    } catch (err) {
      console.error(err);
      setMsg("error: Failed to update address");
    }
  };

  // EMERGENCY UPDATE
  const updateEmergency = async (data) => {
    try {
      await api.put("/employee/update-emergency", data);
      setMsg("success: Emergency contact updated!");
      loadProfile();
    } catch (err) {
      console.error(err);
      setMsg("error: Failed to update emergency contact");
    }
  };

  return (
    <EmployeeLayout>
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      {msg && (
        <div
          className={`p-3 mb-4 rounded text-white ${
            msg.startsWith("success") ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {msg.replace("success: ", "").replace("error: ", "")}
        </div>
      )}

      <div className="flex gap-5">
        {/* LEFT SIDE TABS */}
        <div className="w-64 bg-white shadow border rounded-xl p-4 space-y-1 h-fit">
          <Tab id="overview" label="Overview" icon={<User size={18} />} activeTab={activeTab} setActiveTab={setActiveTab} />
          <Tab id="personal" label="Personal Details" icon={<User size={18} />} activeTab={activeTab} setActiveTab={setActiveTab} />
          <Tab id="address" label="Address & Emergency Contact" icon={<MapPin size={18} />} activeTab={activeTab} setActiveTab={setActiveTab} />
          <Tab id="bank" label="Bank Details" icon={<CreditCard size={18} />} activeTab={activeTab} setActiveTab={setActiveTab} />
          <Tab id="kyc" label="KYC Documents" icon={<FileBadge size={18} />} activeTab={activeTab} setActiveTab={setActiveTab} />
          <Tab id="skills" label="Skills" icon={<Star size={18} />} activeTab={activeTab} setActiveTab={setActiveTab} />
          <Tab id="experience" label="Experience Timeline" icon={<Briefcase size={18} />} activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* RIGHT SIDE CONTENT */}
        <div className="flex-1 bg-white shadow border rounded-xl p-6">
          {activeTab === "overview" && <OverviewTab profile={profile} onPhotoUpload={handlePhotoUpload} />}
          {activeTab === "personal" && <PersonalTab profile={profile} onUpdate={updatePersonal} />}
          {activeTab === "address" && (
            <AddressTab
              profile={profile}
              onUpdateAddress={updateAddress}
              onUpdateEmergency={updateEmergency}
            />
          )}

          {activeTab === "bank" && <BankTab profile={profile} />}
          {activeTab === "kyc" && <KycTab />}
          {activeTab === "skills" && <SkillsTab />}
          {activeTab === "experience" && <ExperienceTab />}
        </div>
      </div>
    </EmployeeLayout>
  );
}

/* ----------------------- TABS BUTTON ----------------------- */
function Tab({ id, label, icon, activeTab, setActiveTab }) {
  return (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left ${
        activeTab === id ? "bg-green-600 text-white shadow" : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

/* ----------------------- OVERVIEW TAB ----------------------- */
function OverviewTab({ profile, onPhotoUpload }) {
  return (
    <>
      <div className="flex flex-col items-center mb-8">
        <div className="relative w-36 h-36">
          <img
            src={profile.photo}
            alt="profile"
            className="w-36 h-36 rounded-full object-cover border shadow bg-gray-100"
            onError={(e) => (e.target.src = "/default-user.png")}
          />

          <label className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 shadow">
            <Camera size={16} />
            <input type="file" className="hidden" accept="image/*" onChange={onPhotoUpload} />
          </label>
        </div>

        <h2 className="text-xl font-semibold mt-4 capitalize">
          {profile.first_name} {profile.last_name}
        </h2>

        <p className="text-gray-500 text-sm">
          Employee Code: <b>{profile.employee_code ?? "--"}</b>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Info label="Email" value={profile.email} />
        <Info label="Phone" value={profile.phone} />
        <Info label="Department" value={profile.department_name} />
        <Info label="Designation" value={profile.designation} />
        <Info label="Join Date" value={profile.join_date} />
      </div>
    </>
  );
}

/* ----------------------- PERSONAL TAB ----------------------- */
function PersonalTab({ profile, onUpdate }) {
  const [form, setForm] = useState({
    gender: profile.gender || "",
    dob: profile.dob || "",
    marital_status: profile.marital_status || "",
    blood_group: profile.blood_group || "",
  });

  const submit = (e) => {
    e.preventDefault();
    onUpdate(form);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <h2 className="text-lg font-semibold">Personal Information</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} />
        <Field label="Date of Birth" type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
        <Field label="Marital Status" value={form.marital_status} onChange={(e) => setForm({ ...form, marital_status: e.target.value })} />
        <Field label="Blood Group" value={form.blood_group} onChange={(e) => setForm({ ...form, blood_group: e.target.value })} />
      </div>

      <div className="flex justify-end">
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg shadow text-sm">Save Personal Info</button>
      </div>
    </form>
  );
}

/* ----------------------- ADDRESS TAB ----------------------- */
function AddressTab({ profile, onUpdateAddress, onUpdateEmergency }) {
  const [addr, setAddr] = useState({
    address: profile.address || "",
    city: profile.city || "",
    state: profile.state || "",
    pincode: profile.pincode || "",
  });

  const [emg, setEmg] = useState({
    emergency_name: profile.emergency_name || "",
    emergency_phone: profile.emergency_phone || "",
    relationship: profile.relationship || "",
  });

  const submitAddress = (e) => {
    e.preventDefault();
    onUpdateAddress(addr);
  };

  const submitEmergency = (e) => {
    e.preventDefault();
    onUpdateEmergency(emg);
  };

  return (
    <div className="space-y-6">
      {/* Address */}
      <form onSubmit={submitAddress} className="space-y-3">
        <h2 className="text-lg font-semibold">Address Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Address" value={addr.address} onChange={(e) => setAddr({ ...addr, address: e.target.value })} />
          <Field label="City" value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} />
          <Field label="State" value={addr.state} onChange={(e) => setAddr({ ...addr, state: e.target.value })} />
          <Field label="Pincode" value={addr.pincode} onChange={(e) => setAddr({ ...addr, pincode: e.target.value })} />
        </div>

        <div className="flex justify-end">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg shadow text-sm">Save Address</button>
        </div>
      </form>

      {/* Emergency Contact */}
      <form onSubmit={submitEmergency} className="space-y-3 border-t pt-4">
        <h2 className="text-lg font-semibold">Emergency Contact</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Person Name" value={emg.emergency_name} onChange={(e) => setEmg({ ...emg, emergency_name: e.target.value })} />
          <Field label="Phone Number" value={emg.emergency_phone} onChange={(e) => setEmg({ ...emg, emergency_phone: e.target.value })} />
          <Field label="Relationship" value={emg.relationship} onChange={(e) => setEmg({ ...emg, relationship: e.target.value })} />
        </div>

        <div className="flex justify-end">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg shadow text-sm">Save Emergency Info</button>
        </div>
      </form>
    </div>
  );
}

/* ----------------------- BANK TAB ----------------------- */
function BankTab({ profile }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Bank Information</h2>

      <Info label="Bank Name" value={profile.bank_name || "--"} />
      <Info label="Account Number" value={profile.bank_account || "--"} />
      <Info label="IFSC Code" value={profile.ifsc_code || "--"} />
      <Info label="PAN Number" value={profile.pan_number || "--"} />
    </div>
  );
}

/* ----------------------- KYC TAB (WORKING) ----------------------- */
function KycTab() {
  const [aadhar, setAadhar] = useState(null);
  const [pan, setPan] = useState(null);
  const [bankPass, setBankPass] = useState(null);
  const [msg, setMsg] = useState("");

  const uploadKYC = async () => {
    const fd = new FormData();
    fd.append("user_id", 1);

    if (aadhar) fd.append("aadhar", aadhar);
    if (pan) fd.append("pan", pan);
    if (bankPass) fd.append("bank_passbook", bankPass);

    try {
      await api.post("/kyc/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMsg("success: KYC Uploaded Successfully");
    } catch (err) {
      console.log(err);
      setMsg("error: Upload Failed");
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Upload KYC Documents</h2>

      {msg && (
        <div
          className={`p-2 mb-3 rounded ${
            msg.startsWith("success") ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {msg.replace("success: ", "").replace("error: ", "")}
        </div>
      )}

      <div className="space-y-4">
        <UploadComponent label="Aadhar Card" file={aadhar} onSelect={setAadhar} />
        <UploadComponent label="PAN Card" file={pan} onSelect={setPan} />
        <UploadComponent label="Bank Passbook" file={bankPass} onSelect={setBankPass} />
      </div>

      <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg" onClick={uploadKYC}>
        Upload Documents
      </button>
    </div>
  );
}

/* ----------------------- SKILLS TAB ----------------------- */
function SkillsTab() {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Skills</h2>

      <div className="flex flex-wrap gap-2">
        <SkillTag label="JavaScript" />
        <SkillTag label="React" />
        <SkillTag label="Node.js" />
        <SkillTag label="Communication" />
      </div>
    </div>
  );
}

/* ----------------------- EXPERIENCE TAB ----------------------- */
function ExperienceTab() {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Experience Timeline</h2>

      <div className="space-y-4 border-l-2 border-green-500 pl-6">
        <ExpItem year="2023" role="Frontend Developer" company="TechSoft" />
        <ExpItem year="2021" role="Intern" company="Web Solutions" />
      </div>
    </div>
  );
}

/* ----------------------- SMALL COMPONENTS ----------------------- */

function Info({ label, value }) {
  return (
    <div className="p-3 border rounded-lg bg-gray-50 shadow-sm">
      <p className="text-gray-600 text-sm">{label}</p>
      <p className="font-semibold">{value || "--"}</p>
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

function UploadComponent({ label, file, onSelect }) {
  return (
    <div className="flex justify-between items-center border p-3 rounded-lg">
      <div>
        <span>{label}</span>
        {file && <p className="text-xs text-green-600 mt-1">{file.name}</p>}
      </div>
      <input type="file" onChange={(e) => onSelect(e.target.files[0])} />
    </div>
  );
}

function SkillTag({ label }) {
  return (
    <span className="px-3 py-1 bg-green-100 text-green-700 font-medium rounded-full text-sm">
      {label}
    </span>
  );
}

function ExpItem({ year, role, company }) {
  return (
    <div>
      <p className="font-semibold">{year}</p>
      <p>
        {role} - {company}
      </p>
    </div>
  );
}
