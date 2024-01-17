type sessionId = string;

export interface Session {
	roomId: string;
	userId: string;
	playerRole: "X" | "O";
}

export class SessionStore {
	private sessions: Map<sessionId, Session>;

	constructor() {
		this.sessions = new Map();
	}

	findSession(id: sessionId) {
		return this.sessions.get(id);
	}

	saveSession(id: sessionId, session: Session) {
		this.sessions.set(id, session);
	}

	findAllSessions({ where }: { where?: Partial<Omit<Session, "playerRole">> }) {
		let sessions = [...this.sessions.values()];

		if (where && where.roomId) {
			sessions = sessions.filter((session) => session.roomId === where.roomId);
		}

		if (where && where.userId) {
			sessions = sessions.filter((session) => session.userId === where.userId);
		}

		return sessions;
	}
}
