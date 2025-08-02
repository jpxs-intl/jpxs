import { AuthSession } from "../../../database/entities/authSession.entity.js";
import Breadcrumbs from "./breadcrumbs.js";
import Logo from "./logo.js";

// component thats packaged with every component request

export default function Packaged(props: { session: AuthSession; path: string }) {
	return (
		<>
			<Logo />
			<Breadcrumbs path={props.path} />
		</>
	);
}
