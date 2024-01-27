import dotenv from "dotenv";
import express, { Express } from "express";
import { createServer } from "http";
import humanId from "human-id";
import { Server } from "socket.io";

import { BoardStore } from "./stores/Board.store";
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
const boardStore = new BoardStore();

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

			const board = boardStore.findBoard(session.roomId);
			socket.data.board = board?.board;
			socket.data.currentPlayer = board?.currentPlayer;
			socket.data.latestChildIndex = board?.latestChildIndex;
			return next();
		}
	}
	socket.data.sessionId = humanId();
	socket.data.roomId = roomId ?? humanId();
	socket.data.userId = humanId();
	socket.data.playerRole = assignPlayerRole(socket.data.roomId);
	socket.data.board = Array.from({ length: 9 }, () =>
		Array.from({ length: 9 }, () => "")
	);
	socket.data.currentPlayer = "X";
	sessionStore.saveSession(socket.data.sessionId, {
		roomId: socket.data.roomId,
		userId: socket.data.userId,
		playerRole: socket.data.playerRole,
	});
	console.log(
		`[server]: Session saved with sessionId ${socket.data.sessionId} and roomId ${socket.data.roomId}`
	);
	boardStore.saveBoard(socket.data.roomId, {
		board: socket.data.board,
		currentPlayer: socket.data.currentPlayer,
		latestChildIndex: socket.data.latestChildIndex,
	});
	next();
});

io.on("connection", (socket) => {
	console.log(
		`[connection]: New connection from user with userId ${socket.data.userId}`
	);

	socket.emit("session", {
		sessionId: socket.data.sessionId,
		roomId: socket.data.roomId,
		userId: socket.data.userId,
		playerRole: socket.data.playerRole,
		board: socket.data.board,
		currentPlayer: socket.data.currentPlayer,
		latestChildIndex: socket.data.latestChildIndex,
	});

	socket.on("makeMove", (parentIndex, childIndex) => {
		socket.broadcast.emit("makeMove", parentIndex, childIndex);
	});

	socket.on("boardChange", (board) => {
		socket.data.board = board;
		boardStore.saveBoard(socket.data.roomId, {
			board: socket.data.board,
			currentPlayer: socket.data.currentPlayer,
			latestChildIndex: socket.data.latestChildIndex,
		});
	});

	socket.on("currentPlayerChange", () => {
		if (socket.data.currentPlayer === "X") {
			socket.data.currentPlayer = "O";
		} else {
			socket.data.currentPlayer = "X";
		}
		console.log(
			`[currentPlayerChange] socket.data.currentPlayer = ${socket.data.currentPlayer}`
		);
		boardStore.saveBoard(socket.data.roomId, {
			board: socket.data.board,
			currentPlayer: socket.data.currentPlayer,
			latestChildIndex: socket.data.latestChildIndex,
		});
	});

	socket.on("latestChildIndexChange", (latestChildIndex) => {
		socket.data.latestChildIndex = latestChildIndex;
		console.log(
			`[latestChildIndexChange] socket.data.latestChildIndex = ${latestChildIndex}`
		);
		boardStore.saveBoard(socket.data.roomId, {
			board: socket.data.board,
			currentPlayer: socket.data.currentPlayer,
			latestChildIndex: socket.data.latestChildIndex,
		});
	});

	socket.on("disconnect", async () => {
		const matchingSockets = await io.in(socket.data.userId).fetchSockets();
		const isDisconnected = matchingSockets.length === 0;
		if (isDisconnected) {
			socket.broadcast.emit("userDisconnected", socket.data.userId);
			console.log(
				`[disconnect]: User with userId ${socket.data.userId} has disconnected`
			);
		}
	});
});

server.listen(port, () => {
	console.log(`[server]: Server is running at http://localhost:${port}`);
});
