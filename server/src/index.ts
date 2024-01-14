import dotenv from "dotenv";
import express, { Express } from "express";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();

const app: Express = express();
const server = createServer(app);
const port = process.env.PORT || 3001;
const io = new Server(server, {
	cors: {
		origin: "http://localhost:3000",
	},
});

const players: { [socketId: string]: string } = {};

io.on("connection", (socket) => {
	console.log(`[server]: New connection from ${socket.id}`);

	const assignPlayer = () => {
		if (!players[socket.id]) {
			players[socket.id] = Object.keys(players).length ? "O" : "X";
			console.log(`[server]: Assigned ${players[socket.id]} to ${socket.id}`);
		}
		io.to(socket.id).emit("assignPlayer", players[socket.id]);
	};
	assignPlayer();

	socket.on("makeMove", (parentIndex, childIndex) => {
		socket.broadcast.emit("makeMove", parentIndex, childIndex);
	});
});

server.listen(port, () => {
	console.log(`[server]: Server is running at http://localhost:${port}`);
});
