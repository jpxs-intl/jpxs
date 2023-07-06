import Main from "..";
import Button from "../components/button";
import { Params } from "../pathParser";

export default function Index(params: Params, ctx: CanvasRenderingContext2D) {
  Main.scrollMax = 0; // No scrolling
  Main.title = "Home";

  ctx.fillStyle = Main.colors.accent;

  ctx.font = `40px ${Main.font}`;
  ctx.textAlign = "left";

  ctx.fillText("jpxs", 20, 70);

  const width = ctx.measureText("JPXS").width;

  ctx.fillStyle = Main.colors.primary;
  ctx.fillText(".international", 20 + width, 70);

  if (window.location.hash && window.location.hash.startsWith("#linksuccess")) {
    const [_, phoneNumber, username, discordusername, discordId] = window.location.hash.split(":");

    alert(`Successfully linked ${username} (${phoneNumber}) to ${discordusername} (${discordId})`);
    window.location.hash = "";
  } 

  Button(
    {
      x: 20,
      y: 100,
      width: 200,
      height: 50,
    },
    "Live",
    "live",
    () => {
        Main.navigate("/live")
    }
  );

    Button(
    {
        x: 20,
        y: 160,
        width: 200,
        height: 50,
    },
    "Servers",
    "servers",
    () => {
        Main.navigate("/servers")
    })
}
