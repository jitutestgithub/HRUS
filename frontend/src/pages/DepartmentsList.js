import React, { useEffect, useState } from "react";
import api from "../api";

export default function DepartmentsList() {
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const load = async () => {
      const res = await api.get("/departments");
      setDepartments(res.data);
    };
    load();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Departments</h2>

      <a href="/departments/add">+ Add Department</a>

      <ul>
        {departments.map((d) => (
          <li key={d.id}>{d.name}</li>
        ))}
      </ul>
    </div>
  );
}
