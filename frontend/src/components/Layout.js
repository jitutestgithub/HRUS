import React from "react";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ marginLeft: 20, padding: 20, width: "100%" }}>
        {children}
      </div>
    </div>
  );
}
