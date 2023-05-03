import NotFoundErrorComponent from "../components/404.component";
import BaseComponent from "../components/base.component";
import Breadcrumbs from "../components/breadcrumbs.component";
import RootComponent from "../components/root.component";
import { MatchReturnSuccess } from "../pathParser";

export default function ErrorPage404(
  pathMatch: MatchReturnSuccess,
  options?: {
    message?: string;
    backPath?: string;
    title?: string;
  }
) {
  const root = new RootComponent();
  
  new NotFoundErrorComponent(root, {
    message: options?.message ?? "Page Not Found",
    backPath: options?.backPath ?? "/",
  });

  document.head.title = options?.title ?? "jpxs | 404";

  root.render();

  console.log(root);
}
