import { AuthSession } from "../../../../database/entities/authSession.entity.js";
import Logo from "../../global/logo.js";
import ServerList from "../serverList.js";

export default async function LiveServers(props: { session: AuthSession; path: string }) {
	return (
		<div class="live-page">
			<div class="container">
				<Logo />
				<ServerList />
			</div>
		</div>
	);
}
