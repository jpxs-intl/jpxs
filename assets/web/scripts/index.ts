import PathParser, { MatchReturnSuccess, Params } from "./pathParser";
import ErrorPageNotFoundIndev from "./pages/404ErrorIndev";
import Index from "./pages";
import Util from "./util";
import Taskbar from "./components/taskbar";
import { AreaHandlerManager } from "./areaHandler";
import ErrorPageNotFound from "./pages/404Error";
import socketClient from "./socket/socket";
import Live from "./pages/live";
import ServerData from "./pages/serverData";

const paths = {
  "/": Index,
  "/live": Live,

  "/servers/:id/:tab": "server",
  "/servers/:id": ServerData,
  "/servers": "servers",

  "/players/:id/:tab": "player",
  "/players/:id": "player",
  "/players": "players",
} as {
  [key: string]: string | ((parsed: Params, ctx: CanvasRenderingContext2D) => void);
};

// freaky jank to fix a single frame of the wrong page being rendered

let render = false;

setTimeout(() => {
  render = true;
}, 10);

export default class Main {
  public static canvas = document.getElementById("canvas")! as HTMLCanvasElement;
  public static ctx = Main.canvas.getContext("2d")!;

  public static history: string[] = [];
  public static historyIndex = 0;

  public static currentPage: string | ((parsed: Params, ctx: CanvasRenderingContext2D) => void) = "";
  public static currentParams: Record<string, string> = {};
  public static title = "Home";

  public static scroll = 0;
  public static scrollTarget = 0;
  public static scrollMax = 0;
  public static scrollSpeed = 2;

  public static mouse = {
    x: 0,
    y: 0,
    down: false,
  };

  public static lastRender = 0;

  public static colors = {
    primary: "#ffffff",
    background: "#000000",
    background2: "#111111",

    accent: "#ff6600",
    muted: "#8f3900",
  };

  public static font = "Space Mono";

  public static socket = socketClient;

  public static fps = 0;

  public static platform: "mobile" | "desktop" = window.innerWidth < 800 ? "mobile" : "desktop";
  public static orientation: "portrait" | "landscape" =
    window.innerWidth < window.innerHeight ? "portrait" : "landscape";

  public static get isMobile() {
    return this.platform == "mobile";
  }

  public static get isDesktop() {
    return this.platform == "desktop";
  }

  public static get isPortrait() {
    return this.orientation == "portrait";
  }

  public static get isLandscape() {
    return this.orientation == "landscape";
  }

  set title(title: string) {
    document.head.title = title;
  }

  public static init(): void {
    if (!this.canvas) {
      throw new Error("Could not find canvas element, dumbass");
    }

    this.socket.connect();

    document.addEventListener("DOMContentLoaded", () => {
      Main.navigate(window.location.pathname, true);

      Main.canvas.width = window.innerWidth;
      Main.canvas.height = window.innerHeight;
    });

    window.addEventListener("resize", () => {
      Main.canvas.width = window.innerWidth;
      Main.canvas.height = window.innerHeight;
    });

    window.addEventListener("wheel", (ev) => {
      Main.scrollTarget = Main.scrollTarget -= ev.deltaY / 10;
      Main.scrollTarget = Util.bound(Main.scrollTarget, -Main.scrollMax, 0);
    });

    window.addEventListener("mousemove", (ev) => {
      Main.mouse.x = ev.x;
      Main.mouse.y = ev.y;

      AreaHandlerManager.instance.onMouseMove();
    });

    window.addEventListener("mousedown", (ev) => {
      Main.mouse.down = true;

      AreaHandlerManager.instance.onMouseClick();
    });

    window.addEventListener("popstate", (ev) => {
      // handle back button
      this.historyIndex--;
      console.log(this.historyIndex, this.history);
      Main.navigate(window.location.pathname, true);

      ev.preventDefault();
    });

    this.render();
  }

  public static render() {
    Main.ctx.clearRect(0, 0, Main.canvas.width, Main.canvas.height);

    if (!render) {
      requestAnimationFrame(Main.render);
      return;
    }

    // handle scrolling

    const delta = Date.now() - Main.lastRender;
    Main.lastRender = Date.now();
    Main.scroll += ((delta * (Main.scrollTarget - Main.scroll)) / 100) * Main.scrollSpeed;

    Main.fps = Math.round(1000 / delta);

    if (typeof Main.currentPage == "string") {
      ErrorPageNotFoundIndev({}, Main.ctx);
    } else {
      Main.ctx.save();
      Main.currentPage(Main.currentParams, Main.ctx);
      Main.ctx.restore();
    }

    // handle taskbar
    Taskbar();

    requestAnimationFrame(Main.render);
  }

  public static navigate(path: string, hidden = false) {
    console.log(`Navigating from ${window.location.pathname} to ${path}`);

    let found = false;

    for (const [route, page] of Object.entries(paths)) {
      const parsed = PathParser.match(path, route);
      if (parsed.match) {
        found = true;
        if (!hidden) {
          window.history.pushState({}, "", path);
          this.history.push(path);
          this.historyIndex++;
        }

        this.currentPage = page;
        this.currentParams = parsed.params;

        AreaHandlerManager.instance.unregisterAll();

        break;
      }
    }

    if (!found) {
      this.currentPage = ErrorPageNotFound;
      this.currentParams = {};
    }
  }

  public static goBack() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.navigate(this.history[this.historyIndex]);
    } else {
      this.navigate("/");
    }
  }
}

Main.init();
