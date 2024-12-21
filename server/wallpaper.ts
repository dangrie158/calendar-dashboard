import { Context } from "@oak/oak/context";
import { wallpaper } from "../config.ts";
import cachedFetch from "./util/cachedFetch.ts";
import { tsNamedTupleMember } from "../../../Library/Caches/deno/npm/registry.npmjs.org/@babel/types/7.26.0/lib/index-legacy.d.ts";
type Photo = {
    photoGuid: string;
    derivatives: {
        [size: string]: {
            fileSize: string;
            checksum: number;
            width: number;
            height: number;
        };
    };
    contributorLastName: string;
    contributorFirstName: string;
    contributorFullName: string;
    caption: string;
};
type WebStream = {
    userLastName: string;
    userFirstName: string;
    streamName: string;
    photos: Photo[];
};

type WebAssetUrls = {
    locations: { [location: string]: { scheme: string; hosts: string[] } };
    items: { [photoGuid: string]: { url_location: string; url_path: string } };
};

export type WallpaperResponse = {
    photoUrl: string;
    contributor: string;
    caption: string;
}[];

async function getIcloudAlbumImages(sharedUrl: URL): Promise<WallpaperResponse> {
    const sharedStreamBaseUrl = "https://p156-sharedstreams.icloud.com";
    const albumId = sharedUrl.hash.substring(1);
    const webstreamUrl = `${sharedStreamBaseUrl}/${albumId}/sharedstreams/webstream`;

    const webstreamResponse = await cachedFetch(webstreamUrl, {
        method: "POST",
        body: JSON.stringify({ streamCtag: null }),
        cacheLifetime: 1000 * 60 * 30,
    });
    const webstream: WebStream = await webstreamResponse.json();
    const photoGuids = webstream.photos.map((photo) => photo.photoGuid);

    const webassetsUrl = `${sharedStreamBaseUrl}/${albumId}/sharedstreams/webasseturls`;
    const webassetsResponse = await cachedFetch(webassetsUrl, {
        method: "POST",
        body: JSON.stringify({
            photoGuids,
        }),
        cacheLifetime: 1000 * 60 * 30,
    });
    const webasseturls: WebAssetUrls = await webassetsResponse.json();

    const getPhotoUrl = (photoGuid: Photo) => {
        const checksumOfLargestDerivative = Object.values(photoGuid.derivatives).toSorted(
            (a, b) => b.width * b.height - a.width * a.height
        )[0].checksum;
        const urlLocation = webasseturls.items[checksumOfLargestDerivative].url_location;
        const urlPath = webasseturls.items[checksumOfLargestDerivative].url_path;
        const location = webasseturls.locations[urlLocation];
        return `${location.scheme}://${location.hosts[0]}${urlPath}`;
    };

    return webstream.photos.map((photo) => {
        return {
            photoUrl: getPhotoUrl(photo),
            contributor: photo.contributorFullName,
            caption: photo.caption,
        };
    });
}

export async function get(context: Context) {
    const imageUrls = [];
    for (const album of wallpaper.icloud) {
        const sharedUrl = new URL(album);
        imageUrls.push(...(await getIcloudAlbumImages(sharedUrl)));
    }
    context.response.body = imageUrls;
}
