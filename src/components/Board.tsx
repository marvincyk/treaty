function SubBoard() {
	return (
		<div className="grid grid-cols-3 gap-2">
			{Array.from({ length: 9 }).map((_, index) => (
				<div
					key={index}
					className="bg-slate-900 hover:bg-slate-700 p-4 cursor-pointer"
				></div>
			))}
		</div>
	);
}

export default function Board() {
	return (
		<div className="grid grid-cols-3 gap-8 border rounded-xl shadow-[0_0_2rem__1rem_white] p-8">
			{Array.from({ length: 9 }).map((_, index) => (
				<SubBoard key={index} />
			))}
		</div>
	);
}
