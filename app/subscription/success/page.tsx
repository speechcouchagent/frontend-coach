"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SubscriptionSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) {
      // If no session_id, redirect to subscription page
      router.push("/subscription");
    }
  }, [sessionId, router]);

  return (
    <div className="p-8 max-w-md mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">Subscription Successful!</h1>
      <p>Your subscription has been activated.</p>
      <button
        onClick={() => router.push("/profile")}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Go to Profile
      </button>
    </div>
  );
}
