"use client";

import { useToggle } from "@uidotdev/usehooks";
import { useEffect, useState } from "react";
import { IconContext } from "react-icons";
import { FaO, FaX } from "react-icons/fa6";
import { Socket } from "socket.io-client";

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
	playerRole,
	latestChildIndex,
}: {
	parentIndex: number;
	board: string[][];
	onCellClick: (
		parentIndex: number,
		childIndex: number,
		shouldEmit: boolean
	) => void;
	isCurrentPlayerX: boolean;
	playerRole: string;
	latestChildIndex?: number;
}) {
	const [hoveredCell, setHoveredCell] = useState<number | null>(null);

	const isPlayerTurn = isCurrentPlayerX === (playerRole === "X");

	const isCellDisabled = (
		board: string[][],
		parentIndex: number,
		childIndex: number
	) =>
		board[parentIndex][childIndex] !== "" ||
		(latestChildIndex !== undefined && parentIndex !== latestChildIndex) ||
		!isPlayerTurn;

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
					onClick={() => onCellClick(parentIndex, index, true)}
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

export default function Board({
	socket,
	roomId,
	userId,
	playerRole,
	board,
	onBoardChange,
	onLeaveClick,
}: {
	socket: Socket;
	roomId: string;
	userId: string;
	playerRole: string;
	board: string[][];
	onBoardChange: (value: string[][]) => void;
	onLeaveClick: () => void;
}) {
	const [isCurrentPlayerX, setIsCurrentPlayerX] = useToggle(true);
	const [latestChildIndex, setLatestChildIndex] = useState<number>();
	const [isModalOpen, setIsModalOpen] = useToggle(false);

	useEffect(() => {
		socket.on("makeMove", (parentIndex: number, childIndex: number) => {
			makeMove(parentIndex, childIndex, false);
		});

		const winner = checkWinner();
		if (winner) {
			setIsModalOpen(true);
		}
	});

	const handleNewGameClick = () => location.reload();

	const makeMove = (
		parentIndex: number,
		childIndex: number,
		shouldEmit: boolean
	) => {
		const newBoard = [...board];
		if (isCurrentPlayerX) {
			newBoard[parentIndex][childIndex] = "X";
			setIsCurrentPlayerX(false);
		} else {
			newBoard[parentIndex][childIndex] = "O";
			setIsCurrentPlayerX(true);
		}
		if (shouldEmit) {
			socket.emit("makeMove", parentIndex, childIndex);
		}
		onBoardChange(newBoard);

		const isNextSubBoardWon = checkSubBoardWinner(newBoard, childIndex);
		if (isNextSubBoardWon) {
			// The next sub-board has already been won; unset `latestChildIndex` to allow the next playerRole to move anywhere.
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
			<div className="absolute top-4 left-4">
				<p>
					<b>sessionId: </b>
					{localStorage.getItem("sessionId")}
				</p>
				<p>
					<b>roomId: </b>
					{roomId}
				</p>
				<p>
					<b>userId: </b>
					{userId}
				</p>
				<p>
					<b>playerRole: </b>
					{playerRole}
				</p>
				<button
					className="mt-4 bg-white text-black font-bold py-2 px-4 rounded"
					onClick={onLeaveClick}
				>
					Leave
				</button>
			</div>
			<div className="grid grid-cols-3 gap-2 bg-white">
				{Array.from({ length: 9 }).map((_, index) => (
					<SubBoard
						key={index}
						parentIndex={index}
						board={board}
						onCellClick={makeMove}
						isCurrentPlayerX={isCurrentPlayerX}
						playerRole={playerRole}
						latestChildIndex={latestChildIndex}
					/>
				))}
			</div>
			{isModalOpen && (
				<Modal>
					<p>{`${winner} wins the game!`}</p>
					<button
						className="mt-4 bg-black text-white font-bold py-2 px-4 rounded"
						onClick={handleNewGameClick}
					>
						New Game
					</button>
				</Modal>
			)}
		</>
	);
}
