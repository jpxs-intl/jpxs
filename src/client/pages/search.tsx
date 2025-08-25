import { AuthSession } from "../../database/entities/authSession.entity.js";
import { Redirect } from "../components/global/redirect.js";
import SearchPlayers from "../components/search/subpages/players.js";

export default async function SearchPage(props: { session: AuthSession; path: string }) {
	const { session, path } = props;
	const subPath = path.split("/")[2];

	switch (subPath) {
		case "servers":
			return <Redirect />;
		case "players":
			return <SearchPlayers session={session} path={path} />;
		default:
			return <Redirect />;
	}
}
