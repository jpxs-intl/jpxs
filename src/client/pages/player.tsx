import { AuthSession } from "../../database/entities/authSession.entity.js";
import { Finance } from "../../database/entities/finance.entity.js";
import { Server } from "../../database/entities/server.entity.js";
import Core from "../../server/core.js";
import PlayerManager from "../../server/data/players/playerManager.js";
import Util from "../../utils/index.js";
import { time } from "../../utils/time.js";
import Logo from "../components/global/logo.js";
import AvatarDisplay from "../components/player/avatar.js";

export default async function PlayerPage(props: { session: AuthSession; path: string; id?: string }) {
	const { session, path } = props;

	const id = props.id || path.split("/")[2];

	if (!id) {
		return <div class="error">Player ID is required.</div>;
	}

	const player = await PlayerManager.findPlayer(id, {
		populate: ["sessions", "avatarHistory.avatar"],
	});

	const lastSession = player?.sessions?.[0];

	if (!player) {
		return <div class="error">Player not found.</div>;
	}

	const lastAvatar = player.avatarHistory?.[0];

	const finances = await Core.services.finance.find(
		{ player },
		{ orderBy: { timestamp: "DESC" }, limit: 250 }
	);

	const serverFinances: Record<string, Finance[]> = {};
	for (const finance of finances) {
		if (!serverFinances[finance.server.id]) {
			serverFinances[finance.server.id] = [];
		}
		serverFinances[finance.server.id].push(finance);
	}

	const servers: Record<string, Server> = (
		await Core.services.server.find({
			id: {
				$in: Object.keys(serverFinances),
			},
		})
	).reduce((acc, server) => {
		acc[server.id] = server;
		return acc;
	}, {} as Record<string, Server>);

	return (
		<div class="player-page">
			<div class="player container">
				<div class="container player-header">
					<AvatarDisplay avatar={lastAvatar?.avatar} />
					<div class="player-info">
						<h2 class="player-id">
							<span class="player-name" safe>
								{(await player.getName()) || "Unknown Player"}
							</span>
							<span class="player-phoneNumber" safe>
								{Util.formatPhone(player.phoneNumber)}
							</span>

							{/* <div class="tooltip-content">
								<span class="player-info-tooltip-hint">Also known as:</span>
								<ul class="player-info-tooltip-list">
									{player.nameHistory.map((historyItem) => (
										<li class="player-info-tooltip-item" id={historyItem.id} safe>
											{historyItem.name}
										</li>
									))}
								</ul>
							</div> */}
						</h2>
					</div>
				</div>
				<div class="container player-session">
					{lastSession != undefined &&
						(lastSession.endedAt == null ? (
							<div class="player-session ongoing">
								<span class="session-status">Currently Online</span>
								<span class="session-server" safe>
									{await lastSession.server.getName()}
								</span>
								<span class="session-duration" safe>
									for {time(Date.now() - lastSession.startedAt.getTime()).toString(true)}
								</span>
							</div>
						) : (
							<div class="player-page-session">
								<span class="session-status">Last Online</span>
								{/* <span class="session-server" safe>
									{await lastSession.server.getName()}
								</span> */}
								<span class="session-duration" safe>
									{time(Date.now() - lastSession.endedAt.getTime()).toString(true)} ago
								</span>
							</div>
						))}
				</div>

				{finances.length > 0 && (
					<div class="container player-finances">
						<a
							class="nav-link dropdown-toggle"
							data-bs-toggle="dropdown"
							href="#"
							role="button"
							aria-haspopup="true"
							aria-expanded="false"
						>
							View Finances
						</a>
						<div class="dropdown-menu" role="tablist">
							{Object.entries(serverFinances).length === 0 ? (
								<div class="dropdown-item">No finances available</div>
							) : (
								await Promise.all(
									Object.entries(serverFinances).map(async ([serverId, serverFinances]) => {
										const server = servers[serverId];
										if (!server) return null;
										return (
											<a
												class="dropdown-item"
												href={`#${server.id}`}
												hx-get={`/component/player.finance?gameId=${player.gameId}&serverId=${serverId}&excludePackaged=true`}
												hx-target="#financeData"
												hx-swap="innerHTML"
											>
												{await server.getName()}
											</a>
										);
									})
								)
							)}
						</div>
						<div id="financeData">Select a server to view finances.</div>
					</div>
				)}
			</div>
		</div>
	);
}
