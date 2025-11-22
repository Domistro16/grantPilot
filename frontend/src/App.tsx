import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import GrantPilotDashboard from "./GrantPilotDashboard";
import { AdminDashboard } from "./pages";
import { Settings } from "lucide-react";
import { WalletProvider } from "./components/WalletProvider";

function Navigation() {
  const location = useLocation();
  const isAdmin = location.pathname === "/admin";

  return (
    <div className="fixed top-4 right-4 z-50">
      {isAdmin ? (
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs text-gray-200 transition-all backdrop-blur-sm"
        >
          ← Back to Dashboard
        </Link>
      ) : (
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs text-gray-200 transition-all backdrop-blur-sm"
        >
          <Settings className="h-3.5 w-3.5" />
          Admin
        </Link>
      )}
    </div>
  );
}

function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<GrantPilotDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </WalletProvider>
  );
}

export default App;
