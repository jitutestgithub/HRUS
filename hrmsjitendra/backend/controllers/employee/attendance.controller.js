const pool = require("../db"); // your mysql pool
const {
  NORMAL_WORK_HOURS_PER_DAY,
  SHIFT_START,
  SHIFT_END,
  LATE_TOLERANCE_MINUTES,
  EARLY_TOLERANCE_MINUTES,
} = require("../../config/attendanceConfig");

const buildDateTime = (dateStr, timeStr) => {
  // dateStr: '2025-02-01', timeStr: '10:00'
  return new Date(`${dateStr}T${timeStr}:00`);
};

exports.getMyAttendanceAnalytics = async (req, res) => {
  try {
    const employeeId = req.user.id; // token se aa raha h

    // Current month range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const startStr = startOfMonth.toISOString().split("T")[0];
    const endStr = startOfNextMonth.toISOString().split("T")[0];

    // DB se current month ke attendance records nikalte hain
    const [rows] = await pool.query(
      `
      SELECT 
        id,
        employee_id,
        date,
        check_in,
        check_out,
        working_hours,
        status
      FROM attendance_records
      WHERE employee_id = ?
        AND date >= ?
        AND date < ?
      ORDER BY date ASC
      `,
      [employeeId, startStr, endStr]
    );

    let totalHours = 0;
    let overtimeHours = 0;
    let lateArrivals = 0;
    let earlyCheckouts = 0;

    let bestStreak = 0;
    let worstStreak = 0;
    let currentPresentStreak = 0;
    let currentAbsentStreak = 0;

    const dailyHours = [];

    for (const row of rows) {
      const dateStr = row.date.toISOString().split("T")[0];

      let workingHours = row.working_hours || 0;

      // अगर working_hours column नहीं भरा तो runtime पर calculate:
      if (!workingHours && row.check_in && row.check_out) {
        const checkIn = new Date(row.check_in);
        const checkOut = new Date(row.check_out);
        const diffMs = checkOut - checkIn;
        workingHours = diffMs / (1000 * 60 * 60); // hours
      }

      // total hours
      if (workingHours && workingHours > 0) {
        totalHours += workingHours;
      }

      // overtime
      if (workingHours > NORMAL_WORK_HOURS_PER_DAY) {
        overtimeHours += workingHours - NORMAL_WORK_HOURS_PER_DAY;
      }

      // late arrival
      if (row.check_in) {
        const checkIn = new Date(row.check_in);
        const shiftStart = buildDateTime(dateStr, SHIFT_START);

        const lateThreshold = new Date(
          shiftStart.getTime() + LATE_TOLERANCE_MINUTES * 60 * 1000
        );

        if (checkIn > lateThreshold) {
          lateArrivals += 1;
        }
      }

      // early checkout
      if (row.check_out) {
        const checkOut = new Date(row.check_out);
        const shiftEnd = buildDateTime(dateStr, SHIFT_END);

        const earlyThreshold = new Date(
          shiftEnd.getTime() - EARLY_TOLERANCE_MINUTES * 60 * 1000
        );

        if (checkOut < earlyThreshold) {
          earlyCheckouts += 1;
        }
      }

      // Streaks: status present / absent
      if (row.status === "present") {
        currentPresentStreak += 1;
        bestStreak = Math.max(bestStreak, currentPresentStreak);
        // reset absent streak
        currentAbsentStreak = 0;
      } else if (row.status === "absent") {
        currentAbsentStreak += 1;
        worstStreak = Math.max(worstStreak, currentAbsentStreak);
        // reset present streak
        currentPresentStreak = 0;
      } else {
        // Other status (leave, holiday etc) streak break ho jayega
        currentPresentStreak = 0;
        currentAbsentStreak = 0;
      }

      // Daily hours list for chart
      dailyHours.push({
        date: dateStr,
        hours: Number(workingHours.toFixed(2)),
      });
    }

    res.json({
      total_hours: Number(totalHours.toFixed(2)),
      overtime_hours: Number(overtimeHours.toFixed(2)),
      late_arrivals: lateArrivals,
      early_checkouts: earlyCheckouts,
      best_streak: bestStreak,
      worst_streak: worstStreak,
      daily_hours: dailyHours,
    });
  } catch (err) {
    console.error("Error in getMyAttendanceAnalytics:", err);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
};
