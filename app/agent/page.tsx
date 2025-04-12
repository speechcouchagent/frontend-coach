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
  useRoomContext,
} from "@livekit/components-react";
import { MediaDeviceFailure } from "livekit-client";
import { useKrispNoiseFilter } from "@livekit/components-react/krisp";

/** Connection details from your API */
type ConnectionDetails = {
  serverUrl: string;
  participantToken: string;
};

/** For rendering our transcript */
type TranscriptMessage = {
  role: "user" | "agent";
  text: string;
};

export default function AgentPage() {
  const [connectionDetails, setConnectionDetails] = useState<ConnectionDetails>();
  const [agentState, setAgentState] = useState<AgentState>("disconnected");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const router = useRouter();

  // Check if user is authenticated (example approach)
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

  // Called when user clicks "Start Conversation"
  const onConnectButtonClicked = async () => {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      alert("User email is missing. Please log in again.");
      return;
    }

    try {
      const url = new URL(
        process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT ?? "/api/connection-details",
        window.location.origin
      );
      url.searchParams.append("email", userEmail);

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      const data = await response.json();
      setConnectionDetails(data);
    } catch (error) {
      console.error("Connection details error:", error);
      alert("Failed to connect. Check console logs for details.");
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* Hero section */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-600 py-16 px-6 text-center text-white">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-5xl sm:text-6xl font-bold mb-4">Interview / Talk Practice</h1>
          <p className="text-2xl sm:text-3xl text-white text-opacity-90">
            Simulate a live interview or speaking scenario with our AI voice agent.
          </p>
        </div>
      </section>

      {/* Main section */}
      <section className="flex-1 py-16 px-6 bg-gray-100">
        <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-xl p-8 h-full">
          {/* Connect once we have connectionDetails */}
          <LiveKitRoom
            token={connectionDetails?.participantToken}
            serverUrl={connectionDetails?.serverUrl}
            connect={connectionDetails !== undefined}
            audio={true}
            video={false}
            onMediaDeviceFailure={onDeviceFailure}
            onDisconnected={() => setConnectionDetails(undefined)}
            data-lk-theme="green"
            className="h-full flex flex-col"
          >
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
              Made by <span className="text-gray-500">Your Name</span>
            </p>
            <p>
              Questions or feedback? Email{" "}
              <a href="mailto:hello@coachinterviews.ai" className="text-purple-600 hover:underline">
                hello@coachinterviews.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------------- Transcript Window ---------------- */
function TranscriptWindow() {
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [score, setScore] = useState<number>(0);

  // We'll store multiple question options here
  const [questionOptions, setQuestionOptions] = useState<string[]>([]);

  const { room } = useRoomContext();

  useDataChannel((msg: ReceivedDataMessage<Uint8Array>) => {
    try {
      const jsonStr = new TextDecoder().decode(msg.payload);
      const data = JSON.parse(jsonStr);

      if (data.event === "user_speech_committed") {
        // User text (or selection)
        setTranscript((prev) => [...prev, { role: "user", text: data.text }]);
        setScore((prevScore) => Math.min(prevScore + 1, 10));
      } else if (data.event === "agent_speech_committed") {
        // Agent text
        const agentText = data.text;
        setTranscript((prev) => [...prev, { role: "agent", text: agentText }]);

        // Attempt to parse out question JSON
        const found = extractQuestionsFromAgent(agentText);
        setQuestionOptions(found);
      }
    } catch (err) {
      console.error("Data message parse error:", err);
    }
  });

  /** Called when the user clicks on a question button. */
  const handleQuestionSelection = (question: string) => {
    // 1. Add to transcript
    setTranscript((prev) => [...prev, { role: "user", text: question }]);
    // 2. Clear question options
    setQuestionOptions([]);
    // 3. Publish to agent as if user typed/spoke it
    room?.localParticipant.publishData(
      JSON.stringify({ event: "user_speech_committed", text: question }),
      { reliable: true }
    );
  };

  // Optional: let user download transcript
  function handleDownloadTranscript() {
    const lines = transcript.map((msg) => {
      const speaker = msg.role === "agent" ? "Agent" : "You";
      return `${speaker}: ${msg.text}`;
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
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
          <div className="bg-green-500 h-4 rounded" style={{ width: `${progressPercentage}%` }} />
        </div>
      </div>

      {/* Transcript Messages */}
      <div className="flex-1 overflow-auto space-y-4 pr-2 border p-4 rounded bg-gray-50">
        {transcript.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "agent" ? "justify-start" : "justify-end"}`}>
            <div
              className={`max-w-[70%] p-4 rounded-md text-lg shadow-sm ${
                msg.role === "agent" ? "bg-indigo-50" : "bg-green-100"
              } text-gray-800`}
            >
              <span className="block font-semibold mb-2 capitalize">
                {msg.role === "agent" ? "Agent" : "You"}
              </span>
              {msg.text}
            </div>
          </div>
        ))}

        {/* If we have questionOptions, show them as clickable buttons */}
        {questionOptions.length > 0 && (
          <div className="mt-4 p-4 bg-gray-100 border rounded">
            <h3 className="font-bold mb-2 text-gray-700">Select a question to answer:</h3>
            <div className="flex flex-col space-y-2">
              {questionOptions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleQuestionSelection(q)}
                  className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Extract a JSON block of the form:
 * ```json
 * {"questions":["Q1","Q2","Q3"]}
 * ```
 * from the agent's text. Return an array of strings.
 */
function extractQuestionsFromAgent(agentText: string): string[] {
  try {
    // Attempt a regex for triple-backtick JSON
    const match = agentText.match(/```json([\s\S]*?)```/);
    if (match && match[1]) {
      const rawJson = match[1].trim();
      const parsed = JSON.parse(rawJson);
      if (Array.isArray(parsed.questions)) {
        return parsed.questions;
      }
    }
  } catch (err) {
    console.warn("No valid JSON block or parse error for questions:", err);
  }
  return [];
}

/* ---------------- Voice Assistant Visualizer ---------------- */
function SimpleVoiceAssistant(props: { onStateChange: (s: AgentState) => void }) {
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

/* ---------------- Control Bar ---------------- */
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-500 hover:text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </DisconnectButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- Error Handling ---------------- */
function onDeviceFailure(error?: MediaDeviceFailure) {
  console.error("MediaDeviceFailure:", error);
  alert("Error accessing mic. Check permissions and try again.");
}
