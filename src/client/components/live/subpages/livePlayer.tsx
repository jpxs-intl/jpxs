import { AuthSession } from "../../../../database/entities/authSession.entity.js";
import Breadcrumbs from "../../global/breadcrumbs.js";
import Logo from "../../global/logo.js";
import PlayerList from "../playerList.js";
import ServerList from "../serverList.js";

export default async function LivePlayers(props: { session: AuthSession; path: string }) {
	return (
		<div class="live-page">
			<div class="container">
				<title id="page-title" hx-swap-oob="true">
					JPXS | Live Players
				</title>
				<PlayerList />
			</div>
		</div>
	);
}
