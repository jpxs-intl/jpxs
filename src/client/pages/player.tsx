import { AuthSession } from "../../database/entities/authSession.entity.js";
import PlayerManager from "../../server/data/players/playerManager.js";
import Util from "../../utils/index.js";
import { time } from "../../utils/time.js";
import Logo from "../components/global/logo.js";
import Session from "../components/player/session.js";

export default async function PlayerPage(props: { session: AuthSession; path: string; id?: string }) {
	const { session, path } = props;

	const id = props.id || path.split("/")[2];

	if (!id) {
		return <div class="error">Player ID is required.</div>;
	}

	const player = await PlayerManager.findPlayer(id, {
		populate: ["sessions", "avatarHistory", "avatarHistory.avatar"],
		orderBy: {
			sessions: {
				startedAt: "DESC",
			},
		},
	});

	const lastSession = player?.sessions?.[0];

	if (!player) {
		return <div class="error">Player not found.</div>;
	}

	const lastAvatar = player.avatarHistory?.[0];

	return (
		<div class="player-page">
			<div class="player-container">
				<Logo />
				<div class="player-header">
					{lastAvatar ? (
						<iframe
							src={lastAvatar.avatar.url({ body: false, embed: true, antiAliasing: true })}
							class="player-avatar"
							// @ts-ignore
							allowTransparency="true"
							background="transparent"
							loading="lazy"
						/>
					) : (
						<div class="player-avatar-placeholder">No Avatar</div>
					)}
					<div class="player-info">
						<h2 class="player-id">
							<span class="player-name" safe>
								{(await player.getName()) || "Unknown Player"}
							</span>
							<span class="player-phoneNumber" safe>
								{Util.formatPhone(player.phoneNumber)}
							</span>

							<div class="tooltip-content">
								<span class="player-info-tooltip-hint">Also known as:</span>
								<ul class="player-info-tooltip-list">
									{player.nameHistory.map((historyItem) => (
										<li class="player-info-tooltip-item" id={historyItem.id} safe>
											{historyItem.name}
										</li>
									))}
								</ul>
							</div>
						</h2>
					</div>
				</div>
				<div class="player-session">
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
			</div>
		</div>
	);
}
