import Board from "@/components/Board";
import Player from "@/components/Player";

export default function App() {
	return (
		<div className="flex h-screen items-center justify-around">
			<Player name="X" />
			<Board />
			<Player name="O" />
		</div>
	);
}
