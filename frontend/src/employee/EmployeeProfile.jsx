import React, { useEffect, useState } from "react";
import api from "../api";
import EmployeeLayout from "./EmployeeLayout";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Edit3,
  Lock,
  Camera,
} from "lucide-react";

export default function EmployeeProfile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [changePass, setChangePass] = useState(false);
  const [form, setForm] = useState({});
  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get("/employee/me");
      setProfile(res.data);
      setForm(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // Upload Photo
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("photo", file);

    try {
      const res = await api.post("/employee/upload-photo", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setProfile((p) => ({ ...p, photo: res.data.photo }));

      setMsg("success: Profile photo updated!");

    } catch (err) {
      setMsg("error: Failed to upload photo");
    }
  };

  // Update Profile
  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put("/employee/update", form);
      setMsg("success: Profile updated successfully!");
      setEditMode(false);
      loadProfile();
    } catch (err) {
      console.error(err);
      setMsg("error: Failed to update profile.");
    }
  };

  // Update Password
  const updatePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) {
      setMsg("error: New passwords do not match.");
      return;
    }

    try {
      await api.put("/employee/change-password", passwords);
      setMsg("success: Password updated successfully!");
      setChangePass(false);
      setPasswords({ current: "", newPass: "", confirm: "" });
    } catch (err) {
      console.log(err);
      setMsg("error: Password update failed.");
    }
  };

  if (loading)
    return (
      <EmployeeLayout>
        <p>Loading profile...</p>
      </EmployeeLayout>
    );

  return (
    <EmployeeLayout>
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      {/* ALERT */}
      {msg && (
        <div
          className={`p-3 mb-4 rounded text-white shadow ${
            msg.startsWith("success") ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {msg.replace("success: ", "").replace("error: ", "")}
        </div>
      )}

      {/* PROFILE CARD */}
      <div className="bg-white p-6 shadow rounded-xl mb-8 border border-gray-100">

        {/* PHOTO + HEADER */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <img
              src={profile.photo ? profile.photo : "/default-user.png"}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border shadow-lg"
            />


            {/* Upload Button */}
            <label className="absolute bottom-1 right-1 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 shadow">
              <Camera size={16} />
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={handlePhotoUpload}
              />
            </label>
          </div>

          <h2 className="text-xl font-semibold mt-4 flex items-center gap-2">
            <User size={20} /> {profile.first_name} {profile.last_name}
          </h2>

          <p className="text-gray-500 text-sm">
            Employee Code: <b>{profile.employee_code}</b>
          </p>
        </div>

        {/* VIEW MODE */}
        {!editMode && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            <Info icon={<User size={18} />} label="Full Name" value={`${profile.first_name} ${profile.last_name}`} />
            <Info icon={<Mail size={18} />} label="Email" value={profile.email} />
            <Info icon={<Phone size={18} />} label="Phone" value={profile.phone || "--"} />
            <Info icon={<Briefcase size={18} />} label="Department" value={profile.department_name || "--"} />
            <Info icon={<Briefcase size={18} />} label="Designation" value={profile.designation || "--"} />
            <Info icon={<Calendar size={18} />} label="Join Date" value={profile.join_date || "--"} />
          </div>
        )}

        {/* EDIT MODE */}
        {editMode && (
          <form onSubmit={updateProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <Input
              label="First Name"
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            />

            <Input
              label="Last Name"
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            />

            <Input
              label="Phone"
              value={form.phone || ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />

            <Input
              label="Designation"
              value={form.designation || ""}
              onChange={(e) => setForm({ ...form, designation: e.target.value })}
            />

            {/* Save Buttons */}
            <div className="col-span-2 mt-4 flex gap-3">
              <button className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow">
                Save Changes
              </button>
              <button
                type="button"
                className="px-5 py-2 bg-gray-400 text-white rounded-lg shadow"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {!editMode && (
          <button
            className="mt-6 flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow"
            onClick={() => setEditMode(true)}
          >
            <Edit3 size={18} /> Edit Profile
          </button>
        )}
      </div>

      {/* PASSWORD SECTION */}
      <div className="bg-white p-6 shadow rounded-xl border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Lock size={20} /> Change Password
        </h2>

        {!changePass ? (
          <button
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow"
            onClick={() => setChangePass(true)}
          >
            Update Password
          </button>
        ) : (
          <form onSubmit={updatePassword} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <Input
              label="Current Password"
              type="password"
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
            />

            <Input
              label="New Password"
              type="password"
              value={passwords.newPass}
              onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
            />

            <Input
              label="Confirm New Password"
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
            />

            <div className="col-span-2 mt-4 flex gap-3">
              <button className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow">
                Save Password
              </button>
              <button
                type="button"
                className="px-5 py-2 bg-gray-400 text-white rounded-lg shadow"
                onClick={() => setChangePass(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </EmployeeLayout>
  );
}

/* REUSABLE COMPONENTS */
function Info({ label, value, icon }) {
  return (
    <div className="flex flex-col p-3 border rounded-lg bg-gray-50 shadow-sm">
      <div className="flex items-center gap-2 text-gray-600 text-sm">
        {icon} {label}
      </div>
      <p className="font-semibold mt-1">{value}</p>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block mb-1 font-medium">{label}</label>
      <input
        className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
        {...props}
      />
    </div>
  );
}
