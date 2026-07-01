import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

interface Room {
  id: string;
  distance: number; // in meters
  senderClapTime: number | null; // synchronized server time (ms)
  receiverClapTime: number | null; // synchronized server time (ms)
  status: "idle" | "listening" | "triggered" | "completed";
  testId: number; // current test run ID
  lastActive: number; // timestamp (ms)
}

const rooms: Record<string, Room> = {};

// Clean up rooms older than 1 hour
setInterval(() => {
  const now = Date.now();
  for (const roomId in rooms) {
    if (now - rooms[roomId].lastActive > 3600000) {
      delete rooms[roomId];
    }
  }
}, 600000); // run every 10 minutes

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API: Get server time for clock synchronization
  app.get("/api/time", (req, res) => {
    res.json({ serverTime: Date.now() });
  });

  // API: Create a new room
  app.post("/api/rooms/create", (req, res) => {
    const { distance } = req.body;
    // Generate a random 4-digit code that is not already taken
    let roomId = "";
    do {
      roomId = Math.floor(1000 + Math.random() * 9000).toString();
    } while (rooms[roomId]);

    const newRoom: Room = {
      id: roomId,
      distance: Number(distance) || 5.0,
      senderClapTime: null,
      receiverClapTime: null,
      status: "idle",
      testId: 1,
      lastActive: Date.now(),
    };

    rooms[roomId] = newRoom;
    res.json(newRoom);
  });

  // API: Join an existing room
  app.post("/api/rooms/join", (req, res) => {
    const { roomId } = req.body;
    const room = rooms[roomId];
    if (!room) {
      return res.status(404).json({ error: "Room tidak ditemukan!" });
    }
    room.lastActive = Date.now();
    res.json(room);
  });

  // API: Get room status
  app.get("/api/rooms/:roomId/status", (req, res) => {
    const { roomId } = req.params;
    const room = rooms[roomId];
    if (!room) {
      return res.status(404).json({ error: "Room tidak ditemukan!" });
    }
    res.json(room);
  });

  // API: Update distance in room
  app.post("/api/rooms/:roomId/distance", (req, res) => {
    const { roomId } = req.params;
    const { distance } = req.body;
    const room = rooms[roomId];
    if (!room) {
      return res.status(404).json({ error: "Room tidak ditemukan!" });
    }
    room.distance = Number(distance) || 5.0;
    room.lastActive = Date.now();
    res.json(room);
  });

  // API: Reset room for a new trial test
  app.post("/api/rooms/:roomId/reset", (req, res) => {
    const { roomId } = req.params;
    const room = rooms[roomId];
    if (!room) {
      return res.status(404).json({ error: "Room tidak ditemukan!" });
    }
    room.senderClapTime = null;
    room.receiverClapTime = null;
    room.status = "listening";
    room.testId += 1;
    room.lastActive = Date.now();
    res.json(room);
  });

  // API: Submit a clap timestamp from sender or receiver
  app.post("/api/rooms/:roomId/clap", (req, res) => {
    const { roomId } = req.params;
    const { role, clapTime, testId } = req.body;
    const room = rooms[roomId];
    if (!room) {
      return res.status(404).json({ error: "Room tidak ditemukan!" });
    }

    // Ignore clap if it's from an outdated test run
    if (testId !== room.testId) {
      return res.json({ message: "Outdated testId ignored", room });
    }

    room.lastActive = Date.now();

    if (role === "sender") {
      room.senderClapTime = Number(clapTime);
      if (room.status === "idle" || room.status === "listening") {
        room.status = "triggered";
      }
    } else if (role === "receiver") {
      room.receiverClapTime = Number(clapTime);
    }

    // If both times are captured, compute the speed and mark completed
    if (room.senderClapTime !== null && room.receiverClapTime !== null) {
      room.status = "completed";
    }

    res.json(room);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
