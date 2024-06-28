import express from "express";
import middleware from "./middleware.js";
import path from "path";

export default async function server(
  root = "dist/client",
  port = 3000,
  api:
    | {
        [key in string]: () => Promise<Record<string, any>>;
      }
    | string = {}
) {
  const app = express();

  app.use("/assets", express.static(path.resolve(root, "assets")));
  app.use(express.static(path.resolve("public")));

  app.get("*", await middleware(path.join(root, "src"), undefined, api));

  app.listen(port, () => {
    console.log("Njin running on port " + port);
  });
}
