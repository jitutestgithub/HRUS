// src/employee/EmployeeProfile/ProfileHeader.jsx
import React from "react";
import { User, Mail, Briefcase, Camera } from "lucide-react";

export default function ProfileHeader({ profile, onUploadPhoto }) {
  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    onUploadPhoto(file);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow border border-gray-100 flex flex-col md:flex-row md:items-center gap-4">
      <div className="flex justify-center md:block">
        <div className="relative">
          <img
            src={profile.photo ? profile.photo : "/default-user.png"}
            alt="Profile"
            className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border shadow-lg"
          />
          <label className="absolute bottom-1 right-1 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 shadow">
            <Camera size={16} />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleChange}
            />
          </label>
        </div>
      </div>

      <div className="flex-1">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <User size={20} /> {profile.first_name} {profile.last_name}
        </h2>
        <p className="flex items-center gap-2 text-gray-600 text-sm mt-1">
          <Mail size={16} /> {profile.email}
        </p>
        <p className="flex items-center gap-2 text-gray-600 text-sm mt-1">
          <Briefcase size={16} /> {profile.designation || "--"} ·{" "}
          {profile.department_name || "--"}
        </p>
        <p className="text-gray-500 text-xs mt-1">
          Employee Code: <b>{profile.employee_code}</b>
        </p>
      </div>
    </div>
  );
}
