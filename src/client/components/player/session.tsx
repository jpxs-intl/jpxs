import { GameSession } from "../../../database/entities/session.entity.js";
import { time } from "../../../utils/time.js";

export default async function Session(props: { session: GameSession }) {
	return (
		<li class="session" id={props.session.id}>
			<span class="session-server" safe>
				{await props.session.server.getName()}
			</span>
			<span class="session-start" data-timestamp={props.session.startedAt.getTime()} safe>
				{props.session.startedAt.toLocaleString()}
			</span>
			{props.session.endedAt ? (
				<span class="session-end" data-timestamp={props.session.endedAt.getTime()} safe>
					{props.session.endedAt.toLocaleString()}
				</span>
			) : (
				<span class="session-end">Ongoing</span>
			)}
			<span class="session-duration" safe>
				{time(
					props.session.endedAt
						? props.session.endedAt.getTime() - props.session.startedAt.getTime()
						: Date.now() - props.session.startedAt.getTime()
				).toString(true)}
			</span>
		</li>
	);
}
