import Main from "..";
import Util from "../util";
import BaseComponent from "./base.component";

export default class Breadcrumbs extends BaseComponent {

    constructor(parent: BaseComponent | null = null) {
        super("breadcrumbs", parent);
    }

    public render(): void {

        const path = window.location.pathname === "/" ? "" : window.location.pathname;

        const breadcrumbs = document.createElement("div");
        breadcrumbs.classList.add("breadcrumbs");

        const home = document.createElement("a");
        home.classList.add("breadcrumbs__home");
        home.innerText = "Home";
        breadcrumbs.appendChild(home);

        home.addEventListener("click", (event) => {
            event.preventDefault();
            Main.navigate("/");
        });

        const pathParts = path.split("/");
        pathParts.forEach((part, index) => {
            if (part === "") {
                return;
            }
            
            const crumb = document.createElement("a");
            crumb.classList.add("breadcrumbs__crumb");
            crumb.innerText = ` / ${Util.capitalizeFirstLetter(part)}`;
            breadcrumbs.appendChild(crumb);

            crumb.addEventListener("click", (event) => {
                event.preventDefault();
                Main.navigate(pathParts.slice(0, index + 1).join("/"));
            }
        )
        });

        this.element = breadcrumbs;
        this.parent?.element?.appendChild(this.element);
    }

}
