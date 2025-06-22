import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff, UserPlus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const SignupForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const { signup, state } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      await signup(formData.email, formData.password, formData.name);
    } catch (err) {
      setError("Failed to create account. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">MS</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-gray-600">
            Join us to start summarizing your meetings
          </p>
        </div>

        <form
          className="mt-8 space-y-6 bg-light-surface dark:bg-dark-surface rounded-2xl shadow-md dark:shadow-[0_2px_8px_rgba(0,0,0,0.6)] p-8 border border-light-border dark:border-dark-border"
          onSubmit={handleSubmit}
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-dark-accent w-5 h-5" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-light-bg dark:bg-dark-elevated text-gray-900 dark:text-primary placeholder:text-gray-400 dark:placeholder:text-dark-muted border border-light-border dark:border-dark-border focus:ring-2 focus:ring-dark-accent focus:border-dark-accent transition-all shadow-sm dark:shadow-[0_1px_4px_rgba(187,134,252,0.08)]"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-dark-accent w-5 h-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-light-bg dark:bg-dark-elevated text-gray-900 dark:text-primary placeholder:text-gray-400 dark:placeholder:text-dark-muted border border-light-border dark:border-dark-border focus:ring-2 focus:ring-dark-accent focus:border-dark-accent transition-all shadow-sm dark:shadow-[0_1px_4px_rgba(187,134,252,0.08)]"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-dark-accent w-5 h-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-light-bg dark:bg-dark-elevated text-gray-900 dark:text-primary placeholder:text-gray-400 dark:placeholder:text-dark-muted border border-light-border dark:border-dark-border focus:ring-2 focus:ring-dark-accent focus:border-dark-accent transition-all shadow-sm dark:shadow-[0_1px_4px_rgba(187,134,252,0.08)]"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-dark-accent hover:text-gray-600 dark:hover:text-dark-accent2 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-dark-accent w-5 h-5" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-light-bg dark:bg-dark-elevated text-gray-900 dark:text-primary placeholder:text-gray-400 dark:placeholder:text-dark-muted border border-light-border dark:border-dark-border focus:ring-2 focus:ring-dark-accent focus:border-dark-accent transition-all shadow-sm dark:shadow-[0_1px_4px_rgba(187,134,252,0.08)]"
                  placeholder="Confirm your password"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 dark:bg-dark-accent text-white dark:text-gray-900 font-semibold shadow-md dark:shadow-[0_2px_8px_rgba(187,134,252,0.15)] hover:bg-blue-700 dark:hover:bg-dark-accent2 focus:ring-2 focus:ring-dark-accent2 focus:outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={state.isLoading}
          >
            {state.isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus className="w-5 h-5 mr-2" />
                Create account
              </>
            )}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-purple-600 hover:text-purple-500"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupForm;
