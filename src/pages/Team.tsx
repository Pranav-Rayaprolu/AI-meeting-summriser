import React from "react";
import { Users, Plus } from "lucide-react";

const Team: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team</h1>
          <p className="text-gray-600 mt-1">
            Manage your team members and permissions
          </p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Add Member</span>
        </button>
      </div>

      {/* Placeholder Content */}
      <div className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl rounded-2xl shadow-xl border border-light-border dark:border-dark-border p-8">
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Team Management
          </h3>
          <p className="text-gray-600 mb-6">
            Team collaboration features are coming soon. You'll be able to
            invite team members, assign roles, and collaborate on meetings and
            action items.
          </p>
          <div className="bg-appleblue/10 dark:bg-appleblue/20 border border-appleblue/20 rounded-xl p-4 mt-6">
            <p className="text-appleblue dark:text-appleblue text-sm font-semibold">
              <strong>Coming Soon:</strong> Team invitations, role-based
              permissions, shared meeting access, and collaborative action item
              management.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;
