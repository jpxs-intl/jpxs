export default class PathParser {
  public static match(path: string, route: string): MatchReturn {
    const pathParts = path.split("/");
    const routeParts = route.split("/");

    if (pathParts.length !== routeParts.length) {
      return {
        match: false,
      };
    }

    let params: Record<string, string> = {};

    for (let i = 0; i < pathParts.length; i++) {
      // wildcard

      if (routeParts[i] === "*") {
        continue;
      }

      // parameter

      if (routeParts[i].startsWith(":")) {
        const paramName = routeParts[i].slice(1);
        const paramValue = pathParts[i];

        params[paramName] = paramValue;
      }

      // optional

      if (routeParts[i].startsWith("?")) {
        continue;
      }

      // regex

      if (routeParts[i].startsWith("(") && routeParts[i].endsWith(")")) {
        const regex = new RegExp(routeParts[i].slice(1, -1));
        if (!regex.test(pathParts[i])) {
          return {
            match: false,
          };
        }
        continue;
      }

      // starts with

      if (routeParts[i].endsWith("*")) {
        const startsWith = routeParts[i].slice(0, -1);
        if (!pathParts[i].startsWith(startsWith)) {
          return {
            match: false,
          };
        }
        continue;
      }

      // ends with

      if (routeParts[i].startsWith("*")) {
        const endsWith = routeParts[i].slice(1);
        if (!pathParts[i].endsWith(endsWith)) {
          return {
            match: false,
          };
        }
        continue;
      }

      // normal

      if (pathParts[i] !== routeParts[i]) {
        return {
          match: false,
        };
      }
    }

    return {
      match: true,
      params,
    };
  }
}

export type MatchReturn =
  | MatchReturnSuccess
  | {
      match: false;
    };

export type MatchReturnSuccess = {
  match: true;
  params: Record<string, string>;
};
