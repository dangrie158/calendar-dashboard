import { Application } from "jsr:@oak/oak/application";
import { Router } from "jsr:@oak/oak/router";

import routeStaticFilesFrom from "./util/routeStaticFilesFrom.ts";
import * as events from "./events.ts";
import * as weather from "./weather.ts";
import * as wallpaper from "./wallpaper.ts";
import * as brightness from "./brightness.ts";

export const app = new Application();
const router = new Router();

app.use((ctx, next) => {
    // log all requests
    const methodColor =
        {
            GET: "#00f",
            POST: "#0a0",
            PUT: "#a0a",
            DELETE: "#f00",
        }[ctx.request.method as string] ?? "#888";

    console.log(
        `%c${ctx.request.method.padEnd(10)} %c${ctx.request.url.href}`,
        `color: ${methodColor}`,
        `text-decoration: underline`
    );
    return next();
});

if (Deno.env.get("DEBUG") === "true") {
    app.use((ctx, next) => {
        // allow CORS
        ctx.response.headers.set("Access-Control-Allow-Origin", "*");
        ctx.response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
        if (ctx.request.method === "OPTIONS") {
            ctx.response.body = "";
            ctx.response.status = 200;
            return;
        }
        return next();
    });
}

app.use(router.routes());
app.use(routeStaticFilesFrom([`${Deno.cwd()}/client/dist`, `${Deno.cwd()}/client/public`]));

router.get("/events", events.get);
router.get("/weather", weather.get);
router.get("/wallpaper", wallpaper.get);
router.put("/brightness", brightness.put);
router.get("/brightness", brightness.get);

if (import.meta.main) {
    console.log("Server listening on port http://localhost:8000");
    await app.listen({ port: 8000 });
}
