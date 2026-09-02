/**
 * REACT ROUTER DOM INTEGRATION FOR NEXORA PULSECARE
 * Provides standard React 18 & React Router DOM (v6) component bindings for the Pulse platform.
 */

import React from "react";
import ReactDOM from "react-dom/client";
import {
  createHashRouter,
  RouterProvider,
  Link,
  useNavigate,
  useLocation,
  useParams,
  Outlet
} from "react-router-dom";

import { router as coreRouter, ROUTES } from "./router.js";

/**
 * Layout Container Component with React Router Outlet
 */
export function AppLayout() {
  return React.createElement(
    "div",
    { className: "react-app-wrapper" },
    React.createElement(Outlet, null)
  );
}

/**
 * Patient Portal Page Wrapper
 */
export function PatientPortalPage() {
  const mountRef = React.useRef(null);

  React.useEffect(() => {
    if (mountRef.current && coreRouter) {
      coreRouter.navigate("/");
    }
  }, []);

  return React.createElement("div", { ref: mountRef, id: "react-patient-mount" });
}

/**
 * Doctor Module Page Wrapper
 */
export function DoctorStationPage() {
  const mountRef = React.useRef(null);

  React.useEffect(() => {
    if (mountRef.current && coreRouter) {
      coreRouter.navigate("/doctor");
    }
  }, []);

  return React.createElement("div", { ref: mountRef, id: "react-doctor-mount" });
}

/**
 * Pharmacy Workstation Page Wrapper
 */
export function PharmacyStationPage() {
  const mountRef = React.useRef(null);

  React.useEffect(() => {
    if (mountRef.current && coreRouter) {
      coreRouter.navigate("/pharmacy");
    }
  }, []);

  return React.createElement("div", { ref: mountRef, id: "react-pharmacy-mount" });
}

/**
 * Admin Console Page Wrapper
 */
export function AdminConsolePage() {
  const mountRef = React.useRef(null);

  React.useEffect(() => {
    if (mountRef.current && coreRouter) {
      coreRouter.navigate("/admin");
    }
  }, []);

  return React.createElement("div", { ref: mountRef, id: "react-admin-mount" });
}

/**
 * Auth Gateway Page Wrapper
 */
export function AuthPage() {
  const mountRef = React.useRef(null);

  React.useEffect(() => {
    if (mountRef.current && coreRouter) {
      coreRouter.navigate("/auth");
    }
  }, []);

  return React.createElement("div", { ref: mountRef, id: "react-auth-mount" });
}

/**
 * React Router Route Configuration
 */
export const reactRoutes = [
  {
    path: "/",
    element: React.createElement(AppLayout, null),
    children: [
      { index: true, element: React.createElement(PatientPortalPage, null) },
      { path: "prescriptions", element: React.createElement(PatientPortalPage, null) },
      { path: "doctors", element: React.createElement(PatientPortalPage, null) },
      { path: "pharmacy-radar", element: React.createElement(PatientPortalPage, null) },
      { path: "vault", element: React.createElement(PatientPortalPage, null) },
      { path: "orders", element: React.createElement(PatientPortalPage, null) },
      { path: "doctor", element: React.createElement(DoctorStationPage, null) },
      { path: "pulsemd", element: React.createElement(DoctorStationPage, null) },
      { path: "pharmacy", element: React.createElement(PharmacyStationPage, null) },
      { path: "pulsepharm", element: React.createElement(PharmacyStationPage, null) },
      { path: "admin", element: React.createElement(AdminConsolePage, null) },
      { path: "login", element: React.createElement(AuthPage, null) },
      { path: "register", element: React.createElement(AuthPage, null) },
      { path: "auth", element: React.createElement(AuthPage, null) }
    ]
  }
];

export const reactHashRouter = createHashRouter(reactRoutes);

/**
 * Mount React Router App
 */
export function mountReactRouter(containerId = "patient-portal-mount") {
  const container = document.getElementById(containerId);
  if (!container) return null;

  try {
    const root = ReactDOM.createRoot(container);
    root.render(React.createElement(RouterProvider, { router: reactHashRouter }));
    console.log("⚛️ React Router (react-router-dom v6) mounted successfully.");
    return root;
  } catch (err) {
    console.warn("React Router DOM initial mount notice:", err);
    return null;
  }
}

export { Link, useNavigate, useLocation, useParams };
