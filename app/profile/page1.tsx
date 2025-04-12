"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    // new fields
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
          return res.json().then(errData => { 
            throw new Error(errData.msg || "Error fetching profile"); 
          });
        }
        return res.json();
      })
      .then((data) => {
        console.log("🚀 Fetched Profile Data:", data);
        
        // If the API returns a profile object, merge it into our local state:
        if (data.profile) {
          setProfile(prev => ({ 
            ...prev, 
            ...data.profile
          }));
        }
      })
      .catch((err) => {
        console.error("❌ Error fetching profile:", err.message);
        setError(err.message);
      });
  }, [router]);

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
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
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

      {/* 1. Are you an author? (toggle or radio) */}
      <label className="block mb-2">
        <span className="mr-2">Are you an author?</span>
        <input
          type="checkbox"
          checked={profile.isAuthor}
          onChange={(e) => setProfile({ ...profile, isAuthor: e.target.checked })}
        />
      </label>

      {/* 2. If isAuthor = true, show an Author Type field */}
      {profile.isAuthor && (
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Author Type</label>
          <select
            className="border p-2 w-full"
            value={profile.authorType || ""}
            onChange={(e) => setProfile({ ...profile, authorType: e.target.value })}
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

      {/* 3. Talk Type - user can select which talk they want to practice */}
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Talk Type</label>
        <select
          className="border p-2 w-full"
          value={profile.talkType || ""}
          onChange={(e) => setProfile({ ...profile, talkType: e.target.value })}
        >
          <option value="">-- Select Talk Type --</option>
          <option value="keynote">Keynote</option>
          <option value="workshop">Workshop</option>
          <option value="panel">Panel</option>
          <option value="tedstyle">TED-style Talk</option>
          {/* Add your own talk types here */}
        </select>
      </div>

      {/* 4. Talk Style - user can select the style from multiple options */}
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Talk Style</label>
        <select
          className="border p-2 w-full"
          value={profile.talkStyle || ""}
          onChange={(e) => setProfile({ ...profile, talkStyle: e.target.value })}
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

      {/* 5. Brand Positioning
      <input
        className="border p-2 w-full my-2"
        type="text"
        placeholder="Brand Positioning"
        value={profile.brandPositioning || ""}
        onChange={(e) => setProfile({ ...profile, brandPositioning: e.target.value })}
      /> */}

      {/* 6. If user is an author, display fields for Book Info */}
      {profile.isAuthor && (
        <>
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
        </>
      )}

      <textarea
        className="border p-2 w-full my-2"
        placeholder="Target Audience"
        value={profile.targetAudience || ""}
        onChange={(e) => setProfile({ ...profile, targetAudience: e.target.value })}
      />

      <button 
        className="bg-green-500 text-white p-2 w-full mb-4"
        onClick={handleSave}
      >
        Save Profile
      </button>
    </div>
  );
}
