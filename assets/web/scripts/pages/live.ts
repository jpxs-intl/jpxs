import Main from "..";
import { Params } from "../pathParser";
import Button from "../components/button";
import { FullServerData } from "../socket/messages";

let servers: FullServerData[] = [];
let grabTimer: any;

const modes = {
  1: "Driving",
  2: "Race",
  3: "Round",
  4: "World",
  5: "Eliminator",
  6: "Co-op",
  7: "Versus",
} as const;

export default function Live(params: Params, ctx: CanvasRenderingContext2D) {
  Main.scrollMax = 0; // No scrolling
  Main.title = "Live";

  if (!grabTimer) {
    grabTimer = setInterval(() => {
      Main.socket.emit("liveservers", (s) => {
        servers = s.sort((a, b) => {
          return b.players - a.players;
        });
      });
    }, 1000);
  }

  ctx.fillStyle = Main.colors.primary;
  ctx.font = `20px ${Main.font}`;
  ctx.textAlign = "left";

  if (servers.length == 0) {
    ctx.fillText("Loading...", 20, 70);
  }

  if (Main.isDesktop) {

    Main.scrollMax = servers.length * 50 + 150 - Main.canvas.height + Main.scroll;
    console.log(Main.scrollMax, Main.scrollTarget);

    for (let i = 0; i < servers.length; i++) {
      const server = servers[i];

      // version and mod info

      ctx.fillStyle = `hsl(${server.version * 10}, 100%, 65%)`;

      ctx.fillText(
        server.masterServer == "vanilla"
          ? `${server.version}${server.build}`
          : `RC${server.version}${server.build}`,
        20,
        70 + i * 50 + Main.scroll
      );

      ctx.fillStyle = Main.colors.primary;

      ctx.fillText(server.name, 120, 70 + i * 50 + Main.scroll);
      ctx.fillText(server.players + "/" + server.maxPlayers, 500, 70 + i * 50 + Main.scroll);
      ctx.fillText(modes[server.gameType as keyof typeof modes], 600, 70 + i * 50 + Main.scroll);

      // buttons on the right

      Button(
        {
          x: Main.canvas.width - 100,
          y: 50 + i * 50 + Main.scroll,
          width: 80,
          height: 40,
        },
        "Info",
        `serverInfo${server.id}`,
        () => {
          Main.navigate(`/servers/${server.id}`);
        }
      );
    }
  } else {
    for (let i = 0; i < servers.length; i++) {
      const server = servers[i];

      ctx.fillText(server.name, 10, 70 + i * 100 + Main.scroll);


      // version and mod info

      ctx.fillStyle = `hsl(${server.version * 10}, 100%, 65%)`;

      ctx.fillText(
        server.masterServer == "vanilla"
          ? `${server.version}${server.build}`
          : `RC${server.version}${server.build}`,
        20,
        100 + i * 100 + Main.scroll
      );

      ctx.fillStyle = Main.colors.primary;

      ctx.fillText(server.players + "/" + server.maxPlayers, 80, 100 + i * 100 + Main.scroll);
      ctx.fillText(modes[server.gameType as keyof typeof modes], 160, 100 + i * 100 + Main.scroll);
      
      

    }
  }
}
