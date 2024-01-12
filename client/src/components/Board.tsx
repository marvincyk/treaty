"use client";

import { useToggle } from "@uidotdev/usehooks";
import { useEffect, useState } from "react";
import { IconContext } from "react-icons";
import { FaO, FaX } from "react-icons/fa6";

import Modal from "./Modal";

const WIN_COMBINATIONS = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[2, 4, 6],
];

// TODO: Handle hover state using `useHover`.
// See: https://usehooks.com/usehover
function Cell({
	board,
	parentIndex,
	childIndex,
	isCurrentPlayerX,
	isHovered,
}: {
	board: string[][];
	parentIndex: number;
	childIndex: number;
	isCurrentPlayerX: boolean;
	isHovered: boolean;
}) {
	switch (board[parentIndex][childIndex]) {
		case "X":
			return <FaX size="2rem" />;
		case "O":
			return <FaO size="2rem" />;
		default:
			if (isHovered) {
				if (isCurrentPlayerX) {
					return (
						<IconContext.Provider value={{ style: { opacity: 0.5 } }}>
							<div>
								<FaX size="2rem" />
							</div>
						</IconContext.Provider>
					);
				}
				return (
					<IconContext.Provider value={{ style: { opacity: 0.5 } }}>
						<div>
							<FaO size="2rem" />
						</div>
					</IconContext.Provider>
				);
			}
			break;
	}
}

const checkSubBoardWinner = (board: string[][], parentIndex: number) => {
	const winCombinations = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		[0, 4, 8],
		[2, 4, 6],
	];

	for (const combination of winCombinations) {
		const [a, b, c] = combination;
		const subBoard = board[parentIndex];

		if (
			subBoard[a] !== "" &&
			subBoard[a] === subBoard[b] &&
			subBoard[a] === subBoard[c]
		) {
			return subBoard[a];
		}
	}

	return null;
};

function SubBoard({
	parentIndex,
	board,
	onCellClick,
	isCurrentPlayerX,
	latestChildIndex,
}: {
	parentIndex: number;
	board: string[][];
	onCellClick: (parentIndex: number, childIndex: number) => void;
	isCurrentPlayerX: boolean;
	latestChildIndex?: number;
}) {
	const [hoveredCell, setHoveredCell] = useState<number | null>(null);

	const isCellDisabled = (
		board: string[][],
		parentIndex: number,
		childIndex: number
	) =>
		board[parentIndex][childIndex] !== "" ||
		(latestChildIndex !== undefined && parentIndex !== latestChildIndex);

	const handleCellEnter = (childIndex: number) => {
		if (!isCellDisabled(board, parentIndex, childIndex)) {
			setHoveredCell(childIndex);
		}
	};

	const handleCellLeave = () => setHoveredCell(null);

	const winner = checkSubBoardWinner(board, parentIndex);
	if (winner) {
		switch (winner) {
			case "X":
				return (
					<div className="bg-black">
						<FaX size="12rem" />
					</div>
				);
			case "O":
				return (
					<div className="bg-black">
						<FaO size="12rem" />
					</div>
				);
		}
	}

	return (
		<div className="grid grid-cols-3 gap-0.5">
			{Array.from({ length: 9 }).map((_, index) => (
				<div
					key={index}
					className={`p-4 cursor-pointer bg-black sm:h-16 sm:w-16 ${
						isCellDisabled(board, parentIndex, index)
							? "pointer-events-none"
							: "bg-neutral-400"
					}`}
					onClick={() => onCellClick(parentIndex, index)}
					onMouseEnter={() => handleCellEnter(index)}
					onMouseLeave={handleCellLeave}
				>
					<Cell
						board={board}
						parentIndex={parentIndex}
						childIndex={index}
						isCurrentPlayerX={isCurrentPlayerX}
						isHovered={index === hoveredCell}
					/>
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
	const [isModalOpen, setIsModalOpen] = useToggle(false);

	useEffect(() => {
		const winner = checkWinner();
		if (winner) {
			setIsModalOpen(true);
		}
	});

	const onNewGameClick = () => location.reload();

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

		const isNextSubBoardWon = checkSubBoardWinner(newBoard, childIndex);
		if (isNextSubBoardWon) {
			// The next sub-board has already been won; unset `latestChildIndex` to allow the next player to move anywhere.
			setLatestChildIndex(undefined);
		} else {
			setLatestChildIndex(childIndex);
		}
	};

	const checkWinner = () => {
		const subBoardWinners = [];
		for (let i = 0; i < board.length; i++) {
			const winner = checkSubBoardWinner(board, i);
			subBoardWinners.push(winner ?? "");
		}

		for (const combination of WIN_COMBINATIONS) {
			const [a, b, c] = combination;

			if (
				subBoardWinners[a] !== "" &&
				subBoardWinners[a] === subBoardWinners[b] &&
				subBoardWinners[a] === subBoardWinners[c]
			) {
				return subBoardWinners[a];
			}
		}

		return null;
	};
	const winner = checkWinner();

	return (
		<>
			<div className="grid grid-cols-3 gap-2 bg-white">
				{Array.from({ length: 9 }).map((_, index) => (
					<SubBoard
						key={index}
						parentIndex={index}
						board={board}
						onCellClick={makeMove}
						isCurrentPlayerX={isCurrentPlayerX}
						latestChildIndex={latestChildIndex}
					/>
				))}
			</div>
			{isModalOpen && (
				<Modal
					onNewGameClick={onNewGameClick}
				>{`${winner} wins the game!`}</Modal>
			)}
		</>
	);
}
