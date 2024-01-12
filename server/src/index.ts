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

io.on("connection", (socket) => {
	console.log(`[server]: New connection from ${socket.id}`);
});

server.listen(port, () => {
	console.log(`[server]: Server is running at http://localhost:${port}`);
});
