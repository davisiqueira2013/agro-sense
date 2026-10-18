import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import App from "./app/App.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import "./styles/globals.css";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
    {/* Notificações de sucesso/erro das ações (toast). */}
    <Toaster theme="dark" richColors position="top-right" closeButton />
  </AuthProvider>,
);
