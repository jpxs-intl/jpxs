import Main from "..";
import Tooltip from "../components/tooltip";
import { Params } from "../pathParser";
import { DatabaseServerData } from "../socket/messages";
import Util from "../util";

let currentServer: string | undefined = undefined;
let data: DatabaseServerData | undefined = undefined;
let isFetching = false;

const hostIps = {
  "5.161.203.188": "JPXS",
  "5.161.75.249": "JPXS",
  "5.161.212.228": "JPXS",
  "135.148.137.113": "JPXS",
  "66.59.210.248": "AssBlaster"
} as {
  [key: string]: string
}

export default function ServerData(params: Params, ctx: CanvasRenderingContext2D) {
  Main.scrollMax = 1000;
  Main.title = "Server Data loading... ";

  if (currentServer !== params.id) {
    data = undefined;
    currentServer = params.id;
  }

  if (params.id) {
    if (!isFetching && !data && Main.socket.connected) {
      isFetching = true;
      console.log("Fetching server data");

      Main.socket.emit("server", params.id, (server) => {
        data = server;

        isFetching = false;
        console.log("Fetched server data");

        Main.scrollTarget = -300;
      });
    }
  }

  ctx.font = "20px " + Main.font;
  ctx.fillStyle = Main.colors.primary;
  ctx.textAlign = "left";

  if (!data) {
    ctx.fillText("Loading...", 10, 60);
    return;
  }

  Main.title = `${data.snapshots[data.snapshots.length - 1].name || "Loading..."} | ${data.snapshots.length} snapshots`;

  ctx.fillText(data.snapshots[data.snapshots.length - 1].name || "Loading...", 10, 60);

  ctx.font = "15px " + Main.font;
  ctx.fillText("Server ID: " + data.id, 10, 90);
  ctx.fillText(`Address: ${data.address}:${data.port}${hostIps.hasOwnProperty(data.address) ? ` | Hosted by ${hostIps[data.address]}` : ""}`, 10, 120);
  ctx.fillText("Identifier: " + data.identifier, 10, 150);


  // draw graphs

  // use scrollTarget as the start point of time mapping 0 -> 1000 to 0 -> snapshots.length

  const value = Main.scroll;

  if (value > -10) {
    Main.scrollTarget = -10;
  }

  const start = Math.floor((value / Main.scrollMax) * data.snapshots.length);
  const end = Math.floor(((value + Main.canvas.width) / Main.scrollMax) * data.snapshots.length);

  const snapshots = data.snapshots.slice(start, end);

  const graphWidth = window.innerWidth - 20;
  const graphHeight = 500;

  const graphX = 10;
  const graphY = Main.canvas.height - graphHeight - 10;

  const graphPadding = 10;

  const graphInnerWidth = graphWidth - graphPadding * 2;
  const graphInnerHeight = graphHeight - graphPadding * 2;

  const graphInnerX = graphX + graphPadding;
  const graphInnerY = graphY + graphPadding;

  const graphInnerWidthPerSnapshot = graphInnerWidth / snapshots.length;
  const graphInnerHeightPerPlayer = graphInnerHeight / Math.max(...snapshots.map((s) => s.players));


  // draw graph info

  ctx.fillStyle = Main.colors.primary;
  ctx.font = "15px " + Main.font;
  ctx.textAlign = "left";

  const startDate = new Date(snapshots[0].timestamp)
  const endDate = new Date(snapshots[snapshots.length - 1].timestamp)

  ctx.fillText(`Viewing from ${Util.formatDateAndTime(startDate)} to ${Util.formatDateAndTime(endDate)}`, 10, 200);
  

  ctx.strokeStyle = Main.colors.accent;
  ctx.lineWidth = 2;

  ctx.font = "10px " + Main.font;
  ctx.textAlign = "center";

  // draw max player count

  ctx.strokeStyle = Main.colors.muted;

  ctx.moveTo(graphInnerX, graphInnerY + graphInnerHeight);
  ctx.beginPath();
  for (let i = 0; i < snapshots.length; i++) {
    const snapshot = snapshots[i];

    const x = graphInnerX + graphInnerWidthPerSnapshot * i;
    const y = graphInnerY + graphInnerHeight - graphInnerHeightPerPlayer * snapshot.maxPlayers;

    ctx.lineTo(x, y);
  }
  ctx.stroke();

  // draw player count graph

  ctx.strokeStyle = Main.colors.accent;

  ctx.beginPath();
  for (let i = 0; i < snapshots.length; i++) {
    const snapshot = snapshots[i];

    const x = graphInnerX + graphInnerWidthPerSnapshot * i;
    const y = graphInnerY + graphInnerHeight - graphInnerHeightPerPlayer * snapshot.players;

    ctx.lineTo(x, y + 5);
  }
  ctx.stroke();

// if mouse is over graph, draw tooltip

  if (Main.mouse.x > graphX && Main.mouse.x < graphX + graphWidth) {

    const snapshot = snapshots[Math.floor((Main.mouse.x - graphX) / graphInnerWidthPerSnapshot)];

    Tooltip(
      {
        x: Util.bound(Main.mouse.x - 100, graphInnerX, graphInnerX + graphInnerWidth - 200)  ,
        y: graphInnerY + graphInnerHeight - graphInnerHeightPerPlayer * snapshot.players - 100,
        width: 200,
        height: 100,
      },
      (position) => {

        ctx.fillStyle = Main.colors.primary;
        ctx.fillText(snapshot.name || "Loading...", position.x + 10, position.y + 20);
        ctx.fillText(snapshot.players + "/" + snapshot.maxPlayers, position.x + 10, position.y + 40);
        ctx.fillText(Util.formatDateAndTime(new Date(snapshot.timestamp)), position.x + 10, position.y + 60);
      })


  }


}
