// src/employee/EmployeeProfile/SidebarTabs.jsx
import React from "react";
import {
  User,
  Info,
  MapPin,
  PhoneCall,
  CreditCard,
  FileText,
  Star,
  Timeline,
  Gauge,
} from "lucide-react";

const tabs = [
  { id: "basic", label: "Basic Info", icon: <User size={16} /> },
  { id: "personal", label: "Personal Details", icon: <Info size={16} /> },
  { id: "address", label: "Address", icon: <MapPin size={16} /> },
  { id: "emergency", label: "Emergency Contact", icon: <PhoneCall size={16} /> },
  { id: "bank", label: "Bank Details", icon: <CreditCard size={16} /> },
  { id: "documents", label: "KYC Documents", icon: <FileText size={16} /> },
  { id: "skills", label: "Skills", icon: <Star size={16} /> },
  { id: "experience", label: "Experience Timeline", icon: <Timeline size={16} /> },
  { id: "completion", label: "Profile Completion", icon: <Gauge size={16} /> },
];

export default function SidebarTabs({ activeTab, onChange }) {
  return (
    <aside className="w-full lg:w-60 bg-white shadow-md rounded-xl border border-gray-100 h-max">
      <div className="p-4 border-b font-semibold text-gray-700">
        Profile Sections
      </div>
      <nav className="p-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm mb-1 text-left transition
              ${
                activeTab === tab.id
                  ? "bg-green-600 text-white shadow"
                  : "text-gray-700 hover:bg-green-50"
              }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
