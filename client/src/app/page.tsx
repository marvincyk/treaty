"use client";

import { useToggle } from "@uidotdev/usehooks";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

import Board from "@/components/Board";
import Menu from "@/components/Menu";
import Modal from "@/components/Modal";

const URL =
	process.env.NODE_ENV === "production"
		? window.location.href
		: "http://localhost:3001";

export default function App() {
	const socket = useRef(io(URL, { autoConnect: false }));
	const [isGameStarted, setIsGameStarted] = useToggle(false);
	const [isJoiningGame, setIsJoiningGame] = useToggle(false);
	const [roomId, setRoomId] = useState<string>();
	const [userId, setUserId] = useState<string>();
	const [playerRole, setPlayerRole] = useState<string>();
	const [board, setBoard] = useState<string[][]>();

	useEffect(() => {
		if (!!localStorage.getItem("sessionId")) {
			setIsGameStarted(true);
		}

		if (isGameStarted) {
			const sessionId = localStorage.getItem("sessionId");
			if (sessionId) {
				socket.current.auth = { sessionId };
			}
			if (roomId) {
				socket.current.auth = { ...socket.current.auth, roomId };
			}
			socket.current.connect();

			socket.current.on(
				"session",
				({
					sessionId,
					roomId,
					userId,
					playerRole,
					board,
				}: {
					sessionId: string;
					roomId: string;
					userId: string;
					playerRole: "X" | "O";
					board: string[][];
				}) => {
					socket.current.auth = { sessionId };
					localStorage.setItem("sessionId", sessionId);
					setRoomId(roomId);
					setUserId(userId);
					setPlayerRole(playerRole);
					setBoard(board);
				}
			);
		}
	}, [isGameStarted, socket, roomId, setIsGameStarted]);

	const onStartClick = () => setIsGameStarted(true);

	const onJoinClick = () => setIsJoiningGame(true);

	const handleJoinGameModalClose = () => setIsJoiningGame(false);

	const handleJoinGameInputChange = (e: React.FormEvent<HTMLInputElement>) => {
		setRoomId(e.currentTarget.value);
	};

	const handleJoinGameConfirm = () => {
		setIsJoiningGame(false);
		setIsGameStarted(true);
	};

	const handleBoardChange = (value: string[][]) => {
		setBoard(value);
	};

	const handleLeaveClick = () => {
		localStorage.removeItem("sessionId");
		socket.current.auth = {};
		setRoomId(undefined);
		setUserId(undefined);
		setPlayerRole(undefined);
		setIsGameStarted(false);
		socket.current.disconnect();
	};

	return (
		<div className="flex h-screen items-center justify-around">
			{isGameStarted ? (
				socket.current && roomId && userId && playerRole && board ? (
					<Board
						socket={socket.current}
						roomId={roomId}
						userId={userId}
						playerRole={playerRole}
						board={board}
						onBoardChange={handleBoardChange}
						onLeaveClick={handleLeaveClick}
					/>
				) : (
					<p>Establishing connection to server...</p>
				)
			) : (
				<Menu onStartClick={onStartClick} onJoinClick={onJoinClick} />
			)}
			{isJoiningGame && (
				<Modal>
					<h1 className="text-xl font-semibold">Join Game</h1>
					<input
						className="border rounded-md p-2 mt-4 focus:outline-none border-gray-400 focus:border-black"
						type="text"
						value={roomId}
						onChange={handleJoinGameInputChange}
					/>
					<button
						className="mt-4 bg-black text-white font-bold py-2 px-4 rounded"
						onClick={handleJoinGameConfirm}
					>
						Confirm
					</button>
					<button
						onClick={handleJoinGameModalClose}
						className="absolute top-0 right-2 text-2xl text-gray-500 hover:text-gray-700"
					>
						&times;
					</button>
				</Modal>
			)}
		</div>
	);
}
