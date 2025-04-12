"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
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
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      alert("Please login first!");
      router.push("/auth");
      return;
    }

    fetch("http://localhost:5000/api/profile", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then(errData => { throw new Error(errData.msg || "Error fetching profile"); });
        }
        return res.json();
      })
      .then((data) => {
        console.log("🚀 Fetched Profile Data:", data);
        setProfile(data.profile || {});
      })
      .catch((err) => {
        console.error("❌ Error fetching profile:", err.message);
        setError(err.message);
      });
  }, []);

  const handleSave = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Invalid session. Please login again.");
      router.push("/auth");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(profile),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || "Profile update failed");
      }

      alert(data.msg);
    } catch (err) {
      const error = err instanceof Error ? err.message : "An unexpected error occurred";
      console.error("❌ Error updating profile:", error);
      setError(error);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Profile Setup</h1>
      {error && <p className="text-red-500">{error}</p>}
      <input
        className="border p-2 w-full my-2"
        type="text"
        placeholder="Talk Type"
        value={profile.talkType || ""}
        onChange={(e) => setProfile({ ...profile, talkType: e.target.value })}
      />
      <input
        className="border p-2 w-full my-2"
        type="text"
        placeholder="Talk Style"
        value={profile.talkStyle || ""}
        onChange={(e) => setProfile({ ...profile, talkStyle: e.target.value })}
      />
      <input
        className="border p-2 w-full my-2"
        type="text"
        placeholder="Brand Positioning"
        value={profile.brandPositioning || ""}
        onChange={(e) => setProfile({ ...profile, brandPositioning: e.target.value })}
      />
      <input
        className="border p-2 w-full my-2"
        type="text"
        placeholder="Book Title"
        value={profile.bookTitle || ""}
        onChange={(e) => setProfile({ ...profile, bookTitle: e.target.value })}
      />
      <input
        className="border p-2 w-full my-2"
        type="text"
        placeholder="Book Subtitle"
        value={profile.bookSubtitle || ""}
        onChange={(e) => setProfile({ ...profile, bookSubtitle: e.target.value })}
      />
      <input
        className="border p-2 w-full my-2"
        type="text"
        placeholder="Author Name"
        value={profile.authorName || ""}
        onChange={(e) => setProfile({ ...profile, authorName: e.target.value })}
      />
      <textarea
        className="border p-2 w-full my-2"
        placeholder="Book Description"
        value={profile.bookDescription || ""}
        onChange={(e) => setProfile({ ...profile, bookDescription: e.target.value })}
      />

      <textarea
        className="border p-2 w-full my-2"
        placeholder="Target Audience"
        value={profile.targetAudience || ""}
        onChange={(e) => setProfile({ ...profile, targetAudience: e.target.value })}
      />
      <button className="bg-green-500 text-white p-2 w-full mb-4" onClick={handleSave}>
        Save Profile
      </button>
    </div>
  );
}
