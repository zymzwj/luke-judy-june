import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./firebase/context.jsx";
import { DataProvider } from "./firebase/dataContext.jsx";
import { registerServiceWorker } from "./pwa/registerServiceWorker.js";
import "./styles/global.css";

registerServiceWorker();

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <DataProvider>
      <App />
    </DataProvider>
  </AuthProvider>
);
