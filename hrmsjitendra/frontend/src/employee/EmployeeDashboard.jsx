import React, { useEffect, useMemo, useState } from "react";
import api from "../api";
import { MapPin, LogIn, LogOut, Clock, Coffee, Activity } from "lucide-react";

const RADIUS_METERS = 100;

export default function EmployeeDashboard() {
  const [loading, setLoading] = useState(true);
  const [att, setAtt] = useState(null);
  const [user, setUser] = useState(null);

  const [org, setOrg] = useState(null);
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [distance, setDistance] = useState(null);
  const [geoError, setGeoError] = useState("");

  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState(null); // {type: 'success'|'error', text}

  const today = new Date();
  const todayDate = today.toISOString().slice(0, 10);
  const todayLabel = today.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  useEffect(() => {
    load();
    getLocation();
  }, []);

  // ===== LOAD USER + TODAY ATTENDANCE + ORG (for office lat/lng) =====
  const load = async () => {
    try {
      setLoading(true);
      setActionMsg(null);

      const [me, todayAtt, orgRes] = await Promise.all([
        api.get("/auth/me"),
        api.get("/attendance/today"),
        api.get("/organizations/me"),
      ]);

      setUser(me.data);
      setAtt(todayAtt.data);
      setOrg(orgRes.data);
    } catch (err) {
      console.log("DASH LOAD ERROR:", err);
      setActionMsg({
        type: "error",
        text: "Failed to load dashboard data.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Get Geo Location
  const getLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geo location not supported in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setGeoError("");
      },
      (err) => {
        setGeoError("Please allow location permission to punch attendance.");
        console.log(err);
      }
    );
  };

  // Haversine
  const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };


// ✅ Device ID generator (one-time per browser)
function getDeviceId() {
  let id = localStorage.getItem("device_id");
  if (!id) {
    id = crypto.randomUUID(); // modern browsers
    localStorage.setItem("device_id", id);
  }
  return id;
}


  // distance calc jab bhi coords/org change ho
  useEffect(() => {
    if (
      coords.lat &&
      coords.lng &&
      org?.office_lat &&
      org?.office_lng
    ) {
      const d = getDistanceFromLatLonInMeters(
        Number(org.office_lat),
        Number(org.office_lng),
        coords.lat,
        coords.lng
      );
      setDistance(Math.round(d));
    }
  }, [coords, org]);

  const insideRadius = useMemo(() => {
    if (distance == null) return false;
    return distance <= RADIUS_METERS;
  }, [distance]);

  // ===== Helpers =====
  const formatTime = (val) => {
    if (!val) return "--";
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return "--";
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (minutes) => {
    const m = minutes || 0;
    const h = Math.floor(m / 60);
    const r = m % 60;
    if (h <= 0) return `${r} min`;
    return `${h}h ${r}m`;
  };

  const todayStatus = useMemo(() => {
    if (!att || !att?.check_in) return "Not started";
    if (att.check_in && !att.check_out) return "Working";
    return "Completed";
  }, [att]);

  const statusChipClass =
    todayStatus === "Not started"
      ? "bg-slate-100 text-slate-700 border-slate-200"
      : todayStatus === "Working"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-indigo-50 text-indigo-700 border-indigo-200";

  const showError = (text) =>
    setActionMsg({
      type: "error",
      text,
    });

  const showSuccess = (text) =>
    setActionMsg({
      type: "success",
      text,
    });

  const checkLocationBeforePunch = () => {
    if (!coords.lat || !coords.lng) {
      showError("Location not detected. Please enable GPS & refresh.");
      return false;
    }
    if (!insideRadius) {
      showError(
        `You are outside the allowed ${RADIUS_METERS}m office radius.`
      );
      return false;
    }
    return true;
  };

 const checkIn = async () => {
  if (!checkLocationBeforePunch()) return;

  try {
    setActionLoading(true);
    setActionMsg(null);

    const deviceId = getDeviceId(); // 👈 NEW

    const res = await api.post("/attendance/checkin", {
      lat: coords.lat,
      lng: coords.lng,
      device_id: deviceId, // 👈 REQUIRED
    });

    showSuccess(res?.data?.message || "Check-in successful.");
    await load();
  } catch (err) {
    console.log("CHECKIN ERROR:", err);
    showError(
      err?.response?.data?.message || "Failed to check in. Try again."
    );
  } finally {
    setActionLoading(false);
  }
};



  // ⭐ GEO CHECK-OUT
const checkOut = async () => {
  if (!checkLocationBeforePunch()) return;

  try {
    setActionLoading(true);
    setActionMsg(null);

    const deviceId = getDeviceId(); // 👈 SAME DEVICE ID

    const res = await api.post("/attendance/checkout", {
      lat: coords.lat,
      lng: coords.lng,
      device_id: deviceId, // 👈 REQUIRED
    });

    showSuccess(res?.data?.message || "Check-out successful.");
    await load();
  } catch (err) {
    console.log("CHECKOUT ERROR:", err);
    showError(
      err?.response?.data?.message || "Failed to check out. Try again."
    );
  } finally {
    setActionLoading(false);
  }
};


  const breakStart = async () => {
    try {
      setActionLoading(true);
      setActionMsg(null);
      const res = await api.post("/attendance/break-start");
      showSuccess(res?.data?.message || "Break started.");
      await load();
    } catch (err) {
      console.log("BREAK START ERROR:", err);
      showError(
        err?.response?.data?.message || "Failed to start break."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const breakEnd = async () => {
    try {
      setActionLoading(true);
      setActionMsg(null);
      const res = await api.post("/attendance/break-end");
      showSuccess(res?.data?.message || "Break ended.");
      await load();
    } catch (err) {
      console.log("BREAK END ERROR:", err);
      showError(
        err?.response?.data?.message || "Failed to end break."
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Today · {todayDate}
          </p>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome, {user?.name}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{todayLabel}</p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2">
          <span
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium ${statusChipClass}`}
          >
            <span className="h-2 w-2 rounded-full bg-current" />
            <span>Today Status:</span>
            <span>{todayStatus}</span>
          </span>

          {distance != null ? (
            <p className="text-[11px] text-slate-500">
              You are{" "}
              <span className="font-semibold text-slate-900">
                {distance}m
              </span>{" "}
              from office.
            </p>
          ) : geoError ? (
            <p className="text-[11px] text-rose-500 max-w-xs">{geoError}</p>
          ) : (
            <p className="text-[11px] text-slate-400">
              Fetching current location...
            </p>
          )}
        </div>
      </div>

      {/* Action message */}
      {actionMsg && (
        <div
          className={`flex items-start gap-3 p-3 mb-4 rounded-lg text-sm shadow-sm border ${
            actionMsg.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-700"
          }`}
        >
          <span className="mt-0.5 text-lg">
            {actionMsg.type === "success" ? "✅" : "⚠️"}
          </span>
          <div className="flex-1">{actionMsg.text}</div>
        </div>
      )}

      {/* Geo Location Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-5 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <MapPin size={18} className="text-indigo-500" />
            Current Location
          </h3>
          <button
            onClick={getLocation}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-slate-200 text-[11px] text-slate-500 hover:bg-slate-50"
          >
            <Activity size={12} />
            Refresh
          </button>
        </div>
        <p className="text-sm mt-1">
          Lat:{" "}
          <span className="font-mono">
            {coords.lat ? coords.lat.toFixed(6) : "--"}
          </span>{" "}
          | Lng:{" "}
          <span className="font-mono">
            {coords.lng ? coords.lng.toFixed(6) : "--"}
          </span>
        </p>
        {org?.office_lat && (
          <p className="text-xs text-slate-500 mt-1">
            Office: {org.address || org.city || org.name} (
            {org.office_lat}, {org.office_lng})
          </p>
        )}
        {distance != null && (
          <p className="text-xs mt-2">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                insideRadius
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {insideRadius ? "Inside 100m radius" : "Outside 100m radius"}
            </span>
          </p>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Check In"
          value={formatTime(att?.check_in)}
          icon={<LogIn size={18} />}
          hint="First punch time"
        />
        <StatCard
          title="Check Out"
          value={formatTime(att?.check_out)}
          icon={<LogOut size={18} />}
          hint="Last punch time"
        />
        <StatCard
          title="Work Time"
          value={formatDuration(att?.total_minutes)}
          icon={<Clock size={18} />}
          hint="Excluding breaks"
        />
        <StatCard
          title="Break Time"
          value={formatDuration(att?.break_minutes)}
          icon={<Coffee size={18} />}
          hint="Total break duration"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-10">
        {!att?.check_in ? (
          <PrimaryButton
            label="Check In (Geo)"
            icon={<LogIn size={16} />}
            onClick={checkIn}
            disabled={actionLoading || !insideRadius}
          />
        ) : !att?.check_out ? (
          <PrimaryButton
            label="Check Out (Geo)"
            icon={<LogOut size={16} />}
            variant="danger"
            onClick={checkOut}
            disabled={actionLoading || !insideRadius}
          />
        ) : (
          <button
            className="px-5 py-2.5 bg-slate-300 text-slate-700 rounded-lg text-sm font-semibold cursor-not-allowed"
            disabled
          >
            Day Finished
          </button>
        )}

        {att?.break_active ? (
          <button
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold shadow-sm disabled:opacity-50"
            onClick={breakEnd}
            disabled={actionLoading}
          >
            <Coffee size={16} className="inline mr-1" />
            End Break
          </button>
        ) : (
          <button
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={breakStart}
            disabled={actionLoading || !att?.check_in || att?.check_out}
          >
            <Coffee size={16} className="inline mr-1" />
            Start Break
          </button>
        )}

        {!insideRadius && (
          <p className="text-xs text-amber-600 mt-1">
            You are outside the {RADIUS_METERS}m office radius. Move closer to
            punch attendance.
          </p>
        )}
      </div>

      {/* Monthly Attendance Placeholder */}
      <div className="bg-white shadow-sm border border-slate-200 p-5 rounded-xl mb-10">
        <h2 className="text-xl font-semibold mb-2 text-slate-800">
          Monthly Attendance
        </h2>
        <p className="text-sm text-slate-500">
          Calendar view coming soon...
        </p>
      </div>

      {/* Recent Attendance */}
      <div className="bg-white shadow-sm border border-slate-200 p-5 rounded-xl">
        <h2 className="text-xl font-semibold mb-2 text-slate-800">
          Recent Attendance
        </h2>
        <p className="text-sm text-slate-500">
          Table will appear here...
        </p>
      </div>
    </>
  );
}

/* ------- Small components ------- */

function StatCard({ title, value, icon, hint }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {title}
        </p>
        <span className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500">
          {icon}
        </span>
      </div>
      <h2 className="mt-2 text-xl font-semibold text-slate-900">{value}</h2>
      {hint && (
        <p className="mt-1 text-[11px] text-slate-400 leading-tight">
          {hint}
        </p>
      )}
    </div>
  );
}

function PrimaryButton({ label, icon, onClick, disabled, variant = "primary" }) {
  const base =
    "px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const theme =
    variant === "danger"
      ? "bg-red-600 hover:bg-red-700 text-white"
      : "bg-green-600 hover:bg-green-700 text-white";

  return (
    <button className={`${base} ${theme}`} onClick={onClick} disabled={disabled}>
      {icon}
      {label}
    </button>
  );
}
