import { ReactNode } from "react";

export default function Modal({ children }: { children: ReactNode }) {
	return (
		<div className="fixed inset-0 z-50 overflow-auto bg-black text-black bg-opacity-90 flex items-center justify-center text-center">
			<div className="relative mx-auto p-8 bg-white rounded-lg flex flex-col">
				{children}
			</div>
		</div>
	);
}
