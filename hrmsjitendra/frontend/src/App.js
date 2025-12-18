import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./admin/Login";
import Signup from "./admin/Signup";

// Admin dashboard (existing)
import Dashboard from "./admin/Dashboard";
import EmployeeProfileTabs from "./employee/EmployeeProfileTabs";

// New dashboards
import EmployeeDashboard from "./employee/EmployeeDashboard";
import EmployeeLayout from "./employee/EmployeeLayout";
import EmployeeAttendance from "./employee/EmployeeAttendance";
import EmployeeApplyLeave from "./employee/EmployeeApplyLeave";
import EmployeeMyLeaves from "./employee/EmployeeMyLeaves";
import EmployeeProfile from "./employee/EmployeeProfile";
import EmployeeAttendanceCalendar from "./employee/EmployeeAttendanceCalendar";


import EmployeeDetails from "./admin/EmployeeDetails";



import HRDashboard from "./admin/HRDashboard";
import AccountDashboard from "./admin/AccountDashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminAttendanceCalendar from "./admin/AdminAttendanceCalendar";


// Employees
import EmployeesList from "./admin/EmployeesList";
import AddEmployee from "./admin/AddEmployee";


// Departments
import DepartmentsList from "./admin/DepartmentsList";
import AddDepartment from "./admin/AddDepartment";

// Leaves
import LeavesList from "./admin/LeavesList";
import ApplyLeave from "./admin/ApplyLeave";
import LeaveDetails from "./admin/LeaveDetails";
import AdminLeaveApproval from "./admin/AdminLeaveApproval";


// Attendance
import AttendanceReport from "./admin/AttendanceReport";
import AttendanceList from "./admin/AttendanceList";



// Organization Settings
import OrganizationSettings from "./admin/OrganizationSettings";


import EmployeeWorkAnalytics from "./employee/EmployeeWorkAnalytics";

import HrDashboard from "./hr/pages/HrDashboard";




// Layout
import Layout from "./components/Layout";

import Unauthorized from "./admin/Unauthorized";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ------------ DASHBOARDS (ROLE BASED) ------------ */}

        {/* Admin / Org Admin */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin", "org_admin"]}>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* HR Dashboard */}
        <Route
          path="/hr/dashboard"
          element={
            <ProtectedRoute allowedRoles={["hr", "admin", "org_admin"]}>
              <Layout>
                <HRDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
<Route
  path="/employees/:id"
  element={
    <ProtectedRoute allowedRoles={["admin", "org_admin", "hr"]}>
      <Layout>
        <EmployeeDetails />
      </Layout>
    </ProtectedRoute>
  }
/>

        {/* Account Dashboard */}
        <Route
          path="/account/dashboard"
          element={
            <ProtectedRoute allowedRoles={["account", "accounts", "admin", "org_admin"]}>
              <Layout>
                <AccountDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Employee Dashboard */}
        <Route
          path="/employee/dashboard"
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <EmployeeLayout>
                <EmployeeDashboard />
              </EmployeeLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/attendance"
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <EmployeeAttendance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee/leaves/apply"
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <EmployeeApplyLeave />
            </ProtectedRoute>
          }
        />
          <Route
            path="/employee/leaves"
            element={
              <ProtectedRoute allowedRoles={["employee"]}>
                <EmployeeMyLeaves />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employee/profile"
            element={
              <ProtectedRoute allowedRoles={["employee"]}>
                <EmployeeProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employee/attendance/calendar"
            element={
              <ProtectedRoute allowedRoles={["employee"]}>
                <EmployeeAttendanceCalendar />
              </ProtectedRoute>
            }
          />

                /* Employee Profile Tabs */
                <Route
                  path="/employee/profile/:tab"
                  element={
                    <ProtectedRoute allowedRoles={["employee"]}>
                      <EmployeeProfileTabs />
                    </ProtectedRoute>
                  }
                />





        {/* Optional: /dashboard ko role-based redirect bana sakte ho */}
        {/* Agar koi /dashboard type kare to role ke base pe redirect ho */}
        {/* Iske liye alag chhota component bhi bana sakte hain, abhi simple hi rehne dete hain */}

        {/* ------------ OTHER PROTECTED ROUTES (admin side) ------------ */}

        {/* Organization Settings */}
        <Route
          path="/organization"
          element={
            <ProtectedRoute allowedRoles={["admin", "org_admin"]}>
              <Layout>
                <OrganizationSettings />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Employees */}
        <Route
          path="/employees"
          element={
            <ProtectedRoute allowedRoles={["admin", "org_admin", "hr"]}>
              <Layout>
                <EmployeesList />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/employees/add"
          element={
            <ProtectedRoute allowedRoles={["admin", "org_admin", "hr"]}>
              <Layout>
                <AddEmployee />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/employees/:id"
          element={
            <ProtectedRoute allowedRoles={["admin", "org_admin", "hr"]}>
              <Layout>
                <EmployeeProfile />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Departments */}
        <Route
          path="/departments"
          element={
            <ProtectedRoute allowedRoles={["admin", "org_admin", "hr"]}>
              <Layout>
                <DepartmentsList />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/departments/add"
          element={
            <ProtectedRoute allowedRoles={["admin", "org_admin"]}>
              <Layout>
                <AddDepartment />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Leaves */}
        <Route
          path="/leaves"
          element={
            <ProtectedRoute>
              <Layout>
                <LeavesList />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/leaves/apply"
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <Layout>
                <ApplyLeave />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/leaves/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <LeaveDetails />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Attendance */}
        <Route
          path="/attendance/report"
          element={
            <ProtectedRoute allowedRoles={["admin", "org_admin", "hr"]}>
              <Layout>
                <AttendanceReport />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance/list"
          element={
            <ProtectedRoute>
              <Layout>
                <AttendanceList />
              </Layout>
            </ProtectedRoute>
          }
        />
      <Route
        path="/admin/attendance/calendar"
        element={
          <ProtectedRoute allowedRoles={["org_admin", "hr"]}>
            
              <AdminAttendanceCalendar />
            
          </ProtectedRoute>
        }
      />

        <Route
          path="/admin/leaves"
          element={
            <ProtectedRoute allowedRoles={["org_admin", "hr"]}>
             
                <AdminLeaveApproval />
             
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/attendance/list"
          element={
            <ProtectedRoute allowedRoles={["org_admin", "hr"]}>
              <Layout>
                <AttendanceList />
              </Layout>
            </ProtectedRoute>
          }
        />

      <Route path="/employee/work-analytics" element={<EmployeeWorkAnalytics />} />

      <Route path="/hr/dashboard" element={<HrDashboard />} />


        {/* Unauthorized */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Catch-all */}
        <Route path="*" element={<h2>404 - Page Not Found</h2>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
