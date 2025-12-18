import React, { useState, useEffect } from "react";
import api from "../../api";

export default function ExperienceTimeline() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    loadTimeline();
  }, []);

  const loadTimeline = async () => {
    try {
      const res = await api.get("/employee/experience");
      setItems(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Experience Timeline</h2>

      <div className="relative border-l border-gray-300 pl-6">
        {items.map((item) => (
          <div key={item.id} className="mb-6">
            <div className="absolute -left-2.5 w-4 h-4 bg-green-600 rounded-full"></div>
            <h3 className="font-semibold">{item.title}</h3>
            <p className="text-sm text-gray-600">
              {item.company} • {item.start_date} → {item.end_date || "Present"}
            </p>
            <p className="text-gray-700 text-sm mt-1">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
