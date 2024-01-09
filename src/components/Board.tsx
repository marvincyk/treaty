"use client";

import { useToggle } from "@uidotdev/usehooks";
import { useState } from "react";
import { FaO, FaX } from "react-icons/fa6";

const renderCell = (board: string[][], parentIndex: number, index: number) => {
	switch (board[parentIndex][index]) {
		case "X":
			return <FaX size="2rem" />;
		case "O":
			return <FaO size="2rem" />;
		default:
			break;
	}
};

function SubBoard({
	parentIndex,
	board,
	onCellClick,
	latestChildIndex,
}: {
	parentIndex: number;
	board: string[][];
	onCellClick: (parentIndex: number, childIndex: number) => void;
	latestChildIndex?: number;
}) {
	const isCellDisabled = (
		board: string[][],
		parentIndex: number,
		childIndex: number
	) =>
		board[parentIndex][childIndex] !== "" ||
		(latestChildIndex !== undefined && parentIndex !== latestChildIndex);

	return (
		<div className="grid grid-cols-3 gap-0.5">
			{Array.from({ length: 9 }).map((_, index) => (
				<div
					key={index}
					className={`p-4 cursor-pointer bg-black min-h-[4rem] min-w-[4rem] ${
						isCellDisabled(board, parentIndex, index)
							? "pointer-events-none"
							: "animate-pulse"
					}`}
					onClick={() => onCellClick(parentIndex, index)}
				>
					{renderCell(board, parentIndex, index)}
				</div>
			))}
		</div>
	);
}

export default function Board() {
	const [board, setBoardState] = useState(
		Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => ""))
	);
	const [isCurrentPlayerX, setIsCurrentPlayerX] = useToggle(true);
	const [latestChildIndex, setLatestChildIndex] = useState<number>();

	const makeMove = (parentIndex: number, childIndex: number) => {
		const newBoard = [...board];
		if (isCurrentPlayerX) {
			newBoard[parentIndex][childIndex] = "X";
			setIsCurrentPlayerX(false);
		} else {
			newBoard[parentIndex][childIndex] = "O";
			setIsCurrentPlayerX(true);
		}
		setBoardState(newBoard);
		setLatestChildIndex(childIndex);
	};

	return (
		<div className="grid grid-cols-3 gap-2 bg-white">
			{Array.from({ length: 9 }).map((_, index) => (
				<SubBoard
					key={index}
					parentIndex={index}
					board={board}
					onCellClick={makeMove}
					latestChildIndex={latestChildIndex}
				/>
			))}
		</div>
	);
}
