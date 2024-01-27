type roomId = string;

export interface Board {
	board: string[][];
	currentPlayer?: "X" | "O";
	latestChildIndex?: number;
}

export class BoardStore {
	private boards: Map<roomId, Board>;

	constructor() {
		this.boards = new Map();
	}

	findBoard(roomId: roomId) {
		return this.boards.get(roomId);
	}

	saveBoard(roomId: roomId, board: Board) {
		this.boards.set(roomId, board);
	}

	findAllBoards() {
		return [...this.boards.values()];
	}
}
