import React, { useState, useEffect } from "react";
import api from "../../api";
import { X } from "lucide-react";

export default function SkillsSection() {
  const [skills, setSkills] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const res = await api.get("/employee/skills");
      setSkills(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const addSkill = async () => {
    if (!input) return;
    try {
      await api.post("/employee/skills", { skill: input });
      setInput("");
      loadSkills();
    } catch (err) {}
  };

  const removeSkill = async (skill) => {
    try {
      await api.delete(`/employee/skills/${skill}`);
      loadSkills();
    } catch (err) {}
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Skills</h2>

      <div className="flex gap-2 mb-4">
        <input
          className="flex-1 border p-2 rounded-lg"
          placeholder="Add skill..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          onClick={addSkill}
          className="px-4 bg-green-600 text-white rounded-lg"
        >
          Add
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {skills.map((s) => (
          <span
            key={s}
            className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
          >
            {s}
            <X
              className="cursor-pointer"
              size={14}
              onClick={() => removeSkill(s)}
            />
          </span>
        ))}
      </div>
    </div>
  );
}
