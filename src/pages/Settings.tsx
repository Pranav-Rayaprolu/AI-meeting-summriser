import React from "react";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
} from "lucide-react";

const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage your account and preferences
          </p>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl rounded-2xl shadow-xl border border-light-border dark:border-dark-border p-6">
          <div className="flex items-center space-x-3 mb-4">
            <User className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Update your personal information and preferences
          </p>
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            Edit Profile →
          </button>
        </div>

        {/* Notifications */}
        <div className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl rounded-2xl shadow-xl border border-light-border dark:border-dark-border p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Bell className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Notifications
            </h3>
          </div>
          <p className="text-gray-600 mb-4">
            Configure your notification preferences
          </p>
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            Manage Notifications →
          </button>
        </div>

        {/* Security */}
        <div className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl rounded-2xl shadow-xl border border-light-border dark:border-dark-border p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Security</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Manage your account security settings
          </p>
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            Security Settings →
          </button>
        </div>

        {/* Appearance */}
        <div className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl rounded-2xl shadow-xl border border-light-border dark:border-dark-border p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Palette className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Appearance</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Customize the look and feel of the application
          </p>
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            Customize Theme →
          </button>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl rounded-2xl shadow-xl border border-light-border dark:border-dark-border p-6">
        <div className="text-center">
          <SettingsIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Settings Coming Soon
          </h3>
          <p className="text-gray-600 mb-4">
            We're working on comprehensive settings and customization options.
            You'll soon be able to fully personalize your experience.
          </p>
          <div className="bg-appleblue/10 dark:bg-appleblue/20 border border-appleblue/20 rounded-xl p-4 mt-6">
            <p className="text-appleblue dark:text-appleblue text-sm font-semibold">
              <strong>Planned Features:</strong> Profile management,
              notification preferences, security settings, theme customization,
              and integration options.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
