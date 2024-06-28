import fg from "fast-glob";
import path from "path";
import { Plugin, normalizePath } from "vite";
import server from "./middleware.js";

export type NjinConfig = {
  input?: string[];
  api?: {
    [key in string]: () => Promise<Record<string, any>>;
  };
};

const plugin = (userConfig?: NjinConfig): Plugin[] => {
  return [
    {
      name: "@njin/vite-plugin-core",
      apply: "serve",
      configureServer: (vite) => {
        return () => {
          vite.middlewares.use(server("src", vite, userConfig?.api));
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
