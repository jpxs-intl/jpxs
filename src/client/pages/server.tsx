import { AuthSession } from "../../database/entities/authSession.entity.js";
import Core from "../../server/core.js";
import DataStorage from "../../server/data/dataStorage.js";
import Util from "../../utils/index.js";
import GlobalLogger from "../../utils/logger.js";
import Logo from "../components/global/logo.js";

export default async function ServerPage(props: { session: AuthSession; path: string; id?: string }) {
	const id = props.id || props.path.split("/")[2];

	if (!id) {
		return <div>Server ID is required</div>;
	}

	const server = DataStorage.serverInfo[id];

	if (!server) {
		return <div>Server not found</div>;
	}

	const players = await Core.services.player.find({
		gameId: {
			$in: server.players?.map((player) => player.gameId) || [],
		},
	});

	return (
		<div class="server-page container">
			<Logo />
			<div class="server-page-header">
				<div class="icon">
					<img
						src={
							(server.icon?.length || 0) > 0 && server.icon !== "<default>"
								? server.icon
								: "https://assets.jpxs.io/img/default/subrosa.png"
						}
						alt="Server Icon"
						class="server-icon"
					/>
				</div>
				<h2 safe>{server.name}</h2>
			</div>
			<div class="info">
				<p safe>
					{(server.description?.length || 0) > 0 && server.description !== "<default>"
						? server.description
						: server.mode?.description || ""}
				</p>
				<div class="tags">
					{server.tags != undefined &&
						server.tags
							.filter((tag) => tag !== "<default>" && tag !== "")
							.map((tag) => {
								return (
									<span class="tag" style={`background-color: ${GlobalLogger.getColor(tag)};`} safe>
										{tag}
									</span>
								);
							})}
				</div>
			</div>
			<div class="player-list">
				({server.players?.length || 0} {players?.length === 1 ? "player" : "players"})
				<ul>
					{await Promise.all(
						players.map(async (player) => {
							const name = await player.getName();
							return (
								<li class="player-list-item">
									<a href={`/player/${player.phoneNumber}`}>
										<img
											src={`https://avatars.jpxs.io/${player.phoneNumber}?size=64`}
											alt={name}
											class="avatar"
										/>
										<span class="player-name" safe>
											{name}
										</span>
										<span class="player-phone" safe>
											{Util.formatPhone(player.phoneNumber)}
										</span>
									</a>
								</li>
							);
						}) as Promise<"safe">[]
					)}
				</ul>
			</div>
		</div>
	);
}
