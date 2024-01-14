"use client";

import { useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";

import Board from "@/components/Board";

export default function App() {
	const [socket, setSocket] = useState<Socket>();
	const [player, setPlayer] = useState<string>();

	useEffect(() => {
		const URL =
			process.env.NODE_ENV === "production"
				? window.location.href
				: "http://localhost:3001";
		const socket = io(URL);
		setSocket(socket);

		socket.on("assignPlayer", (player: string) => {
			setPlayer(player);
		});

		return () => {
			socket.disconnect();
		};
	}, []);

	return (
		<div className="flex h-screen items-center justify-around">
			{socket ? (
				player ? (
					<Board socket={socket} player={player} />
				) : (
					<p>Assigning player role...</p>
				)
			) : (
				<p>Establishing connection to server...</p>
			)}
		</div>
	);
}
