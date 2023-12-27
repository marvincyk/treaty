function SubBoard() {
	return (
		<div className="grid grid-cols-3 gap-0.5">
			{Array.from({ length: 9 }).map((_, index) => (
				<div key={index} className="p-8 cursor-pointer bg-black"></div>
			))}
		</div>
	);
}

export default function Board() {
	return (
		<div className="grid grid-cols-3 gap-2 bg-white">
			{Array.from({ length: 9 }).map((_, index) => (
				<SubBoard key={index} />
			))}
		</div>
	);
}
