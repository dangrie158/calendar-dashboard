import { Application } from "jsr:@oak/oak/application";
import { Router } from "jsr:@oak/oak/router";

import routeStaticFilesFrom from "./util/routeStaticFilesFrom.ts";
import * as events from "./events.ts";
import * as weather from "./weather.ts";

export const app = new Application();
const router = new Router();

app.use((ctx, next) => {
    ctx.response.headers.set("Access-Control-Allow-Origin", "*");
    return next();
});

app.use(router.routes());
app.use(routeStaticFilesFrom([`${Deno.cwd()}/client/dist`, `${Deno.cwd()}/client/public`]));

router.get("/events", events.get);
router.get("/weather", weather.get);

if (import.meta.main) {
    console.log("Server listening on port http://localhost:8000");
    await app.listen({ port: 8000 });
}
