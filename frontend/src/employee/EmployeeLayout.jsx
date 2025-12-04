import React from "react";
import EmployeeSidebar from "./EmployeeSidebar";

export default function EmployeeLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <EmployeeSidebar />

      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
