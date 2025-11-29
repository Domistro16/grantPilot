import { BrowserRouter, Routes, Route } from "react-router-dom";
import GrantPilotDashboard from "./GrantPilotDashboard";
import { AdminDashboard } from "./pages";
import { AdminLogin } from "./pages/AdminLogin";
import { WalletProvider } from "./components/WalletProvider";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <WalletProvider>
      <AdminAuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<GrantPilotDashboard />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AdminAuthProvider>
    </WalletProvider>
  );
}

export default App;
