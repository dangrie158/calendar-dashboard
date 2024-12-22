const request_cache = await caches.open("request-cache");
const DEFAULT_LIFETIME = 1000 * 60 * 15;

export default async function cachedFetch(
    url: string,
    options?: RequestInit & { cacheLifetime?: number }
): Promise<Response> {
    let response: Response | undefined = await request_cache.match(url);
    // check if the response is expired
    if (response) {
        const expires = new Date(response.headers.get("Expires")!);
        if (expires < new Date()) {
            response = undefined;
            request_cache.delete(url);
        }
    }

    if (response === undefined) {
        console.log(`Cache miss for ${url}, refetching`);
        response = await fetch(url, options);
        response = new Response(await response.text(), {
            headers: {
                ...response.headers,
                Expires: new Date(Date.now() + (options?.cacheLifetime ?? DEFAULT_LIFETIME)).toUTCString(),
            },
        });
        request_cache.put(url, response.clone());
    }
    return response;
}
