import React, { useEffect, useState } from "react";
import api from "../api";

export default function EmployeeDashboard() {
  const [loading, setLoading] = useState(true);
  const [att, setAtt] = useState(null);
  const [user, setUser] = useState(null);
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const todayDate = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    load();
    getLocation();
  }, []);

  // ✅ Get Geo Location
  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("Geo location not supported!");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        alert("Please allow location permission!");
        console.log(err);
      }
    );
  };

  const load = async () => {
    try {
      setLoading(true);
      const me = await api.get("/auth/me");
      setUser(me.data);

      const res = await api.get("/attendance/today");
      setAtt(res.data);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  // ⭐ GEO CHECK-IN
  const checkIn = async () => {
    if (!coords.lat || !coords.lng) {
      return alert("Location not detected! Please enable GPS.");
    }

    await api.post("/attendance/checkin", {
      lat: coords.lat,
      lng: coords.lng,
    });

    load();
  };

  // ⭐ GEO CHECK-OUT
  const checkOut = async () => {
    if (!coords.lat || !coords.lng) {
      return alert("Location not detected! Please enable GPS.");
    }

    await api.post("/attendance/checkout", {
      lat: coords.lat,
      lng: coords.lng,
    });

    load();
  };

  const breakStart = async () => {
    await api.post("/attendance/break-start");
    load();
  };

  const breakEnd = async () => {
    await api.post("/attendance/break-end");
    load();
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
        <p className="text-gray-600">{todayDate}</p>
      </div>

      {/* Geo Location Card */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded mb-5">
        <h3 className="font-semibold text-blue-800">📍 Current Location</h3>
        <p className="text-sm mt-1">
          Lat: {coords.lat || "--"} | Lng: {coords.lng || "--"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card title="Check In" value={att?.check_in || "--"} />
        <Card title="Check Out" value={att?.check_out || "--"} />
        <Card title="Work Hours" value={`${att?.total_minutes || 0} min`} />
        <Card title="Break" value={`${att?.break_minutes || 0} min`} />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-10">
        {!att?.check_in ? (
          <button
            className="px-5 py-2 bg-green-600 text-white rounded"
            onClick={checkIn}
          >
            Check In (Geo)
          </button>
        ) : !att?.check_out ? (
          <button
            className="px-5 py-2 bg-red-600 text-white rounded"
            onClick={checkOut}
          >
            Check Out (Geo)
          </button>
        ) : (
          <button className="px-5 py-2 bg-gray-400 text-white rounded" disabled>
            Day Finished
          </button>
        )}

        {att?.break_active ? (
          <button
            className="px-5 py-2 bg-yellow-600 text-white rounded"
            onClick={breakEnd}
          >
            End Break
          </button>
        ) : (
          <button
            className="px-5 py-2 bg-blue-600 text-white rounded"
            onClick={breakStart}
          >
            Start Break
          </button>
        )}
      </div>

      {/* Monthly Attendance Placeholder */}
      <div className="bg-white shadow p-5 rounded mb-10">
        <h2 className="text-xl font-semibold mb-3">Monthly Attendance</h2>
        <p className="text-gray-500">Calendar view coming soon...</p>
      </div>

      {/* Recent Attendance */}
      <div className="bg-white shadow p-5 rounded">
        <h2 className="text-xl font-semibold mb-3">Recent Attendance</h2>
        <p className="text-gray-500">Table will appear here...</p>
      </div>
    </>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <p className="text-gray-500">{title}</p>
      <h2 className="text-xl font-semibold">{value}</h2>
    </div>
  );
}