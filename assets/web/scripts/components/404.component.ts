import Main from "..";
import BaseComponent from "./base.component";

export default class NotFoundErrorComponent<Parent> extends BaseComponent {

    constructor(parent: Parent | null = null, private options?: {
        message?: string
        backPath?: string
        backText?: string
    }) {
        super("404", parent);
    }

    public render(): void {
        const notFoundError = document.createElement("div");
        notFoundError.classList.add("404");
        notFoundError.innerHTML = `
            <div class="404__container">
                <h1 class="404__title">404</h1>
                <p class="404__message">${this.options?.message ?? "Page Not Found"}</p>
                <a class="404__link" id="link">${this.options?.backText ?? "Go back"}</a>
            </div>
        `;

        notFoundError.getElementsByClassName("404__link")[0].addEventListener("click", (event) => {
            event.preventDefault();
            Main.navigate(this.options?.backPath ?? "/");
        });

        this.element = notFoundError;
        this.parent?.element?.appendChild(this.element);
    }


}