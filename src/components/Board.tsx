"use client";

import { useToggle } from "@uidotdev/usehooks";
import { useState } from "react";
import { FaO, FaX } from "react-icons/fa6";

const renderCell = (
	boardState: string[][],
	parentIndex: number,
	index: number
) => {
	switch (boardState[parentIndex][index]) {
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
	boardState,
	onCellClick,
}: {
	parentIndex: number;
	boardState: string[][];
	onCellClick: (parentIndex: number, childIndex: number) => void;
}) {
	const isCellDisabled = (
		boardState: string[][],
		parentIndex: number,
		childIndex: number
	) => boardState[parentIndex][childIndex] !== "";

	return (
		<div className="grid grid-cols-3 gap-0.5">
			{Array.from({ length: 9 }).map((_, index) => (
				<div
					key={index}
					className={`p-4 cursor-pointer bg-black min-h-[4rem] min-w-[4rem] hover:bg-slate-800 ${
						isCellDisabled(boardState, parentIndex, index)
							? "pointer-events-none"
							: "pointer-events-auto"
					}`}
					onClick={() => onCellClick(parentIndex, index)}
				>
					{renderCell(boardState, parentIndex, index)}
				</div>
			))}
		</div>
	);
}

export default function Board() {
	const [boardState, setBoardState] = useState([
		["", "", "", "", "", "", "", "", ""],
		["", "", "", "", "", "", "", "", ""],
		["", "", "", "", "", "", "", "", ""],
		["", "", "", "", "", "", "", "", ""],
		["", "", "", "", "", "", "", "", ""],
		["", "", "", "", "", "", "", "", ""],
		["", "", "", "", "", "", "", "", ""],
		["", "", "", "", "", "", "", "", ""],
		["", "", "", "", "", "", "", "", ""],
	]);
	const [isCurrentPlayerX, setIsCurrentPlayerX] = useToggle(true);

	const makeMove = (parentIndex: number, childIndex: number) => {
		const newBoardState = [...boardState];
		if (isCurrentPlayerX) {
			newBoardState[parentIndex][childIndex] = "X";
			setIsCurrentPlayerX(false);
		} else {
			newBoardState[parentIndex][childIndex] = "O";
			setIsCurrentPlayerX(true);
		}
		setBoardState(newBoardState);
	};

	return (
		<div className="grid grid-cols-3 gap-2 bg-white">
			{Array.from({ length: 9 }).map((_, index) => (
				<SubBoard
					key={index}
					parentIndex={index}
					boardState={boardState}
					onCellClick={makeMove}
				/>
			))}
		</div>
	);
}
