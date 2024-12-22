import { Context } from "@oak/oak/context";
import { brightness as config } from "../config.ts";
import { expandGlob } from "@std/fs";
import { join } from "@std/path";

const brightnessDevice = (await Array.fromAsync(expandGlob(config.device)))[0]?.path;

export type BrightnessRequest = {
    dim: boolean;
};

export type BrightnessResponse = {
    brightness: number;
    minbrightness: number;
    maxbrightness: number;
    dimafter: number;
    dimbefore: number;
};

const decoder = new TextDecoder();
async function readBrightnessValue(name: "brightness" | "max_brightness"): Promise<number> {
    const valueBuffer = await Deno.readFile(join(brightnessDevice, name));
    return parseInt(decoder.decode(valueBuffer), 10);
}

async function writeBrightnessValue(name: "brightness" | "max_brightness", value: number) {
    await Deno.writeFile(join(brightnessDevice, name), new TextEncoder().encode(value.toString()));
}

export async function put(context: Context) {
    context.response.body = "{}";
    if (brightnessDevice === undefined) {
        return;
    }

    const { dim } = await context.request.body.json();
    let currentBrightness = await readBrightnessValue("brightness");
    const maxBrightness = await readBrightnessValue("max_brightness");
    let targetBrightness = dim ? config.minbrightness : config.maxbrightness;

    targetBrightness = Math.min(Math.max(targetBrightness, 0), maxBrightness);
    while (currentBrightness !== targetBrightness) {
        currentBrightness += Math.sign(targetBrightness - currentBrightness);
        await writeBrightnessValue("brightness", currentBrightness);
        await new Promise((resolve) => setTimeout(resolve, 10));
    }
}

export async function get(context: Context) {
    let currentValue = 0;
    if (brightnessDevice !== undefined) {
        currentValue = await readBrightnessValue("brightness");
    }

    context.response.body = {
        brightness: currentValue,
        ...config,
    };
}
