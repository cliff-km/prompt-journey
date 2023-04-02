import type { Point } from "./types";

import { add } from "mathjs";

export function pointToPolar(pxy: Point, cxy: Point, radius: number) {
    const dx = pxy[0] - cxy[0];
    const dy = pxy[1] - cxy[1];
    const angle = 360 + Math.atan2(dy, dx) * 180 / Math.PI;
    const r = Math.sqrt(dx * dx + dy * dy);
    return [angle % 360, r / radius];
}

export function polarToPoint(cxy: Point, polar: Point, radius: number) {
    // Convert angle to radians
    const rad = (polar[0] % 360) * Math.PI / 180;

    const offset = [radius * polar[1] * Math.cos(rad), radius * polar[1] * Math.sin(rad)];
    return add(cxy, offset);
}

export function closestPointOnCircle(pxy: Point, cxy: Point, radius: number) {
    const dx = pxy[0] - cxy[0];
    const dy = pxy[1] - cxy[1];
    const distance = Math.sqrt(dx * dx + dy * dy);
    const ratio = radius / distance;
    const x = cxy[0] + dx * ratio;
    const y = cxy[1] + dy * ratio;
    return [x, y];
}

export function pointInCircle(pxy: Point, cxy: Point, radius: number) {
    const dx = pxy[0] - cxy[0];
    const dy = pxy[1] - cxy[1];
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < radius;
}