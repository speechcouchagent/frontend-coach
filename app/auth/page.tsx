"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage({ mode }: { mode: "login" | "signup" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
  const isValidPassword = (password: string) => password.length >= 8;

  const handleSubmit = async () => {
    setError("");

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!isValidPassword(password)) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const endpoint =
        mode === "login"
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`
          : `${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userEmail", email); // ✅ Store email

        alert(mode === "login" ? "Login successful!" : "Signup successful!");
        router.push("/profile");
      } else {
        setError(data.msg || "Authentication failed. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again later.");
    }

    setLoading(false);
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        {mode === "login" ? "Login" : "Sign Up"}
      </h1>

      {error && <p className="text-red-500">{error}</p>}

      <input
        className="border p-2 w-full my-2"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="border p-2 w-full my-2"
        type="password"
        placeholder="Password (min 8 characters)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        className={`bg-blue-500 text-white p-2 w-full ${loading ? "opacity-50" : ""}`}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Processing..." : mode === "login" ? "Login" : "Sign Up"}
      </button>
    </div>
  );
}
