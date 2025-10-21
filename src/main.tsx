import React from "react"; // Added this import
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { FindomProvider } from "./context/FindomContext.tsx";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <FindomProvider>
      <App />
    </FindomProvider>
  </React.StrictMode>
);