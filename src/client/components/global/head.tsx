import { AuthSession } from "../../../database/entities/authSession.entity.js";
import ServerMeta from "./meta/serverMeta.js";

export default async function (props: { session: AuthSession; path: string }) {
	return (
		<head>
			<link rel="stylesheet" href="/static/index.css" />

			<link rel="preconnect" href="https://fonts.googleapis.com" />
			<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="true" />
			<link
				href="https://fonts.googleapis.com/css2?family=Roboto+Mono:ital,wght@0,100..700;1,100..700&display=swap"
				rel="stylesheet"
			/>

			<link rel="stylesheet" href="/_/global.css" />
			<link rel="stylesheet" href="/_/bootstrap.css" />

			<script src="https://unpkg.com/htmx.org@2.0.4"></script>
			<script
				src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js"
				integrity="sha384-ndDqU0Gzau9qJ1lfW4pNLlhNTkCfHzAVBReH9diLvGRem5+R9g2FzA8ZGN954O5Q"
				crossorigin="anonymous"
			></script>

			{(() => {
				const parts = props.path.split("/");
				switch (parts[1]) {
					case "server":
						return <ServerMeta path={props.path} />;
					case "":
					case "live":
					default:
						return (
							<>
								<title>JPXS | {parts[1].charAt(0).toUpperCase() + parts[1].slice(1)}</title>
								<meta id="og-title" name="og:title" content="JPXS - Sub Rosa Community" />
								<meta
									id="og-description"
									name="og:description"
									content="Community managed servers and tools"
								/>
								<meta id="og-image" name="og:image" content="/static/logo.png" />
							</>
						);
				}
			})()}
			<meta name="theme-color" content="#ff5722" />
		</head>
	);
}
