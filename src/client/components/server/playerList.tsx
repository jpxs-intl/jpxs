import { AuthSession } from "../../../database/entities/authSession.entity.js";
import { Player } from "../../../database/entities/player.entity.js";
import Core from "../../../server/core.js";
import DataStorage from "../../../server/data/dataStorage.js";
import Util from "../../../utils/index.js";

/*
    goldmen = 0,
    monsota = 1,
    oxs = 2,
    nexaco = 3,
    pentacom = 4,
    prodocon = 5,
    megacorp = 6,
    civilian = 17,
    */

export const TeamData = {
	0: { name: "Goldmen", color: "#b97418" },
	1: { name: "Monsota", color: "#126f8e" },
	2: { name: "OXS", color: "#ffffff" },
	3: { name: "Nexaco", color: "#a20a0a" },
	4: { name: "Pentacom", color: "#bcb9b2" },
	5: { name: "Prodocon", color: "#71804c" },
	6: { name: "Megacorp", color: "#ffffff" },
	8: { name: "Brownwater", color: "#126f8e" },
	// 17: { name: "Civilian / Spectator", color: "#a0a0a0" }, // backup is civilian
};

export const SpectatorModes = new Set([
	3, // Round
	5, // Elim
	7, // VS
]);

export default async function ServerPlayerList(props: { session: AuthSession; path: string; id?: string }) {
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

	const teams: Record<number, Player[]> = {};

	for (const livePlayer of server.players || []) {
		const player = players.find((p) => p.gameId === livePlayer.gameId);
		if (player) {
			if (!teams[livePlayer.team]) {
				teams[livePlayer.team] = [];
			}
			teams[livePlayer.team].push(player);
		}
	}

	const visiblePlayerCount = server.players ? server.players.length : server.playerCount;

	return (
		<div
			class="player-list"
			hx-get={`/component/server.playerList?id=${id}`}
			hx-trigger="every 15s"
			hx-target=".player-list"
			hx-swap="outerHTML"
		>
			({visiblePlayerCount} {visiblePlayerCount === 1 ? "player" : "players"})
			<ul class="team-list">
				{await Promise.all(
					Object.entries(teams).map(async ([teamId, teamPlayers]) => {
						const teamData = TeamData[parseInt(teamId) as keyof typeof TeamData] || {
							name: SpectatorModes.has(server.gameType) ? "Spectator" : "Civilian",
							color: "#ffffff",
						};

						return (
							<li class="team" style={{ color: teamData.color }}>
								<h3>{teamData.name} </h3>
								<ul>
									{await Promise.all(
										teamPlayers.map(async (player) => {
											const name = await player.getName();
											return (
												<li class="player-list-item">
													<a
														href={`/player/${player.phoneNumber}`}
														hx-get={`/component/page/player?id=${player.phoneNumber}`}
														hx-target=".main"
														hx-swap="innerHTML"
														hx-push-url={`/player/${player.phoneNumber}`}
													>
														<img
															src={`https://avatars.jpxs.io/${player.phoneNumber}?size=64&teamIndex=${teamId}`}
															alt={name}
															class="avatar"
														/>
														<span class="player-name" style={{ color: teamData.color }} safe>
															{name}
														</span>
														<span class="player-phone" safe>
															{Util.formatPhone(player.phoneNumber)}
														</span>
													</a>
												</li>
											);
										})
									)}
								</ul>
							</li>
						);
					})
				)}
			</ul>
		</div>
	);
}
