export default function Menu({
	onStartClick,
	onJoinClick,
}: {
	onStartClick: () => void;
	onJoinClick: () => void;
}) {
	const handleStartClick = () => onStartClick();
	const handleJoinClick = () => onJoinClick();

	return (
		<div className="flex flex-col gap-20 items-center">
			<h1 className="text-9xl">Treaty</h1>
			<div className="flex justify-evenly w-full">
				<button
					className="bg-white text-black font-bold py-2 px-4 rounded max-w-fit"
					onClick={handleStartClick}
				>
					Start
				</button>
				<button
					className="bg-white text-black font-bold py-2 px-4 rounded max-w-fit"
					onClick={handleJoinClick}
				>
					Join
				</button>
			</div>
		</div>
	);
}
