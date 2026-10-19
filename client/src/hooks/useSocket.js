/*import { useCallback, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
// Task: npm install socket.io-client, then:  import { io } from "socket.io-client";

// TODO (Tasks 3-4): implement the live socket connection.
//
// export function useSocket(roomId) {
//   const { token } = useAuth();
//   const [messages, setMessages] = useState([]);
//   const [socket, setSocket] = useState(null);
//
//   useEffect(() => {
//     if (!token) return;
//     const s = io(import.meta.env.VITE_SOCKET_URL, { auth: { token } }); // token -> handshake.auth.token
//     setSocket(s);
//     s.emit("room:join", roomId);
//     const onMessage = (msg) => setMessages((prev) => [...prev, msg]);
//     s.on("chat:message", onMessage);
//     return () => {
//       s.off("chat:message", onMessage);   // remove THIS listener
//       s.disconnect();                     // close the connection
//     };
//   }, [token, roomId]);
//
//   const sendMessage = useCallback(
//     (text) => socket?.emit("chat:message", { roomId, text }),
//     [socket, roomId]
//   );
//
//   return { messages, sendMessage };
// }

// Placeholder so the app runs before you implement the hook.
// Replace this whole function with the real implementation above.
/*export function useSocket(roomId) {
  useAuth(); // token is available here via useAuth().token
  const [messages] = useState([]);
  const sendMessage = useCallback((text) => {
    console.log("sendMessage not wired yet:", roomId, text);
  }, [roomId]);
  return { messages, sendMessage };
}*/



import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../auth/AuthContext.jsx";

export function useSocket(roomId) {
  const { token } = useAuth();
  const socketRef = useRef(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!token || !roomId) return;

    const url =
      import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";

    const socket = io(url, {
      auth: { token },
    });

    socketRef.current = socket;

    const onConnect = () => {
      console.log("Socket connected:", socket.id);
      socket.emit("room:join", roomId);
    };

    const onMessage = (message) => {
      console.log("Received chat message:", message);
      setMessages((previous) => [...previous, message]);
    };

    const onConnectError = (error) => {
      console.error("Socket connection error:", error.message);
    };

    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);
    socket.on("chat:message", onMessage);

    return () => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
      socket.off("chat:message", onMessage);
      socket.disconnect();

      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [token, roomId]);

  const sendMessage = useCallback(
    (text) => {
      const socket = socketRef.current;

      if (!socket?.connected) {
        console.error("Cannot send: socket is not connected");
        return;
      }

      socket.emit("chat:message", { roomId, text });
    },
    [roomId]
  );

  return { messages, sendMessage };
}
