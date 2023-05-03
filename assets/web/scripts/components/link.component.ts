import Main from "..";
import BaseComponent from "./base.component";

export default class Link extends BaseComponent {
    constructor(public name: string, public parent: any, public href: string, public text: string) {
        super(name, parent);
        this.href = href;
        this.text = text;
        this.element = document.createElement("a");
        this.element.innerText = this.text;
        this.element.classList.add("link");

        this.element.addEventListener("click", (event) => {
            Main.navigate(this.href);
        });
    }
}