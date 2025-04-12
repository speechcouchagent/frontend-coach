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
  useDataChannel,
  ReceivedDataMessage,
} from "@livekit/components-react";
import { MediaDeviceFailure } from "livekit-client";
import type { ConnectionDetails } from "@/app/api/connection-details/route";
import { NoAgentNotification } from "@/components/NoAgentNotification";
import { CloseIcon } from "@/components/CloseIcon";
import { useKrispNoiseFilter } from "@livekit/components-react/krisp";

/* ---------- Types ---------- */
type TranscriptMessage = {
  role: "user" | "agent";
  text: string;
};

export default function AgentPage() {
  const [connectionDetails, updateConnectionDetails] = useState<ConnectionDetails>();
  const [agentState, setAgentState] = useState<AgentState>("disconnected");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const router = useRouter();

  // Check authentication
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
    return null;
  }

  // Connect / fetch connection details
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
    <div className="w-full min-h-screen flex flex-col">
      {/* Hero / Heading Section */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-600 py-16 px-6 text-center text-white">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-5xl sm:text-6xl font-bold mb-4">
            Interview / Talk Practice
          </h1>
          <p className="text-2xl sm:text-3xl text-white text-opacity-90">
            Simulate a live interview or speaking scenario with our AI voice agent.
          </p>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="flex-1 py-16 px-6 bg-gray-100">
        <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-xl p-8 h-full">
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
            data-lk-theme="green"
            className="h-full flex flex-col"
          >
            {/* Two-column layout */}
            <div className="grid grid-cols-1 md:grid-cols-[550px,1fr] gap-10 flex-1">
              <TranscriptWindow />
              <div className="relative flex flex-col">
                <div className="flex-1 overflow-auto">
                  <SimpleVoiceAssistant onStateChange={setAgentState} />
                </div>
                <ControlBar
                  onConnectButtonClicked={onConnectButtonClicked}
                  agentState={agentState}
                />
                <RoomAudioRenderer />
                <NoAgentNotification state={agentState} />
              </div>
            </div>
          </LiveKitRoom>
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
                className="text-purple-600 hover:underline"
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

/* ========== Transcript Window ========== */
function TranscriptWindow() {
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [score, setScore] = useState<number>(0); // simple "score" 0–10

  useDataChannel((msg: ReceivedDataMessage<Uint8Array>) => {
    try {
      const jsonStr = new TextDecoder().decode(msg.payload);
      const data = JSON.parse(jsonStr);

      if (data?.event === "user_speech_committed") {
        setTranscript((prev) => [...prev, { role: "user", text: data.text }]);
        setScore((prevScore) => (prevScore < 10 ? prevScore + 1 : 10));
      } else if (data?.event === "agent_speech_committed") {
        setTranscript((prev) => [...prev, { role: "agent", text: data.text }]);
      }
    } catch (err) {
      console.error("Error parsing data message:", err);
    }
  });

  function handleDownloadTranscript() {
    const lines = transcript.map((msg) => {
      const speaker = msg.role === "agent" ? "Agent" : "You";
      return `${speaker}: ${msg.text}`;
    });
    const transcriptText = lines.join("\n");
    const blob = new Blob([transcriptText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "transcript.txt";
    link.click();

    URL.revokeObjectURL(url);
  }

  const progressPercentage = (score / 10) * 100;

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Conversation</h2>
        <button
          onClick={handleDownloadTranscript}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-4 py-2 rounded text-lg"
        >
          Download Transcript
        </button>
      </div>

      {/* Score/Progress Bar */}
      <div className="mb-6">
        <p className="text-lg text-gray-700 mb-2">Progress Score: {score} / 10</p>
        <div className="w-full bg-gray-300 h-4 rounded">
          <div
            className="bg-green-500 h-4 rounded"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Transcript Messages */}
      <div className="flex-1 overflow-auto space-y-4 pr-2 border p-4 rounded bg-gray-50">
        {transcript.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.role === "agent" ? "justify-start" : "justify-end"
            }`}
          >
            <div
              className={`max-w-[70%] p-4 rounded-md text-lg shadow-sm ${
                msg.role === "agent"
                  ? "bg-indigo-50 text-gray-800"
                  : "bg-green-100 text-gray-800"
              }`}
            >
              <span className="block font-semibold mb-2 capitalize">
                {msg.role === "agent" ? "Agent" : "You"}
              </span>
              <span>{msg.text}</span>
            </div>
          </div>
        ))}
      </div>
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
    <div className="h-[400px] flex flex-col items-center justify-center bg-gray-50 rounded-xl shadow-inner">
      <p className="text-gray-700 mb-6 text-xl">
        Agent Status: <span className="font-semibold capitalize">{state}</span>
      </p>
      <BarVisualizer
        state={state}
        barCount={5}
        trackRef={audioTrack}
        className="agent-visualizer w-full max-w-lg"
        options={{ minHeight: 36 }}
      />
    </div>
  );
}

/* ========== Control Bar ========== */
function ControlBar(props: { onConnectButtonClicked: () => void; agentState: AgentState }) {
  const krisp = useKrispNoiseFilter();

  useEffect(() => {
    krisp.setNoiseFilterEnabled(false);
  }, [krisp]);

  return (
    <div className="relative flex items-center justify-center py-8">
      <AnimatePresence>
        {props.agentState === "disconnected" && (
          <motion.button
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="bg-purple-600 text-white px-8 py-4 text-xl rounded font-semibold shadow hover:bg-purple-700"
            onClick={props.onConnectButtonClicked}
          >
            Start Conversation
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
            className="flex items-center space-x-6"
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

/* ========== Error Handling ========== */
function onDeviceFailure(error?: MediaDeviceFailure) {
  console.error(error);
  alert(
    "Error acquiring mic permissions. Please ensure you grant the necessary permissions and reload."
  );
}
