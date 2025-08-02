import { JPXSServerData } from "../../../server/data/dataStorage.js";
import Util from "../../../utils/index.js";
import GlobalLogger from "../../../utils/logger.js";

export default function Server(props: { data: JPXSServerData; id: string }) {
	return (
		<div class="sle" id={props.id}>
			<div class="icon">
				<img
					src={
						(props.data.icon?.length || 0) > 0 && props.data.icon !== "<default>"
							? props.data.icon
							: "https://assets.jpxs.io/img/default/subrosa.png"
					}
					alt="Server Icon"
					class="server-icon"
				/>
			</div>
			<div class="info">
				<div class="name">
					<h2 class={props.data.jpxs ? "primary" : ""} safe>
						{props.data.name}
					</h2>
					<p safe>
						{(props.data.description?.length || 0) > 0 && props.data.description !== "<default>"
							? props.data.description
							: props.data.mode?.description || ""}
					</p>
				</div>
				<div class="bottom">
					<a
						class="status-item link"
						hx-get={`/component/page/server?id=${props.id}&path=/server/${props.id}`}
						hx-target=".main"
						hx-swap="innerHTML"
						hx-push-url={`/server/${props.id}`}
					>
						Info
					</a>
					<div class="status-item">
						{props.data.playerCount}/{props.data.maxPlayers}
					</div>
					<div
						class="status-item"
						style={`background-color: ${GlobalLogger.getColor(
							`${props.data.masterServer == "jpxs" ? "fw-" : ""}${props.data.version}${props.data.build}`
						)};`}
					>
						{props.data.masterServer == "jpxs" ? "fw-" : ""}
						{props.data.version}
						{props.data.build as "safe"}
					</div>
					<div class="tags">
						{props.data.tags != undefined &&
							props.data.tags
								.filter((tag) => tag !== "<default>" && tag !== "")
								.map((tag) => {
									return (
										<span class="tag" style={`background-color: ${GlobalLogger.getColor(tag)};`} safe>
											{tag}
										</span>
									);
								})}
					</div>
					{props.data.players != undefined &&
						props.data.players.slice(0, 5).map((player) => (
							<a
								class="tooltip-info"
								href={`/player/${player.phoneNumber}`}
								hx-get={`/component/page/player?id=${player.phoneNumber}&path=/player/${player.phoneNumber}`}
								hx-target=".main"
								hx-swap="innerHTML"
								hx-push-url={`/player/${player.phoneNumber}`}
							>
								<span class="player-tooltip">
									<h4 class="player-name" safe>
										{player.name}
									</h4>
									<p class="player-phone" safe>
										{Util.formatPhone(player.phoneNumber)}
									</p>
								</span>
								<img
									class="avatar"
									src={`https://avatars.jpxs.io/${player.phoneNumber}?size=64`}
									alt={player.name}
								></img>
							</a>
						))}
					{(props.data.players?.length || 0) > 5 && (
						<a
							class="tooltip-info"
							href={`/server/${props.id}`}
							hx-get={`/component/page/server?id=${props.id}&path=/server/${props.id}`}
							hx-target=".main"
							hx-swap="innerHTML"
							hx-push-url={`/server/${props.id}`}
						>
							<span class="player-tooltip">
								<h4 class="player-name">+{(props.data.players?.length || 0) - 5} more players</h4>
								<p class="player-phone">Click to view all</p>
							</span>
							<span class="more-players">+</span>
						</a>
					)}
				</div>
			</div>
		</div>
	);
}
