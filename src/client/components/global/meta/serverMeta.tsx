import DataStorage from "../../../../server/data/dataStorage.js";

export default async function ServerMeta(props: { path: string }) {
	const id = props.path.split("/")[2];

	if (!id) {
		return "";
	}

	const server = DataStorage.serverInfo[id];

	if (!server) {
		return "";
	}

	return (
		<>
			<title id="page-title" hx-swap-oob="true">
				JPXS | {server.name || "Unknown Server"}
			</title>
			<meta id="og-title" name="og:title" content={`JPXS - ${server.name || "Unknown Server"}`} />
			<meta
				id="og-description"
				name="og:description"
				content={`${server.playerCount}/${server.maxPlayers} players ${
					server.mode ? ` - ${server.mode.name}` : ""
				}\n${server.description || ""}`}
			/>
			<meta
				id="og-image"
				name="og:image"
				content={server.icon || "https://assets.jpxs.io/img/default/subrosa.png"}
			/>
		</>
	);
}
