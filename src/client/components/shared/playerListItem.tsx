import Util from "../../../utils/index.js";

export default function PlayerListItem(props: {
	gameId: number;
	phoneNumber: number;
	name: string;
	team?: string | number;
	color?: string;
	money?: number;
}) {
	return (
		<li class="player-list-item row">
			<a
				href={`/player/${props.phoneNumber}`}
				hx-get={`/component/page/player?id=${props.phoneNumber}&path=/player/${props.phoneNumber}`}
				hx-target=".main"
				hx-swap="innerHTML"
				hx-push-url={`/player/${props.phoneNumber}`}
			>
				<div class="col">
					<img
						src={`https://avatars.jpxs.io/${props.phoneNumber}?size=64${
							props.team ? `&team=${props.team}` : ""
						}`}
						alt={props.name}
						class="avatar"
					/>
					<span class="player-name" style={props.color && { color: props.color }} safe>
						{props.name}
					</span>
					<span class="player-phone" safe>
						{Util.formatPhone(props.phoneNumber)}
					</span>
				</div>
				<div class="col text-right">
					{props.money !== undefined && (
						<span class="player-money" safe>
							${Intl.NumberFormat().format(props.money)}
						</span>
					)}
				</div>
			</a>
		</li>
	);
}
