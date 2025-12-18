import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

export default function EmployeeProfile() {
  const { id } = useParams();
  const [emp, setEmp] = useState(null);

  useEffect(() => {
    loadEmployee();
  }, []);

  const loadEmployee = async () => {
    try {
      const res = await api.get(`/employees/${id}`);
      setEmp(res.data);
    } catch (err) {
      console.error("PROFILE LOAD ERROR:", err);
    }
  };

  if (!emp) return <p>Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">
        {emp.first_name} {emp.last_name}
      </h2>

      <div className="bg-white shadow border p-6 rounded-xl">
        <p><strong>Email:</strong> {emp.email}</p>
        <p><strong>Phone:</strong> {emp.phone}</p>
        <p><strong>Department:</strong> {emp.department_name}</p>
        <p><strong>Designation:</strong> {emp.designation}</p>
        <p><strong>Join Date:</strong> {emp.join_date}</p>
        <p><strong>Status:</strong> {emp.status}</p>
      </div>
    </div>
  );
}
