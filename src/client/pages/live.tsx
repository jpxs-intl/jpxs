import { AuthSession } from "../../database/entities/authSession.entity.js";
import ServerList from "../components/live/serverList.js";
import LiveServers from "../components/live/subpages/liveServer.js";

export default async function LivePage(props: { session: AuthSession; path: string }) {
	const { session, path } = props;
	const subPath = path.split("/")[2];

	switch (subPath) {
		case "servers":
			return <LiveServers session={session} path={path} />;
		case "players":
			// Handle player-specific logic here if needed
			return <div>Player-specific content is not implemented yet.</div>;
		default:
			return (
				<div class="live-page">
					<div class="container">
						<h2>Live</h2>
					</div>
				</div>
			);
	}
}
