export default function Breadcrumbs(props: { path: string }) {
	return (
		<ol id="breadcrumbs" class="breadcrumb" hx-swap-oob="outerHTML">
			<li class="breadcrumb-item">
				<a href="/" class="breadcrumb-item">
					jpxs
				</a>
			</li>
			{(() => {
				if (!props.path) return null;
				const parts = props.path.split("/");
				const breadcrumbs = [];

				for (let i = 1; i < parts.length; i++) {
					const part = parts[i];
					if (part === "") continue;
					const href = "/" + parts.slice(1, i + 1).join("/");
					breadcrumbs.push(
						<li class={`breadcrumb-item ${i === parts.length - 1 ? "active" : ""}`}>
							<a
								// i WILL get this working with htmx eventually
								// but for now full page reloads :(
								href={href}
								// hx-get={href}
								// hx-push-url={href}
								// hx-target="body"
								// hx-swap="outerHTML"
								safe
							>
								{part}
							</a>
						</li>
					);
				}
				return breadcrumbs;
			})()}
		</ol>
	);
}
