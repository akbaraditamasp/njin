import fg from "fast-glob";
import fs from "fs";
import path from "path";
import { createEnvironment, createFilesystemLoader } from "twing";
import { Plugin, normalizePath } from "vite";

export type NjinConfig = {
  input?: string[];
};

const plugin = (userConfig?: NjinConfig): Plugin[] => {
  const loader = createFilesystemLoader(fs);
  const environment = createEnvironment(loader);
  loader.addPath(path.resolve("src"));

  return [
    {
      name: "@njin/vite-plugin-core",
      apply: "serve",
      configureServer: (vite) => {
        return () => {
          vite.middlewares.use(async (req, res) => {
            const url = new URL(req.originalUrl!, "http://localhost");
            const paths = url.pathname.replace(/^\//, "").split("/");
            let template = "";
            let params: string[] = [];
            let context: Record<string, any>;

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
              if (fs.existsSync(path.resolve("src", check.path + ".html"))) {
                template = check.path;
                params = check.params;
                break;
              }
            }

            if (!template) {
              res.statusCode = 404;
              res.write("Not Found");

              return res.end();
            }

            const html = await vite.transformIndexHtml(
              req.originalUrl!,
              await environment.render(
                template ? template + ".html" : "pages\\404.html",
                {
                  ...(context! || {}),
                  params,
                }
              )
            );

            res.statusCode = 200;
            res.write(html);

            return res.end();
          });
        };
      },
      handleHotUpdate: ({ server, file }) => {
        if (file.endsWith(".html")) {
          server.ws.send({ type: "full-reload" });
        }
      },
    },
    {
      name: "@njin/vite-plugin-core:build",
      apply: "build",
      config: (config) => {
        return {
          ...config,
          build: {
            ...config.build,
            rollupOptions: {
              ...config.build?.rollupOptions,
              input: fg
                .sync(["./src/pages/**/*.html", ...(userConfig?.input || [])], {
                  cwd: config.root || process.cwd(),
                })
                .map((item) =>
                  normalizePath(
                    path.resolve(config.root || process.cwd(), item)
                  )
                ),
            },
          },
        };
      },
    },
  ];
};

export default plugin;
