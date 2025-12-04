// src/employee/EmployeeProfile/index.jsx
import React, { useEffect, useState } from "react";
import EmployeeLayout from "../EmployeeLayout";
import api from "../api"; // adjust if path differs
import ProfileHeader from "./ProfileHeader";
import SidebarTabs from "./SidebarTabs";

import BasicInfo from "./tabs/BasicInfo";
import PersonalDetails from "./tabs/PersonalDetails";
import AddressSection from "./tabs/AddressSection";
import EmergencySection from "./tabs/EmergencySection";
import BankDetails from "./tabs/BankDetails";
import DocumentsSection from "./tabs/DocumentsSection";
import SkillsSection from "./tabs/SkillsSection";
import ExperienceTimeline from "./tabs/ExperienceTimeline";
import ProfileCompletion from "./tabs/ProfileCompletion";

export default function EmployeeProfile() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("basic");
  const [msg, setMsg] = useState("");
  const [profile, setProfile] = useState({});
  const [completion, setCompletion] = useState(0);

  // password change modal state yahi rakho ya alag page
  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  useEffect(() => {
    loadProfile();
    loadCompletion();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get("/employee/me");
      setProfile(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const loadCompletion = async () => {
    try {
      const res = await api.get("/employee/profile-completion");
      setCompletion(res.data.completion || 0);
    } catch (err) {
      console.error("completion error:", err);
    }
  };

  // Common profile update handler (basic + personal + address etc.)
  const updateProfile = async (updatedFields) => {
    try {
      const payload = { ...profile, ...updatedFields };
      await api.put("/employee/update", payload);
      setProfile(payload);
      setMsg("success: Profile updated successfully!");
      loadCompletion();
    } catch (err) {
      console.error(err);
      setMsg("error: Failed to update profile.");
    }
  };

  // Photo upload handler (reuse)
  const uploadPhoto = async (file) => {
    const formData = new FormData();
    formData.append("photo", file);

    try {
      const res = await api.post("/employee/upload-photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile((p) => ({ ...p, photo: res.data.photo }));
      setMsg("success: Profile photo updated!");
      loadCompletion();
    } catch (err) {
      console.error(err);
      setMsg("error: Failed to upload photo.");
    }
  };

  const clearMessage = () => setMsg("");

  if (loading) {
    return (
      <EmployeeLayout>
        <p>Loading profile...</p>
      </EmployeeLayout>
    );
  }

  return (
    <EmployeeLayout>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* LEFT: sidebar tabs */}
        <SidebarTabs activeTab={activeTab} onChange={setActiveTab} />

        {/* RIGHT: main content */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-4">My Profile</h1>

          {msg && (
            <div
              className={`p-3 mb-4 rounded text-white shadow cursor-pointer`}
              onClick={clearMessage}
            >
              <span
                className={
                  msg.startsWith("success") ? "text-green-100" : "text-red-100"
                }
              >
                {msg.replace("success: ", "").replace("error: ", "")}
              </span>
            </div>
          )}

          {/* Header with photo + basic */}
          <ProfileHeader profile={profile} onUploadPhoto={uploadPhoto} />

          {/* Zoho-style top tabs per main tab (simple for now) */}
          <div className="mt-4 bg-white rounded-xl shadow border border-gray-100 p-4">
            {activeTab === "basic" && (
              <BasicInfo profile={profile} onUpdate={updateProfile} />
            )}

            {activeTab === "personal" && (
              <PersonalDetails profile={profile} onUpdate={updateProfile} />
            )}

            {activeTab === "address" && (
              <AddressSection profile={profile} onUpdate={updateProfile} />
            )}

            {activeTab === "emergency" && (
              <EmergencySection profile={profile} onUpdate={updateProfile} />
            )}

            {activeTab === "bank" && (
              <BankDetails profile={profile} />
            )}

            {activeTab === "documents" && (
              <DocumentsSection profile={profile} />
            )}

            {activeTab === "skills" && (
              <SkillsSection profile={profile} />
            )}

            {activeTab === "experience" && (
              <ExperienceTimeline profile={profile} />
            )}

            {activeTab === "completion" && (
              <ProfileCompletion completion={completion} />
            )}
          </div>
        </div>
      </div>
    </EmployeeLayout>
  );
}
