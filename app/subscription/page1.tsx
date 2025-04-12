"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Define the type for the subscription status
type SubscriptionStatus = {
  subscribed: boolean;
  startDate?: string;
  endDate?: string;
};

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [paymentLoading, setPaymentLoading] = useState<boolean>(false);
  const router = useRouter();

  // Fetch the subscription status from your backend
  useEffect(() => {
    const token = localStorage.getItem("token")?.trim();
    const userEmail = localStorage.getItem("userEmail");

    if (!token || !userEmail) {
      alert("Please log in first!");
      router.push("/login");
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscription`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setSubscription(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching subscription details:", err);
        setLoading(false);
      });
  }, [router]);

  // Check if subscription is active (if subscribed and current date is before endDate)
  let isActive = false;
  if (subscription?.subscribed && subscription.endDate) {
    const now = new Date();
    const end = new Date(subscription.endDate);
    isActive = now < end;
  }

  // Handle subscription button click: create Stripe Checkout Session and redirect
  const handleSubscribe = async () => {
    const token = localStorage.getItem("token")?.trim();
    const userEmail = localStorage.getItem("userEmail");

    if (!token || !userEmail) {
      alert("Please log in first!");
      router.push("/login");
      return;
    }

    setPaymentLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscription/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await res.json();
      if (res.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert("Failed to initiate checkout session.");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      alert("Error creating checkout session.");
    }
    setPaymentLoading(false);
  };

  if (loading) {
    return <div>Loading subscription status...</div>;
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Subscription</h1>
      {subscription?.subscribed && isActive ? (
        <div>
          <p className="mb-2">You are subscribed!</p>
          <p>
            <strong>Subscription Start:</strong>{" "}
            {new Date(subscription.startDate!).toLocaleDateString()}
          </p>
          <p>
            <strong>Subscription End:</strong>{" "}
            {new Date(subscription.endDate!).toLocaleDateString()}
          </p>
          <p className="mt-4 text-green-600">
            Your subscription is active. You can access the agent page.
          </p>
        </div>
      ) : (
        <div>
          <p className="mb-4">
            You are not subscribed or your subscription has expired. To use the voice agent, please subscribe.
          </p>
          <button
            onClick={handleSubscribe}
            disabled={paymentLoading}
            className="bg-blue-500 text-white p-2 rounded w-full"
          >
            {paymentLoading ? "Processing..." : "Subscribe Now"}
          </button>
        </div>
      )}
    </div>
  );
}
