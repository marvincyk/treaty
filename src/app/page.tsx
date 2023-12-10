import Board from "@/components/Board";
import Player from "@/components/Player";

export default function App() {
	return (
		<div className="flex h-screen items-center justify-around">
			<Player name="X" />
			<div className="grid grid-cols-3 gap-8 border rounded-xl shadow-[0_0_2rem__1rem_white] p-8">
				{Array.from({ length: 9 }).map((_, index) => (
					<Board key={index} />
				))}
			</div>
			<Player name="O" />
		</div>
	);
}
