import Board from "@/components/Board";

export default function App() {
	return (
		<div className="flex h-screen items-center justify-center">
			<div className="grid grid-cols-3 gap-8">
				{Array.from({ length: 9 }).map((_, index) => (
					<Board key={index} />
				))}
			</div>
		</div>
	);
}
