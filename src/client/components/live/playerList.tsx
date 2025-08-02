import { Player } from "../../../database/entities/player.entity.js";
import Core from "../../../server/core.js";
import DataStorage, { JPXSPlayerData } from "../../../server/data/dataStorage.js";
import { TeamData } from "../../shared/gameData.js";
import PlayerListItem from "../shared/playerListItem.js";

export default async function PlayerList() {
	const servers = DataStorage.visible;

	const playerList: Record<string, JPXSPlayerData[]> = {};
	let totalPlayers = 0;

	const playerIds: Set<number> = new Set();

	for (const [serverId, serverData] of Object.entries(servers)) {
		if (!serverData.players || serverData.players.length === 0) continue;

		if (!playerList[serverId]) {
			playerList[serverId] = [];
		}

		for (const player of serverData.players) {
			if (!playerList[serverId].find((p) => p.gameId === player.gameId)) {
				playerList[serverId].push(player);
				playerIds.add(player.gameId);
				totalPlayers++;
			}
		}
	}

	const playerEntities: Record<number, Player> = (
		await Core.services.player.find({
			gameId: {
				$in: Array.from(playerIds),
			},
		})
	).reduce((acc, player) => {
		acc[player.gameId] = player;
		return acc;
	}, {} as Record<number, Player>);

	return (
		<div
			class="player-list"
			hx-get="/component/live.playerList?path=/live/players"
			hx-trigger="every 15s"
			hx-target=".player-list"
			hx-swap="innerHTML"
		>
			<h2>Live Players ({totalPlayers})</h2>
			<ul class="team-list">
				{await Promise.all(
					Object.entries(playerList).map(async ([serverId, players]) => (
						<li class="team" id={serverId}>
							<h3>
								<a
									hx-get={`/component/page/server?serverId=${serverId}&path=/server/${serverId}`}
									hx-target=".main"
									hx-swap="innerHTML"
									hx-push-url={`/server/${serverId}`}
								>
									{DataStorage.serverInfo[serverId]?.name || "Unknown Server"}
								</a>
							</h3>
							<ul>
								{await Promise.all(
									players.map(async (player) => {
										const name = (await playerEntities[player.gameId]?.getName()) || "Unknown Player";
										return (
											<PlayerListItem
												gameId={player.gameId}
												phoneNumber={player.phoneNumber}
												name={name}
												team={player.team}
												color={TeamData[player.team as keyof typeof TeamData]?.color}
											/>
										);
									})
								)}
							</ul>
						</li>
					))
				)}
			</ul>
		</div>
	);
}
