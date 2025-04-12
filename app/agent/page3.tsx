"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  LiveKitRoom,
  useVoiceAssistant,
  BarVisualizer,
  RoomAudioRenderer,
  VoiceAssistantControlBar,
  AgentState,
  DisconnectButton,
} from "@livekit/components-react";
import { MediaDeviceFailure } from "livekit-client";
import type { ConnectionDetails } from "@/app/api/connection-details/route";
import { NoAgentNotification } from "@/components/NoAgentNotification";
import { CloseIcon } from "@/components/CloseIcon";
import { useKrispNoiseFilter } from "@livekit/components-react/krisp";

export default function AgentPage() {
  const [connectionDetails, updateConnectionDetails] = useState<ConnectionDetails | undefined>(
    undefined
  );
  const [agentState, setAgentState] = useState<AgentState>("disconnected");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to access the agent page.");
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  if (!isAuthenticated) {
    return null; // Prevents unauthorized users from seeing the page
  }

  const onConnectButtonClicked = async () => {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      alert("User email is missing. Please log in again.");
      return;
    }

    const url = new URL(
      process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT ?? "/api/connection-details",
      window.location.origin
    );
    url.searchParams.append("email", userEmail);

    const response = await fetch(url.toString());
    const connectionDetailsData = await response.json();

    if (response.ok) {
      updateConnectionDetails(connectionDetailsData);
    } else {
      console.error("API Error:", connectionDetailsData);
    }
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      {/* Page Hero / Heading Section */}
      <section className="bg-white py-8 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Interview (or Talk) Practice</h1>
          <p className="text-gray-600">
            Simulate your interview or speaking scenario with our AI voice agent.
          </p>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-10 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[350px,1fr] gap-8">
          {/* Left Column: Scenario Card */}
          <div className="bg-white rounded shadow p-6 flex flex-col">
            {/* You can replace this placeholder with a real scenario/config form */}
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Choose a Scenario
            </h2>

            <div className="space-y-6 text-left">
              <div>
                <label className="block mb-1 font-semibold text-gray-700">Interview Type</label>
                <select className="border border-gray-300 p-2 w-full rounded">
                  <option value="behavioral">Behavioral Interview</option>
                  <option value="technical">Technical Interview</option>
                  <option value="sales">Sales Pitch Practice</option>
                  {/* etc. */}
                </select>
              </div>

              <div>
                <label className="block mb-1 font-semibold text-gray-700">Role</label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineer"
                  className="border border-gray-300 p-2 w-full rounded"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold text-gray-700">Company</label>
                <input
                  type="text"
                  placeholder="e.g. Costco"
                  className="border border-gray-300 p-2 w-full rounded"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold text-gray-700">Description</label>
                <textarea
                  rows={3}
                  placeholder="Interview or talk details..."
                  className="border border-gray-300 p-2 w-full rounded"
                />
              </div>

              <div className="text-sm text-gray-500 mt-2 border-t pt-4">
                <p>
                  <strong>Rubric Example:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>
                    <strong>Actively listen:</strong> Demonstrate active listening by responding
                    thoughtfully.
                  </li>
                  <li>
                    <strong>Use the STAR method:</strong> Showcase your interview skills by using the
                    Situation-Task-Action-Result framework.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column: LiveKit Conversation Card */}
          <div className="bg-white rounded shadow p-6 relative">
            <LiveKitRoom
              token={connectionDetails?.participantToken}
              serverUrl={connectionDetails?.serverUrl}
              connect={connectionDetails !== undefined}
              audio={true}
              video={false}
              onMediaDeviceFailure={onDeviceFailure}
              onDisconnected={() => {
                updateConnectionDetails(undefined);
              }}
              className="h-full flex flex-col justify-between"
              data-lk-theme="green"
            >
              {/* Visually fill the top portion with the BarVisualizer + Agent Controls */}
              <div className="flex-1 overflow-auto">
                <SimpleVoiceAssistant onStateChange={setAgentState} />
              </div>

              {/* Control Bar & Audio Renderer at the bottom */}
              <ControlBar
                onConnectButtonClicked={onConnectButtonClicked}
                agentState={agentState}
              />
              <RoomAudioRenderer />
              <NoAgentNotification state={agentState} />
            </LiveKitRoom>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ========== Voice Assistant Visualizer ========== */
function SimpleVoiceAssistant(props: { onStateChange: (state: AgentState) => void }) {
  const { state, audioTrack } = useVoiceAssistant();

  useEffect(() => {
    props.onStateChange(state);
  }, [props, state]);

  return (
    <div className="h-64 flex flex-col items-center justify-center">
      <p className="text-gray-700 mb-4">
        {/* You could optionally display the agent's name or status here */}
        Agent Status: <span className="font-semibold capitalize">{state}</span>
      </p>
      <BarVisualizer
        state={state}
        barCount={5}
        trackRef={audioTrack}
        className="agent-visualizer w-full max-w-lg"
        options={{ minHeight: 24 }}
      />
    </div>
  );
}

/* ========== Control Bar ========== */
function ControlBar(props: { onConnectButtonClicked: () => void; agentState: AgentState }) {
  const krisp = useKrispNoiseFilter();

  useEffect(() => {
    // Toggle noise filtering if you want
    krisp.setNoiseFilterEnabled(false);
  }, [krisp]);

  return (
    <div className="relative flex items-center justify-center py-4">
      <AnimatePresence>
        {props.agentState === "disconnected" && (
          <motion.button
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="bg-blue-600 text-white px-4 py-2 rounded font-semibold shadow hover:bg-blue-700"
            onClick={props.onConnectButtonClicked}
          >
            Start a conversation
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {props.agentState !== "disconnected" && props.agentState !== "connecting" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.4 }}
            className="flex items-center space-x-4"
          >
            <VoiceAssistantControlBar controls={{ leave: false }} />
            <DisconnectButton>
              <CloseIcon />
            </DisconnectButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ========== Error Handling for Device Failure ========== */
function onDeviceFailure(error?: MediaDeviceFailure) {
  console.error(error);
  alert(
    "Error acquiring mic permissions. Please make sure you grant the necessary permissions in your browser and reload."
  );
}
<footer className="bg-white py-6 text-center text-sm text-gray-400">
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