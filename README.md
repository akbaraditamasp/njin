# Njin

Njin is a Vite plugin for building modern JavaScript frontends with server-side rendering using the Twig template engine.

## Get Started

### Installation

```bash
npm create vite@latest
npm i @akbaraditamasp/njin
```

### Vite Config

```javascript
import njin from "@akbaraditamasp/njin";

export default {
  plugins: [njin.plugin()],
  build: {
    outDir: "./dist/client",
    copyPublicDir: false,
  },
};
```

## Routing & Development

Routing in Njin is automatically handled based on the path of HTML files located in `./src/pages/**/*.html`.

Create a simple HTML file `./src/pages/index.html` to get started.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Hello</title>
  </head>
  <body>
    Hello World!
  </body>
</html>
```

Then, run the Vite dev server.

```bash
npm run dev
```

## Production

To run the server in production mode, build your project first with the following command.

```bash
npm run build
```

Next, you need to run the server with Njin CLI, which will start an Express app.

```bash
npx njin run ./dist/client
```

## Fetch Data

You can also fetch and pass data to the Twig template engine.

Create an `./src/api.js` file.

```javascript
export default {
  root: async () => {
    return {
      companyName: "Njin",
    };
  },
  "pages\\index": async () =>
    fetch("https://jsonplaceholder.typicode.com/posts/1").then((response) =>
      response.json()
    ),
};
```

Include it in your Vite Config.

```javascript
import njin from "@akbaraditamasp/njin";
import api from "./src/api";

export default {
  plugins: [njin.plugin({ api })],
  build: {
    outDir: "./dist/client",
    copyPublicDir: false,
  },
};
```

You can now access the passed data from Twig using keys **root** and **data**.

### Build Fetch Data for Production

Before running in production mode, you need to build SSR for the **api.js** file with the following command.

```bash
npx vite build --outDir dist/server --ssr src/api.js
```

Then, run the following command to start the server with fetch data.

```bash
npx njin run ./dist/client -a ./dist/server/api.js
```
