import React from "react";

export default function ProfileCompletion({ completion }) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Profile Completion</h2>

      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          className="bg-green-600 h-4 transition-all"
          style={{ width: `${completion}%` }}
        ></div>
      </div>

      <p className="mt-2 text-sm text-gray-600">
        Your profile is <b>{completion}%</b> complete.
      </p>
    </div>
  );
}
