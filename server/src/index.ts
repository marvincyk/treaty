import dotenv from "dotenv";
import express, { Express } from "express";
import { createServer } from "http";
import humanId from "human-id";
import { Server } from "socket.io";

import { Session, SessionStore } from "./stores/Session.store";

dotenv.config();

const app: Express = express();
const server = createServer(app);
const port = process.env.PORT || 3001;
const io = new Server(server, {
	cors: {
		origin: "http://localhost:3000",
	},
});

const sessionStore = new SessionStore();

const assignPlayerRole = (roomId: Session["roomId"]) => {
	const sessions = sessionStore.findAllSessions({
		where: {
			roomId,
		},
	});
	console.log(
		`[server]: Found ${sessions.length} sessions with roomId ${roomId}`
	);
	return sessions.length ? "O" : "X";
};

io.use((socket, next) => {
	const sessionId = socket.handshake.auth.sessionId;
	const roomId = socket.handshake.auth.roomId;
	if (sessionId) {
		const session = sessionStore.findSession(sessionId);
		if (session) {
			console.log(
				`[server]: Existing session with sessionId ${sessionId} was found`
			);
			socket.data.sessionId = sessionId;
			socket.data.roomId = session.roomId;
			socket.data.userId = session.userId;
			socket.data.playerRole = session.playerRole;
			return next();
		}
	}
	socket.data.sessionId = humanId();
	socket.data.roomId = roomId ?? humanId();
	socket.data.userId = humanId();
	socket.data.playerRole = assignPlayerRole(socket.data.roomId);
	sessionStore.saveSession(socket.data.sessionId, {
		roomId: socket.data.roomId,
		userId: socket.data.userId,
		playerRole: socket.data.playerRole,
	});
	console.log(
		`[server]: Session saved with sessionId ${socket.data.sessionId} and roomId ${socket.data.roomId}`
	);
	next();
});

io.on("connection", (socket) => {
	console.log(
		`[server]: New connection from user with userId ${socket.data.userId}`
	);

	socket.emit("session", {
		sessionId: socket.data.sessionId,
		roomId: socket.data.roomId,
		userId: socket.data.userId,
		playerRole: socket.data.playerRole,
	});

	socket.on("makeMove", (parentIndex, childIndex) => {
		socket.broadcast.emit("makeMove", parentIndex, childIndex);
	});

	socket.on("disconnect", async () => {
		const matchingSockets = await io.in(socket.data.userId).fetchSockets();
		const isDisconnected = matchingSockets.length === 0;
		if (isDisconnected) {
			socket.broadcast.emit("userDisconnected", socket.data.userId);
			console.log(
				`[server]: User with userId ${socket.data.userId} has disconnected`
			);
		}
	});
});

server.listen(port, () => {
	console.log(`[server]: Server is running at http://localhost:${port}`);
});
