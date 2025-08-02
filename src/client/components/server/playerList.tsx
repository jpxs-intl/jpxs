import { AuthSession } from "../../../database/entities/authSession.entity.js";
import { Player } from "../../../database/entities/player.entity.js";
import Core from "../../../server/core.js";
import DataStorage, { JPXSPlayerData } from "../../../server/data/dataStorage.js";
import { SpectatorModes, TeamData, TimerCountdownModes } from "../../shared/gameData.js";
import PlayerListItem from "../shared/playerListItem.js";
import RoundTimer from "./roundTimer.js";

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

	const teams: Record<number, (Player & JPXSPlayerData)[]> = {};

	for (const livePlayer of server.players || []) {
		const player = players.find((p) => p.gameId === livePlayer.gameId);
		if (player) {
			if (!teams[livePlayer.team]) {
				teams[livePlayer.team] = [];
			}
			teams[livePlayer.team].push(Object.assign(player, livePlayer));
		}
	}

	for (const team of Object.values(teams)) {
		team.sort((a, b) => b.money - a.money);
	}

	const visiblePlayerCount = server.players ? server.players.length : server.playerCount;

	return (
		<div
			class="player-list"
			hx-get={`/component/server.playerList?id=${id}&excludePackaged=true`}
			hx-trigger="every 15s"
			hx-target=".player-list"
			hx-swap="outerHTML"
		>
			({visiblePlayerCount} {visiblePlayerCount === 1 ? "player" : "players"}){" "}
			{TimerCountdownModes.has(server.gameType) && server.time && server.listUpdatedAt && (
				<RoundTimer timeLeft={server.time} listUpdatedAt={server.listUpdatedAt} />
			)}
			<ul class="team-list">
				{await Promise.all(
					Object.entries(teams).map(async ([teamId, teamPlayers]) => {
						const teamData = TeamData[parseInt(teamId) as keyof typeof TeamData] || {
							name: SpectatorModes.has(server.gameType) ? "Spectator" : "Civilian",
							color: "#ffffff",
						};

						return (
							<li class="team">
								<h3 style={{ color: teamData.color }}>{teamData.name}</h3>
								<ul>
									{await Promise.all(
										teamPlayers.map(async (player) => {
											const name = await player.getName();
											return (
												<PlayerListItem
													gameId={player.gameId}
													phoneNumber={player.phoneNumber}
													name={name}
													team={teamId}
													color={teamData.color}
													money={player.money}
												/>
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
