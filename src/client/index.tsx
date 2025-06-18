import { AuthSession } from "../database/entities/authSession.entity.js";
import Head from "./components/global/head.js";
import Navbar from "./components/global/navbar.js";
import HomePage from "./pages/home.js";
import LivePage from "./pages/live.js";
import PlayerPage from "./pages/player.js";
import ServerPage from "./pages/server.js";

export default async function Index(props: { session: AuthSession; path: string }) {
	return (
		<>
			{"<!DOCTYPE html>"}
			<html lang="en">
				<Head session={props.session} path={props.path} />
				<body>
					{/* <Navbar session={props.session} path={props.path} /> */}
					<main class="main">
						{
							(async () => {
								const parts = props.path.split("/");
								switch (parts[1]) {
									case "live":
										return <LivePage session={props.session} path={props.path} />;
									case "server":
										return <ServerPage session={props.session} path={props.path} />;
									case "player":
										return <PlayerPage session={props.session} path={props.path} />;
									default:
										return <HomePage session={props.session} path={props.path} />;
								}
							})() as Promise<"safe">
						}
					</main>
				</body>
			</html>
		</>
	);
}
