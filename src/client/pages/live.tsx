import { AuthSession } from "../../database/entities/authSession.entity.js";
import Breadcrumbs from "../components/global/breadcrumbs.js";
import { Redirect } from "../components/global/redirect.js";
import LivePlayers from "../components/live/subpages/livePlayer.js";
import LiveServers from "../components/live/subpages/liveServer.js";

export default async function LivePage(props: { session: AuthSession; path: string }) {
	const { session, path } = props;
	const subPath = path.split("/")[2];

	switch (subPath) {
		case "servers":
			return <LiveServers session={session} path={path} />;
		case "players":
			return <LivePlayers session={session} path={path} />;
		default:
			return <Redirect />;
	}
}
