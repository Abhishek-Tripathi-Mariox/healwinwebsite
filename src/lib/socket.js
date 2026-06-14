/**
 * Public (anonymous) realtime client for the marketing website.
 *
 * Used to watch the live status of a SOS submission the visitor just created —
 * the backend allows tokenless connections and only pushes non-sensitive
 * lifecycle status to the `sos-submission:<id>` room.
 */
import { io } from "socket.io-client";
import { API_URL } from "./api";

// Socket connects to the server ORIGIN, not the /v1/api REST base.
const SOCKET_URL = API_URL.replace(/\/v1\/api\/?$/, "");

let socket = null;

const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });
  }
  return socket;
};

/**
 * Subscribe to live status for a SOS submission.
 * @param {string} submissionId
 * @param {(payload: { status: string, etaMinutes?: number }) => void} onStatus
 * @returns {() => void} unsubscribe
 */
export const watchSosSubmission = (submissionId, onStatus) => {
  if (!submissionId) return () => {};
  const s = getSocket();
  const subscribe = () => s.emit("sos:subscribe", { id: submissionId });
  subscribe();
  s.on("connect", subscribe); // re-subscribe after reconnect
  s.on("sos:status", onStatus);
  return () => {
    s.off("sos:status", onStatus);
    s.off("connect", subscribe);
    s.emit("sos:unsubscribe", { id: submissionId });
  };
};

export default { watchSosSubmission };
