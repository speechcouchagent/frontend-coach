"use client";

import { useRouter } from "next/navigation";

export default function SubscriptionCancelPage() {
  const router = useRouter();

  return (
    <div className="p-8 max-w-md mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">Subscription Cancelled</h1>
      <p>Your subscription process was cancelled.</p>
      <button
        onClick={() => router.push("/subscription")}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Try Again
      </button>
    </div>
  );
}
