import { NotFoundError } from "@mikro-orm/core";
import BaseComponent from "./components/base.component";
import RootComponent from "./components/root.component";
import index from "./pages/index";
import PathParser, { MatchReturnSuccess } from "./pathParser";
import ErrorPage404 from "./pages/404";

const paths = {
  "/": index,
  "/servers": "servers",
  "/servers/:id": "server",
  "/servers/:id/:tab": "server",
  "/players": "players",
  "/players/:id": "player",
  "/players/:id/:tab": "player",
} as {
  [key: string]: string | ((parsed: MatchReturnSuccess) => void);
};

export default class Main {
  public static app = document.getElementById("app")!;
  public static history: string[] = [];
  public static historyIndex = 0;

  public static init(): void {
    if (!this.app) {
      throw new Error("Could not find app element, dumbass");
    }

    document.addEventListener("DOMContentLoaded", () => {
      Main.navigate(window.location.pathname, true);
    });

    window.addEventListener("popstate", (ev) => {
      // handle back button
      this.historyIndex--;
    });
  }

  public static navigate(path: string, hidden = false) {
    console.log(`Navigating from ${window.location.pathname} to ${path}`);
    for (const [route, page] of Object.entries(paths)) {
      const parsed = PathParser.match(path, route);
      if (parsed.match) {
        if (!hidden) {
          window.history.pushState({}, "", path);
          this.history.push(path);
        }
        if (typeof page == "string") {
          this.renderPage(ErrorPage404, parsed, {
            backPath: "/",
            message: `The page "${page}" is planned, but not implimented yet!\nTry again later.`,
          });
        } else {
          this.app.innerHTML = "";
          page(parsed);
        }
      }
    }
  }

  public static renderPage<T>(
    page: (parsed: MatchReturnSuccess, options?: T) => void,
    pathMatch: MatchReturnSuccess,
    options?: T
  ) {
    this.app.innerHTML = "";
    page(pathMatch, options);
  }
}

Main.init();
