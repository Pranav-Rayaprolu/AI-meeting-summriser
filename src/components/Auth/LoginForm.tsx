import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [debugError, setDebugError] = useState<any>(null);

  const { login, state } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setDebugError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setDebugError(err);
      console.error("Login error (debug):", err);
      if (err && typeof err === "object") {
        if (err.code) {
          switch (err.code) {
            case "auth/user-not-found":
              setError(
                "No account found for this email. Please sign up first."
              );
              break;
            case "auth/wrong-password":
              setError("Invalid password. Please try again.");
              break;
            case "auth/invalid-email":
              setError("Please enter a valid email address.");
              break;
            default:
              setError(
                err.message || "An unexpected error occurred. Please try again."
              );
              break;
          }
        } else if (err.message) {
          setError(err.message);
        } else {
          setError("An unknown error occurred. Please try again.");
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#f8fafc] via-[#f4f6ff] to-[#f8f6ff] dark:from-[#18181b] dark:via-[#23232b] dark:to-[#18181b] relative overflow-hidden">
      {/* Soft vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse at 60% 40%, rgba(0,122,255,0.08) 0%, rgba(162,89,255,0.06) 40%, transparent 80%)",
        }}
      />
      <div className="max-w-md w-full z-10 flex flex-col items-center space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-appleblue to-applepurple rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <span className="text-white font-extrabold text-2xl tracking-tight">
              MS
            </span>
          </div>
          <h2 className="text-4xl font-extrabold text-black dark:text-white drop-shadow-lg mb-1 tracking-tight">
            Welcome back
          </h2>
          <p className="mt-2 text-lg text-gray-700 dark:text-gray-300 font-medium">
            Sign in to your account
          </p>
        </div>

        <form
          className="mt-4 space-y-6 bg-white/80 dark:bg-dark-card/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-light-border dark:border-dark-border p-8 flex flex-col items-center w-full"
          onSubmit={handleSubmit}
        >
          {error && (
            <div className="bg-red-100/80 dark:bg-red-900/40 border border-red-400/40 dark:border-red-700/40 rounded-xl p-3 mb-2 w-full text-center">
              <p className="text-red-700 dark:text-red-300 text-base font-semibold">
                {error}
              </p>
            </div>
          )}

          <div className="space-y-5 w-full">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-appleblue w-5 h-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-full bg-white/60 dark:bg-dark-card/60 text-black dark:text-white placeholder:font-semibold placeholder:text-gray-400 dark:placeholder:text-gray-500 border-none focus:outline-none focus:ring-2 focus:ring-appleblue/60 focus:bg-white/80 dark:focus:bg-dark-card/80 transition-all shadow-inner"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-appleblue w-5 h-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-10 py-3 rounded-full bg-white/60 dark:bg-dark-card/60 text-black dark:text-white placeholder:font-semibold placeholder:text-gray-400 dark:placeholder:text-gray-500 border-none focus:outline-none focus:ring-2 focus:ring-appleblue/60 focus:bg-white/80 dark:focus:bg-dark-card/80 transition-all shadow-inner"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-appleblue hover:text-applepurple focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between w-full mt-2 mb-1">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 accent-appleblue focus:ring-appleblue border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 text-sm text-gray-700 dark:text-gray-300 font-medium"
              >
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <a
                href="#"
                className="font-semibold text-appleblue hover:text-applepurple underline underline-offset-2 transition-all"
              >
                Forgot your password?
              </a>
            </div>
          </div>

          <button
            type="submit"
            disabled={state.isLoading}
            className="w-full py-3 rounded-full bg-gradient-to-r from-appleblue to-applepurple text-white font-extrabold text-lg shadow-lg hover:scale-105 hover:shadow-2xl focus:ring-2 focus:ring-appleblue/40 focus:outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {state.isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Sign in
              </>
            )}
          </button>

          <div className="text-center mt-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-appleblue hover:text-applepurple underline underline-offset-2 transition-all"
              >
                Sign up now
              </Link>
            </p>
          </div>
        </form>
        {debugError && (
          <div className="bg-yellow-50/80 dark:bg-yellow-900/40 border border-yellow-200/40 dark:border-yellow-700/40 rounded-xl p-3 mt-2 w-full text-center">
            <p className="text-yellow-700 dark:text-yellow-300 text-xs font-mono break-all">
              Debug error: {JSON.stringify(debugError)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginForm;
