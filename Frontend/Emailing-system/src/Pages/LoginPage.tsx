import React, { useState, useEffect } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface LoginPageProps {}

// Hardcoded credentials
const AUTHORIZED_EMAIL = "admin@depedcadiz.com";
const AUTHORIZED_PASSWORD = "DepedCadiz2024!";

const LoginPage: React.FC<LoginPageProps> = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const { currentUser, login } = useAuth();

  useEffect(() => {
    if (currentUser) {
      // User is already logged in, no need to show login page
      // The ProtectedRoute will handle the redirect
    }
  }, [currentUser]);

  const handleLogin = async () => {
    setError("");
    setIsLoading(true);

    try {
      // Check against hardcoded credentials
      if (email !== AUTHORIZED_EMAIL || password !== AUTHORIZED_PASSWORD) {
        setError("Invalid email or password");
        setIsLoading(false);
        return;
      }

      // Create user object and login
      const user = {
        uid: "admin-001",
        email: email,
        displayName: "Admin",
        photoURL: null,
      };

      login(user);
    } catch (error: any) {
      setError("Login failed: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-blue-900 mb-2">
              Deped Cadiz
            </h1>
            <p className="text-blue-600">Sign in to your email dashboard</p>
          </div>

          {/* Login Form */}
          <div className="space-y-4">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-blue-700 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-blue-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-4 rounded-xl transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-blue-600">Secure authentication</p>
            <p className="text-xs text-blue-400 mt-2">
              Your data is protected and never shared
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
