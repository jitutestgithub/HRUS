import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
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

export default function EmployeeDetails() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState({});
  const [form, setForm] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [changePass, setChangePass] = useState(false);
  const [msg, setMsg] = useState("");

  // ✅ FIXED PASSWORD STATE
  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  /* ---------- LOAD EMPLOYEE ---------- */
  useEffect(() => {
    loadEmployee();
  }, [id]);

  const loadEmployee = async () => {
    try {
      const res = await api.get(`/employees/${id}`);
      setEmployee(res.data);
      setForm(res.data);
    } catch (err) {
      setMsg("error: Failed to load employee");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- PHOTO UPLOAD ---------- */
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("photo", file);
    formData.append("employeeId", id);

    try {
      const res = await api.post("/employee/upload-photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setEmployee((p) => ({ ...p, photo: res.data.photo }));
      setMsg("success: Profile photo updated!");
    } catch (err) {
      setMsg("error: Failed to upload photo");
    }
  };

  /* ---------- UPDATE PROFILE ---------- */
  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put("/employee/update", form);
      setMsg("success: Profile updated successfully!");
      setEditMode(false);
      loadEmployee();
    } catch (err) {
      setMsg("error: Failed to update profile.");
    }
  };

  /* ---------- UPDATE PASSWORD ---------- */
  const updatePassword = async (e) => {
    e.preventDefault();

    if (!passwords.current || !passwords.newPass) {
      setMsg("error: All fields are required");
      return;
    }

    if (passwords.newPass !== passwords.confirm) {
      setMsg("error: Passwords do not match");
      return;
    }

    try {
      await api.put("/employee/change-password", {
        current: passwords.current,
        newPass: passwords.newPass,
      });

      setMsg("success: Password updated successfully!");
      setChangePass(false);
      setPasswords({ current: "", newPass: "", confirm: "" });
    } catch (err) {
      setMsg(
        err.response?.data?.message || "error: Password update failed"
      );
    }
  };

  if (loading) return <p className="p-6">Loading employee...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Employee Profile</h1>

      {/* MESSAGE */}
      {msg && (
        <div
          className={`p-3 mb-4 rounded text-white ${
            msg.startsWith("success") ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {msg.replace("success: ", "").replace("error: ", "")}
        </div>
      )}

      {/* PROFILE CARD */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <img
              src={employee.photo || "/default-user.png"}
              alt="profile"
              className="w-32 h-32 rounded-full object-cover border"
            />
            <label className="absolute bottom-1 right-1 bg-blue-600 p-2 rounded-full text-white cursor-pointer">
              <Camera size={16} />
              <input type="file" hidden onChange={handlePhotoUpload} />
            </label>
          </div>

          <h2 className="mt-4 text-xl font-semibold">
            {employee.first_name} {employee.last_name}
          </h2>
        </div>

        {!editMode && (
          <div className="grid sm:grid-cols-2 gap-4">
            <Info label="Email" value={employee.email} icon={<Mail size={16} />} />
            <Info label="Phone" value={employee.phone} icon={<Phone size={16} />} />
            <Info label="Department" value={employee.department_name} icon={<Briefcase size={16} />} />
            <Info label="Designation" value={employee.designation} icon={<Briefcase size={16} />} />
            <Info label="Join Date" value={employee.join_date} icon={<Calendar size={16} />} />
          </div>
        )}
      </div>

      {/* PASSWORD */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Lock size={18} /> Change Password
        </h2>

        <form onSubmit={updatePassword} className="grid sm:grid-cols-2 gap-4">
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
            label="Confirm Password"
            type="password"
            value={passwords.confirm}
            onChange={(e) =>
              setPasswords({ ...passwords, confirm: e.target.value })
            }
          />

          <div className="col-span-2">
            <button className="bg-green-600 px-4 py-2 text-white rounded">
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- REUSABLE ---------- */
function Info({ label, value, icon }) {
  return (
    <div className="p-3 bg-gray-50 border rounded">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        {icon} {label}
      </div>
      <p className="font-semibold">{value || "--"}</p>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block mb-1 font-medium">{label}</label>
      <input
        className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400"
        {...props}
      />
    </div>
  );
}
