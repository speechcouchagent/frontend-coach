"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const handleLogin = async () => {
    setError("");
    setSuccessMessage("");

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.trim() === "") {
      setError("Password cannot be empty.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("🚀 API returned token:", data.token);

      if (res.ok && data.token) {
        // Store the token + email locally
        localStorage.setItem("token", data.token);
        localStorage.setItem("userEmail", email);

        router.refresh();

        // Show a styled success message, then redirect
        setSuccessMessage("Login successful! Redirecting...");
        setTimeout(() => {
          router.push("/profile");
        }, 1500);
        router.refresh();
      } else {
        setError(data.msg || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again later.");
    }
    setLoading(false);
  };

  return (
    <div className="w-full">
      {/* Hero / Heading Section */}
      <section className="bg-white py-8 px-4 text-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Welcome Back</h1>
          <p className="text-gray-600">Log in to access your account and continue your AI coaching.</p>
        </div>
      </section>

      {/* Login Form Card */}
      <section className="bg-gray-50 py-12 px-4">
        <div className="max-w-md mx-auto bg-white rounded shadow p-6">

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

          <div className="mb-4">
            <label className="block mb-1 font-semibold text-gray-700">Email</label>
            <input
              className="border border-gray-300 p-2 w-full rounded"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="mb-6">
            <label className="block mb-1 font-semibold text-gray-700">Password</label>
            <input
              className="border border-gray-300 p-2 w-full rounded"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition-colors ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center mt-4 text-gray-700">
            Don&apos;t have an account?{" "}
            <button
              className="text-blue-600 font-semibold hover:underline"
              onClick={() => router.push("/signup")}
              disabled={loading}
            >
              Sign Up
            </button>
          </p>
        </div>

        {/* Footer */}
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
