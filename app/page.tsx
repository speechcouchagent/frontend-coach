"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-white py-20 px-6 text-center">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl sm:text-6xl font-bold mb-8">
            Boost your confidence, ace any conversation
          </h1>
          <p className="text-2xl sm:text-3xl text-gray-700 mb-10">
            Practice interviews, podcasts, sales pitches, or any type of talk. 
            Let our AI voice agent help you refine your delivery, content, and confidence.
          </p>
          <div className="inline-flex gap-6">
            <Link
              href="/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 rounded font-semibold text-lg"
            >
              Get Started for Free
            </Link>
            <Link
              href="/login"
              className="border-2 border-blue-600 hover:bg-blue-50 text-blue-600 py-4 px-8 rounded font-semibold text-lg"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Trusted / Social Proof Section */}
      <section className="bg-gray-50 py-16 px-6 text-center">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Trusted by 40,000+ Professionals</h2>
          <p className="text-xl text-gray-600 mb-10">
            From aspiring authors to seasoned speakers, people worldwide are using our AI 
            to improve their communication skills.
          </p>
          {/* Example: 4 Circular Avatars */}
          <div className="flex justify-center items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-gray-300" />
            <div className="w-16 h-16 rounded-full bg-gray-300" />
            <div className="w-16 h-16 rounded-full bg-gray-300" />
            <div className="w-16 h-16 rounded-full bg-gray-300" />
          </div>
        </div>
      </section>

      {/* Steps / How it Works Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center p-6 bg-gray-50 rounded">
              <h3 className="text-2xl font-bold mb-3">Step 1: Generate Questions</h3>
              <p className="text-gray-700 text-lg">
                Get AI-generated questions or prompts tailored to your topic.
              </p>
            </div>
            {/* Step 2 */}
            <div className="text-center p-6 bg-gray-50 rounded">
              <h3 className="text-2xl font-bold mb-3">Step 2: Practice Answering</h3>
              <p className="text-gray-700 text-lg">
                Record your answer with our AI-driven voice agent and receive real-time feedback.
              </p>
            </div>
            {/* Step 3 */}
            <div className="text-center p-6 bg-gray-50 rounded">
              <h3 className="text-2xl font-bold mb-3">Step 3: Improve with AI Coaching</h3>
              <p className="text-gray-700 text-lg">
                Get instant coaching on clarity, tone, and content. Refine, re-record, and perfect.
              </p>
            </div>
          </div>
          <div className="text-center mt-10">
            <Link
              href="/agent"
              className="bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 rounded font-semibold text-lg"
            >
              Start Practicing
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gray-100 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-center mb-12">
            Testimonials
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-8 rounded shadow-md">
              <p className="italic text-gray-700 text-lg mb-4">
                “I aced my job interview thanks to the practice sessions. 
                The AI’s feedback on tone and clarity was spot on.”
              </p>
              <h4 className="font-bold text-gray-900 text-xl">— Henry, Marketing Manager</h4>
            </div>
            {/* Testimonial 2 */}
            <div className="bg-white p-8 rounded shadow-md">
              <p className="italic text-gray-700 text-lg mb-4">
                “I needed help preparing for a panel discussion on technical topics. 
                This tool helped me deliver a confident, concise talk.”
              </p>
              <h4 className="font-bold text-gray-900 text-xl">— Jenny, Software Engineer</h4>
            </div>
            {/* Testimonial 3 */}
            <div className="bg-white p-8 rounded shadow-md">
              <p className="italic text-gray-700 text-lg mb-4">
                “As a first-time author, practicing my book launch pitch was nerve-wracking. 
                The AI gave me the boost I needed.”
              </p>
              <h4 className="font-bold text-gray-900 text-xl">— Charles, New Author</h4>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold mb-8">
            Ready to Supercharge Your Talk?
          </h2>
          <p className="text-gray-700 text-xl mb-8">
            Whether you're preparing for an interview, a keynote, a book reading, or any 
            important conversation, let AI Agent Coaching help you shine.
          </p>
          <Link
            href="/signup"
            className="bg-green-500 hover:bg-green-600 text-white py-4 px-8 rounded font-semibold text-lg"
          >
            Try It Now, It&apos;s Free!
          </Link>
        </div>
      </section>

      {/* FAQ Section (Optional) */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-8">
            <div>
              <h3 className="font-semibold text-2xl mb-2">
                Why did you make this site?
              </h3>
              <p className="text-gray-700 text-lg">
                We wanted to provide a powerful but simple way for anyone 
                to practice and improve their speaking skills using an AI voice agent.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-2xl mb-2">
                Is it free to use?
              </h3>
              <p className="text-gray-700 text-lg">
                We offer a free plan for basic usage. For unlimited practice and 
                more advanced features, consider our subscription plan.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-2xl mb-2">
                Can I use this to practice interviews for any job role?
              </h3>
              <p className="text-gray-700 text-lg">
                Absolutely! From entry-level to executive positions, 
                the AI can adapt to different roles, industries, and skill levels.
              </p>
            </div>
            {/* Add more FAQs as needed */}
          </div>
        </div>
        {/* Footer */}
        <footer className="bg-white py-8 text-center text-base text-gray-400 mt-12">
          <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center">
            <p>© {new Date().getFullYear()} coachinterviews.ai</p>
            <div className="flex flex-col sm:flex-row sm:gap-3 mt-4 sm:mt-0">
              <p>
                Made by <span className="text-gray-500">Muntazir Ali</span>
              </p>
              <p>
                Questions or feedback? Email{" "}
                <a href="mailto:hello@coachinterviews.ai" className="text-blue-600 hover:underline">
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
