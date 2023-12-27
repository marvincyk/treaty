import { FaO, FaX } from "react-icons/fa6";

const STATE = [
	["", "", "", "", "", "", "", "", ""],
	["", "", "", "", "", "", "", "", ""],
	["", "", "", "", "", "", "", "", ""],
	["", "", "", "", "", "", "", "", ""],
	["X", "O", "O", "", "X", "", "", "", "X"],
	["", "", "", "", "", "", "", "", ""],
	["", "", "", "", "", "", "", "", ""],
	["", "", "", "", "", "", "", "", ""],
	["", "", "", "", "", "", "", "", ""],
];

const renderCell = (parentIndex: number, index: number) => {
	switch (STATE[parentIndex][index]) {
		case "X":
			return <FaX size="2rem" />;
		case "O":
			return <FaO size="2rem" />;
		default:
			break;
	}
};

function SubBoard({ parentIndex }: { parentIndex: number }) {
	return (
		<div className="grid grid-cols-3 gap-0.5">
			{Array.from({ length: 9 }).map((_, index) => (
				<div key={index} className="p-4 cursor-pointer bg-black min-h-[4rem]">
					{renderCell(parentIndex, index)}
				</div>
			))}
		</div>
	);
}

export default function Board() {
	return (
		<div className="grid grid-cols-3 gap-2 bg-white">
			{Array.from({ length: 9 }).map((_, index) => (
				<SubBoard key={index} parentIndex={index} />
			))}
		</div>
	);
}
