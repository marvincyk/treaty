import { ReactNode } from "react";

export default function Modal({
	onNewGameClick,
	children,
}: {
	onNewGameClick: () => void;
	children: ReactNode;
}) {
	const handleNewGameClick = () => onNewGameClick();

	return (
		<div className="fixed inset-0 z-50 overflow-auto bg-black text-black bg-opacity-90 flex items-center justify-center">
			<div className="relative mx-auto p-8 bg-white rounded-lg flex flex-col">
				{children}
				<button
					className="mt-4 bg-black text-white font-bold py-2 px-4 rounded"
					onClick={handleNewGameClick}
				>
					New Game
				</button>
			</div>
		</div>
	);
}
