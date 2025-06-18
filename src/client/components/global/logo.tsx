export default function Logo() {
	return (
		<h2>
			<a
				href="/"
				hx-get="/component/page/home"
				hx-target=".main"
				hx-swap="innerHTML"
				hx-push-url="/"
				class="primary"
			>
				jpxs
			</a>
		</h2>
	);
}
