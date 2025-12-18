import React, { useState, useEffect } from "react";
import api from "../../api";
import { UploadCloud } from "lucide-react";

export default function DocumentsSection() {
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    try {
      const res = await api.get("/employee/docs");
      setDocs(res.data);
    } catch (err) {
      console.error("Docs load failed", err);
    }
  };

  const uploadDoc = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const fd = new FormData();
      fd.append("doc", file);

      await api.post("/employee/docs", fd);
      loadDocs();
    } catch (err) {
      console.error("Upload failed");
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">KYC Documents</h2>

      <label className="cursor-pointer flex items-center gap-2 border p-3 rounded-lg bg-gray-50 hover:bg-gray-100">
        <UploadCloud size={18} />
        Upload Document
        <input type="file" className="hidden" onChange={uploadDoc} />
      </label>

      <ul className="mt-4 space-y-2">
        {docs.map((d) => (
          <li
            key={d.id}
            className="p-2 border rounded-md bg-gray-50 flex justify-between"
          >
            <span>{d.file_name}</span>
            <a
              href={d.url}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 text-sm"
            >
              View
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
