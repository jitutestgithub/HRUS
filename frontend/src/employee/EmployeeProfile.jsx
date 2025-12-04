import React, { useEffect, useState } from "react";
import api from "../api";
import EmployeeLayout from "./EmployeeLayout";

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

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put("/employee/update", form);
      setMsg("Profile updated successfully!");
      setEditMode(false);
      loadProfile();
    } catch (err) {
      console.error(err);
      setMsg("Failed to update profile.");
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) {
      setMsg("New passwords do not match.");
      return;
    }

    try {
      const res = await api.put("/employee/change-password", passwords);
      setMsg("Password updated successfully!");
      setChangePass(false);
      setPasswords({
        current: "",
        newPass: "",
        confirm: "",
      });
    } catch (err) {
      console.log(err);
      setMsg("Password update failed.");
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

      {msg && (
        <div
          className={`p-3 mb-4 rounded text-white ${
            msg.includes("success") ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {msg}
        </div>
      )}

      {/* PROFILE CARD */}
      <div className="bg-white p-6 shadow rounded mb-8">

        {/* PHOTO + NAME */}
        <div className="flex items-center gap-6 mb-6">
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xl">
            {profile?.first_name?.charAt(0)}
          </div>

          <div>
            <h2 className="text-xl font-semibold">
              {profile.first_name} {profile.last_name}
            </h2>
            <p className="text-gray-500">{profile.email}</p>
            <p className="text-gray-500">Employee Code: {profile.employee_code}</p>
          </div>
        </div>

        {/* DETAILS */}
        {!editMode && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Info label="Full Name" value={`${profile.first_name} ${profile.last_name}`} />
            <Info label="Email" value={profile.email} />
            <Info label="Phone" value={profile.phone || "--"} />
            <Info label="Department" value={profile.department_name || "--"} />
            <Info label="Designation" value={profile.designation || "--"} />
            <Info label="Join Date" value={profile.join_date || "--"} />
          </div>
        )}

        {/* EDIT FORM */}
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

            <div className="col-span-2 mt-4">
              <button className="px-4 py-2 bg-green-600 text-white rounded" type="submit">
                Save Changes
              </button>
              <button
                className="ml-3 px-4 py-2 bg-gray-400 text-white rounded"
                type="button"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* EDIT BUTTON */}
        {!editMode && (
          <button
            className="mt-5 px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => setEditMode(true)}
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* CHANGE PASSWORD SECTION */}
      <div className="bg-white p-6 shadow rounded">
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>

        {!changePass ? (
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => setChangePass(true)}
          >
            Change Password
          </button>
        ) : (
          <form onSubmit={updatePassword} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Current Password"
              type="password"
              value={passwords.current}
              onChange={(e) =>
                setPasswords({ ...passwords, current: e.target.value })
              }
            />

            <Input
              label="New Password"
              type="password"
              value={passwords.newPass}
              onChange={(e) =>
                setPasswords({ ...passwords, newPass: e.target.value })
              }
            />

            <Input
              label="Confirm New Password"
              type="password"
              value={passwords.confirm}
              onChange={(e) =>
                setPasswords({ ...passwords, confirm: e.target.value })
              }
            />

            <div className="col-span-2 mt-4">
              <button className="px-4 py-2 bg-green-600 text-white rounded" type="submit">
                Update Password
              </button>
              <button
                className="ml-3 px-4 py-2 bg-gray-400 text-white rounded"
                type="button"
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

function Info({ label, value }) {
  return (
    <div>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block mb-1 font-medium">{label}</label>
      <input className="w-full border p-2 rounded" {...props} />
    </div>
  );
}
