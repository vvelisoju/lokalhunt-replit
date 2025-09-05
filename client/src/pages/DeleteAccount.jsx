import React, { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import { useToast } from "../components/ui/Toast";

const DeleteAccount = () => {
  const { user, logout } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [confirmation, setConfirmation] = useState("");

  const handleDeleteAccount = async (e) => {
    e.preventDefault();

    if (confirmation !== "DELETE") {
      showError("Please type DELETE to confirm account deletion");
      return;
    }

    try {
      setLoading(true);
      // Add API call to delete account
      await authService.deleteAccount({ reason });
      showSuccess("Account deletion request submitted successfully");
      await logout();
    } catch (error) {
      showError(error.message || "Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Delete Account
          </h1>

          <div className="prose max-w-none mb-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-red-800 mb-4">
                ⚠️ Important Information
              </h2>
              <p className="text-red-700 mb-4">
                Deleting your account will permanently remove:
              </p>
              <ul className="list-disc list-inside text-red-700 space-y-2">
                <li>Your profile information and resume</li>
                <li>All job applications and history</li>
                <li>Saved jobs and bookmarks</li>
                <li>Messages and communications</li>
                <li>All account data and preferences</li>
              </ul>
              <p className="text-red-700 mt-4 font-semibold">
                This action cannot be undone.
              </p>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Account Deletion Process
            </h2>
            <ol className="list-decimal list-inside text-gray-700 space-y-2 mb-6">
              <li>Submit a deletion request using the form below</li>
              <li>We will process your request within 30 days</li>
              <li>You will receive confirmation once deletion is complete</li>
              <li>Your account will be permanently removed from our systems</li>
            </ol>

            {user ? (
              <form onSubmit={handleDeleteAccount} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for deletion (optional)
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    rows={4}
                    placeholder="Help us improve by telling us why you're leaving..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type "DELETE" to confirm
                  </label>
                  <input
                    type="text"
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Type DELETE here"
                    required
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={loading || confirmation !== "DELETE"}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Processing..." : "Delete My Account"}
                  </button>
                  <Link
                    to="/account-settings"
                    className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  You must be logged in to delete your account.
                </p>
                <Link
                  to="/login"
                  className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700"
                >
                  Login
                </Link>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Need Help?
            </h2>
            <p className="text-gray-600 mb-4">
              If you have questions about account deletion or need assistance,
              please contact us:
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <p>📧 Email: support@lokalhunt.com</p>
              <p>📞 Phone: +91 9494644848</p>
              <p>🕒 Support Hours: Monday - Friday, 9 AM - 6 PM IST</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DeleteAccount;
