import Breadcrumbs from "./breadcrumbs.js";

export default function Logo() {
	return (
		<h2 id="logo" hx-swap-oob="true">
			<a
				href="/"
				hx-get="/component/page/home?path=/"
				hx-target=".main"
				hx-swap="innerHTML"
				hx-push-url="/"
				class="primary"
			>
				jpxs
			</a>
			<span class="secondary" style={{ opacity: 0.5, paddingLeft: "1rem", fontSize: "0.4em" }}>
				beta
			</span>
		</h2>
	);
}
