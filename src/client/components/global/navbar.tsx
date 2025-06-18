import { AuthSession } from "../../../database/entities/authSession.entity.js";
import Breadcrumbs from "./breadcrumbs.js";

export default async function Navbar(props: { session: AuthSession; path: string }) {
	return (
		<nav class="navbar">
			<div class="navbar-container">
				{/* <Breadcrumbs path={props.path} /> */}
				<a href="/" class="breadcrumbs-item">
					jpxs
				</a>
			</div>

			<div class="navbar-container"></div>
		</nav>
	);
}
