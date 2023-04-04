import type { Point } from "./types";
import { multiply } from "mathjs";


export function getDistance(p1, p2) {
    const dx = p1[0] - p2[0];
    const dy = p1[1] - p2[1];
    return Math.sqrt(dx * dx + dy * dy);
}

export function findBoxCenter(wh: Point) {
    return multiply(wh, 0.5)
}