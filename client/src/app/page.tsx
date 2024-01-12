import { io } from "socket.io-client";

import Board from "@/components/Board";

const socket = io("http://localhost:3001");

export default function App() {
	return (
		<div className="flex h-screen items-center justify-around">
			<Board />
		</div>
	);
}
