"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

  // Check if subscription is active
  let isActive = false;
  if (subscription?.subscribed && subscription.endDate) {
    const now = new Date();
    const end = new Date(subscription.endDate);
    isActive = now < end;
  }

  // If user is active, assume they're on the Pro plan
  const isOnProPlan = isActive;
  const isOnBasicPlan = !isActive;

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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/subscription/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email: userEmail }),
        }
      );

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
    return (
      <div className="p-8 max-w-md mx-auto text-xl">
        Loading subscription status...
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Main Pricing Section */}
      <section className="py-16 px-6 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold mb-8">Pricing</h1>
        <p className="text-xl sm:text-2xl text-gray-700 mb-12">
          Choose your plan to unlock AI coaching.
        </p>

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-center items-start gap-8">
          {/* Basic Plan Card */}
          <div
            className={`border-2 rounded-xl p-8 flex-1 max-w-sm mx-auto ${
              isOnBasicPlan && !isOnProPlan ? "border-blue-300" : "border-gray-300"
            }`}
          >
            <h2 className="text-3xl font-bold mb-2">Basic</h2>
            <p className="text-lg text-gray-600 mb-4">
              3 questions / month
            </p>
            <p className="text-3xl font-bold mb-6">
              $0 <span className="text-xl font-normal">/ month</span>
            </p>

            {isOnBasicPlan && !isOnProPlan ? (
              <button
                disabled
                className="bg-gray-300 text-gray-600 text-lg px-6 py-3 rounded w-full cursor-not-allowed font-semibold"
              >
                Current Plan
              </button>
            ) : (
              <button
                onClick={handleSubscribe}
                disabled={paymentLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white text-lg px-6 py-3 rounded w-full font-semibold"
              >
                {paymentLoading ? "Processing..." : "Choose Basic"}
              </button>
            )}
          </div>

          {/* Pro Plan Card */}
          <div
            className={`border-4 rounded-xl p-8 flex-1 max-w-sm mx-auto ${
              isOnProPlan ? "border-green-500" : "border-gray-300"
            }`}
          >
            <p className="text-green-600 font-semibold mb-1 text-lg">Recommended</p>
            <h2 className="text-3xl font-bold mb-2">Pro</h2>
            <p className="text-lg text-gray-600 mb-4">
              Unlimited questions<br />Unlimited Feedback
            </p>
            <p className="text-3xl font-bold mb-6">
              $10 <span className="text-xl font-normal">/ month</span>
            </p>

            {isOnProPlan ? (
              <button
                disabled
                className="bg-gray-300 text-gray-600 text-lg px-6 py-3 rounded w-full cursor-not-allowed font-semibold"
              >
                Current Plan
              </button>
            ) : (
              <button
                onClick={handleSubscribe}
                disabled={paymentLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-6 py-3 rounded w-full font-semibold"
              >
                {paymentLoading ? "Processing..." : "Upgrade"}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-16 px-6 text-center">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold mb-10">What People Are Saying</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="flex flex-col items-center bg-white rounded-xl shadow p-6">
              <img
                src="/images/henry.png"
                alt="Henry Tran"
                className="w-20 h-20 rounded-full object-cover mb-4"
              />
              <p className="text-gray-700 italic mb-4 text-lg">
                “I used your product for an interview I had yesterday, 
                and sure enough one of the generated questions came up!”
              </p>
              <p className="font-bold text-xl">Henry Tran • Marketing Ops</p>
              <div className="text-green-500 mt-2 text-xl">★★★★★</div>
            </div>

            {/* Testimonial 2 */}
            <div className="flex flex-col items-center bg-white rounded-xl shadow p-6">
              <img
                src="/images/jenny.png"
                alt="Jenny Jiang"
                className="w-20 h-20 rounded-full object-cover mb-4"
              />
              <p className="text-gray-700 italic mb-4 text-lg">
                “Great tool for anyone preparing for a tech interview; 
                it helped me ace my interviews!”
              </p>
              <p className="font-bold text-xl">Jenny Jiang • Software Engineer</p>
              <div className="text-green-500 mt-2 text-xl">★★★★★</div>
            </div>

            {/* Testimonial 3 */}
            <div className="flex flex-col items-center bg-white rounded-xl shadow p-6">
              <img
                src="/images/charles.png"
                alt="Charles Burr"
                className="w-20 h-20 rounded-full object-cover mb-4"
              />
              <p className="text-gray-700 italic mb-4 text-lg">
                “I love coachinterviews.ai! It’s been so helpful 
                prepping for my big interview tomorrow!”
              </p>
              <p className="font-bold text-xl">Charles Burr • UX Designer</p>
              <div className="text-green-500 mt-2 text-xl">★★★★★</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-8 text-center text-base text-gray-400">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center">
          <p>© {new Date().getFullYear()} coachinterviews.ai</p>
          <div className="flex flex-col sm:flex-row sm:gap-3 mt-4 sm:mt-0">
            <p>
              Made by <span className="text-gray-500">Muntazir Ali</span>
            </p>
            <p>
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
    </div>
  );
}
