const pool = require("../../config/db");
function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  return d; // distance in meters
}


// ---------- GET TODAY ----------
exports.getToday = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const orgId = req.user.organization_id;
    const today = new Date().toISOString().slice(0, 10);

    // 1) Attendance record
    const [attRows] = await pool.query(
      "SELECT * FROM attendance_records WHERE employee_id = ? AND date = ?",
      [employeeId, today]
    );

    if (attRows.length === 0) {
      return res.json(null);
    }

    const record = attRows[0];

    // 2) Break summary - clean & safe
    const [breakSummary] = await pool.query(
      `SELECT 
         SUM(
           CASE 
             WHEN break_end IS NOT NULL 
             THEN TIMESTAMPDIFF(MINUTE, break_start, break_end) 
             ELSE 0 
           END
         ) AS break_minutes,
         COUNT(CASE WHEN break_end IS NULL THEN 1 END) AS active_breaks
       FROM attendance_breaks
       WHERE employee_id = ? AND date = ?`,
      [employeeId, today]
    );

    const breakMinutes =
      breakSummary[0].break_minutes !== null
        ? breakSummary[0].break_minutes
        : 0;

    const breakActive = breakSummary[0].active_breaks > 0;

    // 3) Total working minutes
    let totalMinutes = 0;
    if (record.check_in) {
      const endTime = record.check_out ? record.check_out : new Date();
      const [diff] = await pool.query(
        "SELECT TIMESTAMPDIFF(MINUTE, ?, ?) AS minutes",
        [record.check_in, endTime]
      );

      const workMinutes = diff[0].minutes || 0;

      totalMinutes = workMinutes - breakMinutes;
      if (totalMinutes < 0) totalMinutes = 0;
    }

    return res.json({
      ...record,
      break_minutes: breakMinutes,
      break_active: breakActive,
      total_minutes: totalMinutes,
    });
  } catch (err) {
    console.error("getToday:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------- CHECK IN (WITH GEO) ----------
exports.checkIn = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const orgId = req.user.organization_id;
    const { lat, lng } = req.body;

    if (!lat || !lng)
      return res.status(400).json({ message: "Location required!" });

    // Fetch office location
    const [org] = await pool.query(
      "SELECT office_lat, office_lng FROM organizations WHERE id = ?",
      [orgId]
    );

    const officeLat = parseFloat(org[0].office_lat);
    const officeLng = parseFloat(org[0].office_lng);

    // Distance check
    const distance = getDistanceFromLatLonInMeters(
      officeLat,
      officeLng,
      lat,
      lng
    );

    console.log("Distance:", distance);

    if (distance > 100) {
      return res.status(400).json({
        message: "You are outside office radius!",
        distance: Math.round(distance),
      });
    }

    // Insert attendance
    await pool.query(
      `INSERT INTO attendance_records 
       (organization_id, employee_id, date, check_in, status, check_in_lat, check_in_lng)
       VALUES (?, ?, CURDATE(), NOW(), 'present', ?, ?)`,
      [orgId, employeeId, lat, lng]
    );

    res.json({ message: "Check-in successful", distance });
  } catch (error) {
    console.error("CheckIn Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ---------- CHECK OUT (WITH GEO) ----------
exports.checkOut = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { lat, lng } = req.body;
    const today = new Date().toISOString().slice(0, 10);

    if (!lat || !lng)
      return res.status(400).json({ message: "Location required!" });

    // Fetch office location
    const [org] = await pool.query(
      "SELECT office_lat, office_lng FROM organizations WHERE id = ?",
      [req.user.organization_id]
    );

    const officeLat = parseFloat(org[0].office_lat);
    const officeLng = parseFloat(org[0].office_lng);

    const distance = getDistanceFromLatLonInMeters(
      officeLat,
      officeLng,
      lat,
      lng
    );

    if (distance > 100)
      return res.status(400).json({
        message: "You are outside office radius!",
        distance: Math.round(distance),
      });

    const [rows] = await pool.query(
      "SELECT id, check_out FROM attendance_records WHERE employee_id = ? AND date = ?",
      [employeeId, today]
    );

    if (rows.length === 0)
      return res.status(400).json({ message: "No check-in found!" });

    if (rows[0].check_out)
      return res.status(400).json({ message: "Already checked out!" });

    await pool.query(
      `UPDATE attendance_records 
       SET check_out = NOW(), check_out_lat = ?, check_out_lng = ?, 
           work_hours = TIMESTAMPDIFF(MINUTE, check_in, NOW())
       WHERE id = ?`,
      [lat, lng, rows[0].id]
    );

    res.json({ message: "Checked out successfully", distance });
  } catch (err) {
    console.error("checkOut:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ---------- MONTHLY CALENDAR ----------

exports.getMonth = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const orgId = req.user.organization_id;

    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ message: "Missing year or month" });
    }

    const monthPadded = month.padStart(2, "0");
    const start = `${year}-${monthPadded}-01`;
    const end = `${year}-${monthPadded}-31`;

    // Fetch all attendance for month
    const [rows] = await pool.query(
      `SELECT date, status
       FROM attendance_records
       WHERE employee_id = ? 
         AND date BETWEEN ? AND ?
       ORDER BY date ASC`,
      [employeeId, start, end]
    );

    // Convert DB rows into map
    const statusMap = {};
    rows.forEach((r) => {
      statusMap[r.date] = r.status || "present"; // default present
    });

    // Build full month with weekends and holidays
    const result = [];
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${monthPadded}-${String(day).padStart(2, "0")}`;

      const dateObj = new Date(dateStr);
      const weekday = dateObj.getDay(); // 0 = Sunday

      let status = statusMap[dateStr];

      // Weekend auto status
      if (!status && (weekday === 0 || weekday === 6)) {
        status = "weekend";
      }

      // Default status (if no data)
      if (!status) status = "absent";

      result.push({
        date: dateStr,
        status,
      });
    }

    res.json(result);
  } catch (err) {
    console.error("getMonth:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.breakStart = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const orgId = req.user.organization_id;

    // Check-in hua hai?
    const [attRows] = await pool.query(
      "SELECT id FROM attendance_records WHERE employee_id = ? AND date = CURDATE()",
      [employeeId]
    );

    if (attRows.length === 0) {
      return res.status(400).json({ message: "Please check in first" });
    }

    // Already active break?
    const [active] = await pool.query(
      "SELECT id FROM attendance_breaks WHERE employee_id = ? AND date = CURDATE() AND break_end IS NULL",
      [employeeId]
    );

    if (active.length > 0) {
      return res
        .status(400)
        .json({ message: "You already have an active break" });
    }

    await pool.query(
      `INSERT INTO attendance_breaks 
       (organization_id, employee_id, date, break_start)
       VALUES (?, ?, CURDATE(), NOW())`,
      [orgId, employeeId]
    );

    return res.json({ message: "Break started" });
  } catch (err) {
    console.error("breakStart:", err);
    res.status(500).json({ message: "Server error" });
  }
};
exports.breakEnd = async (req, res) => {
  try {
    const employeeId = req.user.id;

    // Active break dhundo
    const [active] = await pool.query(
      "SELECT id FROM attendance_breaks WHERE employee_id = ? AND date = CURDATE() AND break_end IS NULL",
      [employeeId]
    );

    if (active.length === 0) {
      return res.status(400).json({ message: "No active break found" });
    }

    const breakId = active[0].id;

    await pool.query(
      `UPDATE attendance_breaks 
       SET break_end = NOW()
       WHERE id = ?`,
      [breakId]
    );

    return res.json({ message: "Break ended" });
  } catch (err) {
    console.error("breakEnd:", err);
    res.status(500).json({ message: "Server error" });
  }
};
exports.getHistory = async (req, res) => {
  try {
    const employeeId = req.user.id;

    const [rows] = await pool.query(
      `SELECT 
         id,
         date,
         check_in,
         check_out,
         work_hours
       FROM attendance_records
       WHERE employee_id = ?
       ORDER BY date DESC`,
      [employeeId]
    );

    const finalData = [];

    for (const r of rows) {
      // ✅ work_hours is already in minutes
      const workMinutes = r.work_hours || 0;

      const [breakSummary] = await pool.query(
        `SELECT 
           SUM(
             CASE 
               WHEN break_end IS NOT NULL 
               THEN TIMESTAMPDIFF(MINUTE, break_start, break_end)
               ELSE 0 
             END
           ) AS break_minutes
         FROM attendance_breaks
         WHERE employee_id = ? 
           AND date = ?`,
        [employeeId, r.date]
      );

      const breakMinutes =
        breakSummary[0].break_minutes !== null
          ? breakSummary[0].break_minutes
          : 0;

      const totalMinutes = workMinutes - breakMinutes;

      finalData.push({
        ...r,
        work_minutes: workMinutes,
        break_minutes: breakMinutes,
        total_minutes: totalMinutes < 0 ? 0 : totalMinutes,
      });
    }

    res.json(finalData);
  } catch (err) {
    console.error("getHistory:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getByDate = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const date = req.params.date;

    // 1) Attendance rows for that date
    const [rows] = await pool.query(
      `SELECT 
         id,
         date,
         check_in,
         check_out,
         work_hours
       FROM attendance_records a
       WHERE a.employee_id = ? AND a.date = ?
       ORDER BY a.date DESC`,
      [employeeId, date]
    );

    const finalData = [];

    for (const r of rows) {
      // ❗ IMPORTANT: work_hours already minutes hai (checkOut me TIMESTAMPDIFF(MINUTE...) se save kar rahe ho)
      const workMinutes = r.work_hours || 0;

      // 2) Break minutes
      const [breakSummary] = await pool.query(
        `SELECT 
           SUM(
             CASE 
               WHEN break_end IS NOT NULL 
               THEN TIMESTAMPDIFF(MINUTE, break_start, break_end)
               ELSE 0 
             END
           ) AS break_minutes
         FROM attendance_breaks
         WHERE employee_id = ? AND date = ?`,
        [employeeId, r.date]
      );

      const breakMinutes =
        breakSummary[0].break_minutes !== null
          ? breakSummary[0].break_minutes
          : 0;

      // 3) Final working minutes (minus break)
      const totalMinutes = workMinutes - breakMinutes;

      finalData.push({
        ...r,
        work_minutes: workMinutes,
        break_minutes: breakMinutes,
        total_minutes: totalMinutes < 0 ? 0 : totalMinutes,
      });
    }

    res.json(finalData);
  } catch (err) {
    console.error("getByDate:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getWorkAnalytics = async (req, res) => {
  try {
    const employeeId = req.user.employee_id;

    const [rows] = await pool.query(
      `SELECT 
         COUNT(*) AS total_days,

         -- Work minutes
         SUM(TIMESTAMPDIFF(MINUTE, a.check_in, a.check_out)) AS total_work_minutes,

         -- Break minutes
         (
           SELECT 
             IFNULL(SUM(TIMESTAMPDIFF(MINUTE, break_start, break_end)), 0)
           FROM attendance_breaks 
           WHERE employee_id = ? 
         ) AS total_break_minutes

       FROM attendance_records a
       WHERE a.employee_id = ?`,
      [employeeId, employeeId]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error("getWorkAnalytics:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};


// ----------------- END OF FILE -----------------


// ---------- WORK ANALYTICS (for Employee panel) ----------

exports.getWorkAnalytics = async (req, res) => {
  try {
    // 👇 attendance_records / attendance_breaks me employee_id => employees.id hota hai
    const employeeId = req.user.employee_id || req.user.id;

    const range = req.query.range || "current_month"; // current_month | last_30

    const today = new Date();
    let start = new Date(today);
    let end = new Date(today);

    if (range === "last_30") {
      // last 30 days (including today)
      end = today;
      start = new Date(today);
      start.setDate(start.getDate() - 29);
    } else {
      // current month
      const y = today.getFullYear();
      const m = today.getMonth(); // 0-based
      start = new Date(y, m, 1);
      end = new Date(y, m + 1, 0);
    }

    const fmt = (d) => d.toISOString().slice(0, 10);

    const startStr = fmt(start);
    const endStr = fmt(end);

    // 1) Attendance rows in range
    const [attRows] = await pool.query(
      `SELECT 
         id,
         date,
         check_in,
         check_out,
         work_hours,
         status
       FROM attendance_records
       WHERE employee_id = ?
         AND date BETWEEN ? AND ?
       ORDER BY date ASC`,
      [employeeId, startStr, endStr]
    );

    // 2) Break minutes per date
    const [breakRows] = await pool.query(
      `SELECT 
         date,
         SUM(
           CASE 
             WHEN break_end IS NOT NULL
             THEN TIMESTAMPDIFF(MINUTE, break_start, break_end)
             ELSE 0
           END
         ) AS break_minutes
       FROM attendance_breaks
       WHERE employee_id = ?
         AND date BETWEEN ? AND ?
       GROUP BY date`,
      [employeeId, startStr, endStr]
    );

    const normalizeDate = (v) =>
      v instanceof Date ? v.toISOString().slice(0, 10) : v;

    const breakMap = new Map();
    breakRows.forEach((br) => {
      const d = normalizeDate(br.date);
      breakMap.set(d, br.break_minutes || 0);
    });

    // 3) calculate daily effective minutes etc
    let totalEffectiveMinutes = 0;
    let totalOvertimeMinutes = 0;
    let lateArrivals = 0;
    let earlyCheckouts = 0;

    const dailyHours = [];
    const statusMap = new Map(); // date -> status

    for (const r of attRows) {
      const dateStr = normalizeDate(r.date);
      const workMinutes = r.work_hours || 0;          // yahan work_hours MINUTES me hai
      const breakMinutes = breakMap.get(dateStr) || 0;
      let effectiveMinutes = workMinutes - breakMinutes;
      if (effectiveMinutes < 0) effectiveMinutes = 0;

      const hours = effectiveMinutes / 60;

      dailyHours.push({
        date: dateStr,
        hours: Number(hours.toFixed(2)),
      });

      statusMap.set(dateStr, r.status || "present");

      totalEffectiveMinutes += effectiveMinutes;

      // Overtime: effective > 8h (480 min)
      if (effectiveMinutes > 480) {
        totalOvertimeMinutes += effectiveMinutes - 480;
      }

      // Late arrival rule: check-in after 10:15
      if (r.check_in) {
        const ci = new Date(r.check_in);
        const h = ci.getHours();
        const m = ci.getMinutes();
        if (h > 10 || (h === 10 && m > 15)) {
          lateArrivals++;
        }
      }

      // Early checkout rule: check-out before 18:00
      if (r.check_out) {
        const co = new Date(r.check_out);
        const h = co.getHours();
        const m = co.getMinutes();
        if (h < 18 || (h === 18 && m < 0)) {
          earlyCheckouts++;
        }
      }
    }

    // sort daily data by date (safe)
    dailyHours.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

    // 4) Streak calculation (present / absent) pure range pe
    let bestStreak = 0;
    let currentPresent = 0;

    let worstStreak = 0;
    let currentAbsent = 0;

    const isWeekend = (d) => {
      const day = d.getDay(); // 0=Sun, 6=Sat
      return day === 0 || day === 6;
    };

    const isPresentStatus = (status) => status === "present";
    const isAbsentStatus = (status) => status === "absent";

    let cursor = new Date(start);
    while (cursor <= end) {
      const dStr = fmt(cursor);
      const status = statusMap.get(dStr);

      if (isPresentStatus(status)) {
        currentPresent++;
        bestStreak = Math.max(bestStreak, currentPresent);
        currentAbsent = 0;
      } else if (isAbsentStatus(status) || (!status && !isWeekend(cursor))) {
        // koi record nahi + weekday => absent treat
        currentAbsent++;
        worstStreak = Math.max(worstStreak, currentAbsent);
        currentPresent = 0;
      } else {
        // weekend / holiday => streak break
        currentPresent = 0;
        currentAbsent = 0;
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    const totalHours = totalEffectiveMinutes / 60;
    const overtimeHours = totalOvertimeMinutes / 60;

    return res.json({
      range,
      range_start: startStr,
      range_end: endStr,
      total_hours: Number(totalHours.toFixed(2)),
      overtime_hours: Number(overtimeHours.toFixed(2)),
      late_arrivals: lateArrivals,
      early_checkouts: earlyCheckouts,
      best_streak: bestStreak,
      worst_streak: worstStreak,
      daily_hours: dailyHours,
    });
  } catch (err) {
    console.error("getWorkAnalytics ERROR:", err);
    res.status(500).json({ message: "Server error fetching analytics" });
  }
};
// ----------------- END OF FILE -----------------  
