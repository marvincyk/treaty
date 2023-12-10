import { FaRegCircleUser } from "react-icons/fa6";

interface PlayerProps {
	name: string;
}

export default function Player({ name }: PlayerProps) {
	return (
		<div className="flex flex-col items-center gap-20 text-6xl font-extrabold">
			<FaRegCircleUser size={128} />
			{name}
		</div>
	);
}
