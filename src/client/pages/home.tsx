import { AuthSession } from "../../database/entities/authSession.entity.js";
import { AuthType } from "../../database/entities/userAuth.entity.js";
import Breadcrumbs from "../components/global/breadcrumbs.js";
import Logo from "../components/global/logo.js";

export default async function HomePage(props: { session: AuthSession; path: string }) {
	const steamId = props.session?.user && (await props.session.user.getAuth(AuthType.Steam))?.platformId;
	return (
		<div class="home-page">
			<div class="container">
				<div class="row">
					<div class="col">
						<h3 class="home-title">Free Weekend</h3>
						<ul class="home-subnav">
							<li>
								<a href="https://discord.gg/subrosa" class="home-link">
									Discord
									<p class="description">
										Join our Discord server to get the latest updates and interact with the community.
									</p>
								</a>
							</li>
							<li>
								<a
									href="/launcher"
									hx-get="/component/page/launcher"
									hx-target=".main"
									hx-swap="innerHTML"
									hx-push-url="/launcher"
									class="home-link"
								>
									Download Launcher
									<p class="description">
										Download the JPXS Launcher to automatically install and update Sub Rosa.
									</p>
								</a>
							</li>
						</ul>
					</div>
					<div class="col">
						<h3 class="home-title">Servers</h3>
						<ul class="home-subnav">
							<li>
								<a
									href="/live/servers"
									hx-get="/component/live.subpages.liveServer?path=/live/servers"
									hx-target=".main"
									hx-swap="innerHTML"
									hx-push-url="/live/servers"
									class="home-link"
								>
									Live Servers
									<p class="description">See all live servers and their current status.</p>
								</a>
							</li>
							{/* <li>
								<a class="home-link disabled">
									Historical Server Data
									<p class="description">(Comming Soon) View historical data for servers.</p>
								</a>
							</li>
							<li>
								<a class="home-link disabled">
									Server Management
									<p class="description">(Comming Soon) Manage your servers.</p>
								</a>
							</li> */}
						</ul>
					</div>
					<div class="col">
						<h3 class="home-title">Players</h3>
						<ul class="home-subnav">
							<li>
								<a
									href="/live/players"
									hx-get="/component/live.subpages.livePlayer?path=/live/players"
									hx-target=".main"
									hx-swap="innerHTML"
									hx-push-url="/live/players"
									class="home-link"
								>
									Player List
									<p class="description">View all online players and their current status.</p>
								</a>
							</li>
							<li>
								<a
									href="/search/players"
									hx-get="/component/page/search?path=/search/players"
									hx-target=".main"
									hx-swap="innerHTML"
									hx-push-url="/search/players"
									class="home-link"
								>
									Player Search
									<p class="description">Search for players by name or other criteria.</p>
								</a>
							</li>
						</ul>
					</div>
					<div class="col">
						<h3 class="home-title">Account</h3>
						<ul class="home-subnav">
							{props.session?.user ? (
								<>
									<li>
										<a class="home-link">
											Welcome back!
											<p class="description" safe>
												Logged in as {props.session.user.displayName}
											</p>
										</a>
									</li>
									<li>
										<a
											href="/account"
											hx-get="/component/page/account?path=/account"
											hx-target=".main"
											hx-swap="innerHTML"
											hx-push-url="/account"
											class="home-link"
										>
											Account Settings
											<p class="description">Manage your account settings.</p>
										</a>
									</li>
									<li>
										<a
											href={`/player/${steamId}`}
											hx-get={`/component/page/player?id=${steamId}&path=/player/${steamId}`}
											hx-target=".main"
											hx-swap="innerHTML"
											hx-push-url={`/player/${steamId}`}
											class="home-link"
										>
											Profile
											<p class="description">View your profile.</p>
										</a>
									</li>
									<li>
										<a class="home-link" href="/auth/logout">
											Logout
											<p class="description">Log out from your account.</p>
										</a>
									</li>
								</>
							) : (
								<>
									<li>
										<a class="home-link" href="/auth/steam">
											Login with Steam
											<p class="description">Log in to your account using Steam.</p>
										</a>
									</li>
									{/* 
									<li>
										<a class="home-link" href="/auth/discord">
											Login with Discord
											<p class="description">
												Login to your account using Discord. (requires a linked account)
											</p>
										</a>
									</li> */}
								</>
							)}
						</ul>
					</div>
				</div>
			</div>
			<div class="footer">
				<p class="footer-text">
					&copy; {new Date().getFullYear()} <span class="primary">JPXS</span>. All rights reserved.
					<br />
					<span class="primary">JPXS</span> is not affiliated with Sub Rosa, Devolver Digital, or Cryptic Sea.
				</p>
			</div>
		</div>
	);
}
