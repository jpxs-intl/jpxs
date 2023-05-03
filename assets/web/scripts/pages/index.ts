import BaseComponent from "../components/base.component";
import Breadcrumbs from "../components/breadcrumbs.component";
import Container from "../components/container.component";
import Link from "../components/link.component";
import RootComponent from "../components/root.component";
import { MatchReturnSuccess } from "../pathParser";

export default function index(pathMatch: MatchReturnSuccess) {
  const root = new RootComponent();
   new Breadcrumbs(root);

   const container = new Container("buttons", root);

   container.addChild(
    new Link("servers", container, "/servers", "Servers")
   )
    

  
  root.render();

  console.log(root)
}
