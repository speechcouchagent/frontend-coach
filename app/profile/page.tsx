"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    isAuthor: false,
    authorType: "",
    bookUrl: "",
    talkType: "",
    talkStyle: "",
    brandPositioning: "",
    bookTitle: "",
    bookSubtitle: "",
    authorName: "",
    bookDescription: "",
    bookTOC: "",
    targetAudience: "",
  });

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login first!");
      router.push("/auth");
      return;
    }

    fetch("http://localhost:5000/api/profile", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((errData) => {
            throw new Error(errData.msg || "Error fetching profile");
          });
        }
        return res.json();
      })
      .then((data) => {
        if (data.profile) {
          setProfile((prev) => ({
            ...prev,
            ...data.profile,
          }));
        }
      })
      .catch((err) => {
        console.error("❌ Error fetching profile:", err.message);
        setError(err.message);
      });
  }, [router]);

  const handleSave = async () => {
    setError("");
    setSuccessMessage("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Invalid session. Please login again.");
      router.push("/auth");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || "Profile update failed");
      }

      // Show a styled success banner with the message
      setSuccessMessage(data.msg);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      console.error("❌ Error updating profile:", message);
      setError(message);
    }
    setLoading(false);
  };

  return (
    <div className="w-full">
      {/* Page Heading / Hero Section */}
      <section className="bg-white py-8 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Profile Setup</h1>
          <p className="text-gray-600">
            Let’s refine your user profile to personalize your AI coaching experience.
          </p>
        </div>
      </section>

      {/* Profile Form Section */}
      <section className="bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded shadow p-6">
          {/* Error Banner */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded">
              {error}
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 p-3 rounded">
              {successMessage}
            </div>
          )}

          {/* 1. Are you an author? (toggle or radio) */}
          <div className="mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="h-5 w-5 cursor-pointer"
                checked={profile.isAuthor}
                onChange={(e) =>
                  setProfile({ ...profile, isAuthor: e.target.checked })
                }
                disabled={loading}
              />
              <span className="font-semibold text-gray-700">
                Are you an author?
              </span>
            </label>
          </div>

          {/* 2. If isAuthor = true, show an Author Type field */}
          {profile.isAuthor && (
            <div className="mb-6">
              <label className="block mb-1 font-semibold text-gray-700">
                Author Type
              </label>
              <select
                className="border border-gray-300 p-2 w-full rounded"
                value={profile.authorType || ""}
                onChange={(e) =>
                  setProfile({ ...profile, authorType: e.target.value })
                }
                disabled={loading}
              >
                <option value="">-- Select Author Type --</option>
                <option value="fiction">Fiction</option>
                <option value="nonfiction">Non-fiction</option>
                <option value="technical">Technical</option>
                <option value="selfhelp">Self-Help</option>
                <option value="other">Other</option>
              </select>
            </div>
          )}

          {/* 3. Talk Type */}
          <div className="mb-6">
            <label className="block mb-1 font-semibold text-gray-700">
              Talk Type
            </label>
            <select
              className="border border-gray-300 p-2 w-full rounded"
              value={profile.talkType || ""}
              onChange={(e) =>
                setProfile({ ...profile, talkType: e.target.value })
              }
              disabled={loading}
            >
              <option value="">-- Select Talk Type --</option>
              <option value="keynote">Keynote</option>
              <option value="workshop">Workshop</option>
              <option value="panel">Panel</option>
              <option value="tedstyle">TED-style Talk</option>
              {/* Add your own talk types here */}
            </select>
          </div>

          {/* 4. Talk Style */}
          <div className="mb-6">
            <label className="block mb-1 font-semibold text-gray-700">
              Talk Style
            </label>
            <select
              className="border border-gray-300 p-2 w-full rounded"
              value={profile.talkStyle || ""}
              onChange={(e) =>
                setProfile({ ...profile, talkStyle: e.target.value })
              }
              disabled={loading}
            >
              <option value="">-- Select Talk Style --</option>
              <option value="motivational">Motivational</option>
              <option value="technical">Technical</option>
              <option value="sales">Sales</option>
              <option value="educational">Educational</option>
              <option value="inspirational">Inspirational</option>
              {/* Add any additional styles you have */}
            </select>
          </div>

          {/* 5. If user is an author, display fields for Book Info */}
          {profile.isAuthor && (
            <div className="mb-6 grid grid-cols-1 gap-4">
              <input
                className="border border-gray-300 p-2 w-full rounded"
                type="text"
                placeholder="Book Title"
                value={profile.bookTitle || ""}
                onChange={(e) =>
                  setProfile({ ...profile, bookTitle: e.target.value })
                }
                disabled={loading}
              />
              <input
                className="border border-gray-300 p-2 w-full rounded"
                type="text"
                placeholder="Book Subtitle"
                value={profile.bookSubtitle || ""}
                onChange={(e) =>
                  setProfile({ ...profile, bookSubtitle: e.target.value })
                }
                disabled={loading}
              />
              <input
                className="border border-gray-300 p-2 w-full rounded"
                type="text"
                placeholder="Author Name"
                value={profile.authorName || ""}
                onChange={(e) =>
                  setProfile({ ...profile, authorName: e.target.value })
                }
                disabled={loading}
              />
              <textarea
                className="border border-gray-300 p-2 w-full rounded"
                placeholder="Book Description"
                value={profile.bookDescription || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    bookDescription: e.target.value,
                  })
                }
                disabled={loading}
              />
            </div>
          )}

          {/* 6. Target Audience */}
          <textarea
            className="border border-gray-300 p-2 w-full rounded mb-6"
            placeholder="Target Audience"
            value={profile.targetAudience || ""}
            onChange={(e) =>
              setProfile({
                ...profile,
                targetAudience: e.target.value,
              })
            }
            disabled={loading}
          />

          {/* Save Profile Button */}
          <button
            onClick={handleSave}
            className={`w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </div>

        <footer className="bg-white py-6 text-center text-sm text-gray-400 mt-8">
          <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center">
            <p>© {new Date().getFullYear()} coachinterviews.ai</p>
            <div className="flex flex-col sm:flex-row sm:gap-3">
              <p className="mt-2 sm:mt-0">
                Made by <span className="text-gray-500">Muntazir Ali</span>
              </p>
              <p className="mt-2 sm:mt-0">
                Questions or feedback? Email{" "}
                <a
                  href="mailto:hello@coachinterviews.ai"
                  className="text-blue-600 hover:underline"
                >
                  hello@coachinterviews.ai
                </a>
              </p>
            </div>
          </div>
        </footer>
      </section>
    </div>
  );
}
