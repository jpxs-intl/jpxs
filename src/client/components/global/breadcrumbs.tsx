export default async function Breadcrumbs(props: { path: string }) {
	return (
		<nav class="breadcrumbs">
			<a href="/" class="breadcrumbs-item">
				jpxs
			</a>
			<div class="separator">/</div>
			<span safe>
				{(() => {
					const parts = props.path.split("/");
					const breadcrumbs = [];

					for (let i = 1; i < parts.length; i++) {
						const part = parts[i];
						if (part === "") continue;
						const href = "/" + parts.slice(1, i + 1).join("/");
						breadcrumbs.push(
							<a
								class="breadcrumbs-item"
								hx-get={href}
								hx-push-url={href}
								hx-target="body"
								hx-swap="innerHTML"
								safe
							>
								{` ${part}`}
							</a>
						);
						if (i < parts.length - 1) {
							breadcrumbs.push(<div class="separator">/</div>);
						}
					}
					return breadcrumbs;
				})()}
			</span>
		</nav>
	);
}
