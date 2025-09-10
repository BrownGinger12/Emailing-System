import "./App.css";
import MailingDashboard from "./Pages/EmailingPage";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <MailingDashboard />
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;
