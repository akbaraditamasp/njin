import fs from "fs";
import path from "path";
import { createEnvironment, createFilesystemLoader } from "twing";
import { Connect, ViteDevServer } from "vite";

export default function middleware(
  root: string,
  vite?: ViteDevServer,
  apiSource:
    | {
        [key in string]: () => Promise<Record<string, any>>;
      }
    | string = {}
): Connect.NextHandleFunction {
  const loader = createFilesystemLoader(fs);
  const environment = createEnvironment(loader);
  loader.addPath(path.resolve(root), "src");

  return async (req, res) => {
    const api = (
      typeof apiSource === "string"
        ? (await import(`file:///${path.resolve(apiSource)}`)).default
        : apiSource
    ) as {
      [key in string]: () => Promise<Record<string, any>>;
    };
    const url = new URL(req.originalUrl!, "http://localhost");
    const paths = url.pathname.replace(/^\//, "").split("/");
    let template = "";
    let context: Record<string, any> = {};

    const resolved: {
      path: string;
      params: string[];
    }[] = [
      { path: path.join("pages", ...paths), params: [] },
      { path: path.join("pages", ...paths, "index"), params: [] },
    ];

    for (let index = 1; index <= paths.length; index++) {
      resolved.push({
        path: path.join(
          "pages",
          ...paths.slice(0, 0 - index),
          ...Array(index).fill("_")
        ),
        params: paths.slice(paths.length - index),
      });
    }

    for (const check of resolved) {
      if (fs.existsSync(path.resolve(root, check.path + ".html"))) {
        template = check.path;
        context = {
          ...context,
          params: check.params,
        };
        break;
      }
    }

    if (!template && !fs.existsSync(path.resolve(root, "pages\\404.html"))) {
      res.statusCode = 404;
      res.write("Not Found");

      return res.end();
    }

    if (api[template]) {
      context = {
        ...context,
        data: await api[template](),
      };
    }

    if (api["root"]) {
      context = {
        ...context,
        root: await api["root"](),
      };
    }

    const html = vite
      ? await vite.transformIndexHtml(
          req.originalUrl!,
          await environment.render(
            path.join("src", template ? template + ".html" : "pages\\404.html"),
            context
          )
        )
      : await environment.render(
          path.join("src", template ? template + ".html" : "pages\\404.html"),
          context
        );

    res.statusCode = 200;
    res.write(html);

    return res.end();
  };
}
