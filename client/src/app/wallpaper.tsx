import React from "react";
import "./wallpaper.css";
import useSWR from "swr";
import { WallpaperResponse } from "../../../server/wallpaper.ts";
import { fetcher } from "../backend.tsx";

function randomAnimation() {
    const seed = Math.random();
    let animation = {};
    if (seed < 0.66) {
        const verticalTarget = Math.random() < 0.5 ? "100%" : "0%";
        const horizontalTarget = Math.random() < 0.5 ? "100%" : "0%";
        animation = { backgroundPosition: `${horizontalTarget} ${verticalTarget}` };
    }
    if (seed > 0.33) {
        const targetScale = 1 + Math.random() * 0.3;
        animation = { ...animation, scale: `${targetScale}` };
    }
    return animation;
}

export default function Wallpaper() {
    const matte1 = React.useRef<HTMLDivElement>(null);
    const matte2 = React.useRef<HTMLDivElement>(null);

    const { data: images } = useSWR<WallpaperResponse>("wallpaper", fetcher, {
        refreshInterval: 1000 * 60 * 15,
        keepPreviousData: true,
    });

    React.useEffect(() => {
        if (images === undefined) {
            return;
        }

        let animationsRunning = true;
        let front: HTMLDivElement = matte1.current!;
        let back: HTMLDivElement = matte2.current!;
        const startAnimation = async () => {
            const nextImage = images[Math.floor(Math.random() * images.length)];
            back.style.backgroundImage = `url(${nextImage.photoUrl})`;
            const animation = randomAnimation();
            await front.animate(animation, { easing: "ease-in-out", duration: 20000, fill: "both" }).finished;
            await Promise.all([
                front.animate([{ opacity: 0 }], { duration: 2000, fill: "both" }).finished,
                back.animate({ opacity: 1 }, { duration: 2000, fill: "both" }).finished,
            ]);
            back.style.zIndex = "-1";
            front.style.zIndex = "-2";
            [front, back] = [back, front];
            if (animationsRunning) {
                startAnimation();
            }
        };
        startAnimation();
        return () => {
            animationsRunning = false;
        };
    }, [images]);

    return (
        <>
            <div ref={matte1} className="wallpaper" style={{ zIndex: -1 }} />
            <div ref={matte2} className="wallpaper" style={{ zIndex: -2 }} />
        </>
    );
}
