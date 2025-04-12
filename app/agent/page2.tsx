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
    <div className="w-full bg-gray-50 min-h-screen flex flex-col">
      {/* Hero / Heading Section */}
      <section className="bg-white py-8 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Interview / Talk Practice</h1>
          <p className="text-gray-600">
            Simulate a live interview or speaking scenario with our AI voice agent.
          </p>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="flex-1 py-10 px-4">
        <div className="max-w-7xl mx-auto bg-white rounded shadow p-6 h-full">
          {/* 
            Move LiveKitRoom around BOTH columns 
            so your TranscriptWindow can also use the context. 
          */}
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
            {/* Two-column layout inside the room */}
            <div className="grid grid-cols-1 md:grid-cols-[400px,1fr] gap-8 flex-1">
              {/* Left Column: Transcript (now inside LiveKitRoom) */}
              <TranscriptWindow />

              {/* Right Column: BarVisualizer + Controls */}
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
    </div>
  );
}

/* ========== Transcript Window ========== */
function TranscriptWindow() {
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);

  useDataChannel((msg: ReceivedDataMessage<Uint8Array>) => {
    try {
      // 'payload' is a Uint8Array
      const jsonStr = new TextDecoder().decode(msg.payload);
      const data = JSON.parse(jsonStr);

      if (data?.event === "user_speech_committed") {
        setTranscript((prev) => [...prev, { role: "user", text: data.text }]);
      } else if (data?.event === "agent_speech_committed") {
        setTranscript((prev) => [...prev, { role: "agent", text: data.text }]);
      }
    } catch (err) {
      console.error("Error parsing data message:", err);
    }
  });

  return (
    <div className="flex flex-col overflow-hidden">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Conversation</h2>
      <div className="flex-1 overflow-auto space-y-3 pr-2 border p-3 rounded">
        {transcript.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.role === "agent" ? "justify-start" : "justify-end"
            }`}
          >
            <div
              className={`max-w-[75%] p-3 rounded-md text-sm ${
                msg.role === "agent"
                  ? "bg-blue-50 text-gray-800"
                  : "bg-green-100 text-gray-800"
              }`}
            >
              <span className="block font-semibold mb-1 capitalize">
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
    <div className="h-64 flex flex-col items-center justify-center">
      <p className="text-gray-700 mb-4">
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

/* ========== Error Handling ========== */
function onDeviceFailure(error?: MediaDeviceFailure) {
  console.error(error);
  alert(
    "Error acquiring mic permissions. Please ensure you grant the necessary permissions and reload."
  );
}
