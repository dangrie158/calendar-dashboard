const request_cache = await caches.open("request-cache");
const DEFAULT_LIFETIME = 1000 * 60 * 15;
export default async function cachedFetch(
    url: string,
    options?: RequestInit & { cacheLifetime?: number }
): Promise<Response> {
    let response = await request_cache.match(url);
    if (!response) {
        response = await fetch(url, options);
        console.log(`Fetching ${url} from network`);
        response = new Response(await response.text(), {
            headers: {
                Expires: new Date(Date.now() + (options?.cacheLifetime ?? DEFAULT_LIFETIME)).toUTCString(),
            },
        });
        request_cache.put(url, response.clone());
    }
    return response;
}
