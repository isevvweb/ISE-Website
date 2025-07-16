import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { SessionContextProvider } from "./components/SessionContextProvider.tsx";
import { BrowserRouter } from "react-router-dom"; // Import BrowserRouter here

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter> {/* Wrap with BrowserRouter here */}
      <SessionContextProvider>
        <App />
      </SessionContextProvider>
    </BrowserRouter>
  </React.StrictMode>
);