import type { Point } from "./types";

import { multiply } from "mathjs";

export function getTextBoxDimensions(text: string, textWidth: number) {
    const estimatedLines = Math.floor(text.length / 25) + 1;
    const height = estimatedLines * 20;
    return [textWidth, height];
}

export function findBoxCenterOffset(textDimensions: Point) {
    return multiply(textDimensions, 0.5)
}