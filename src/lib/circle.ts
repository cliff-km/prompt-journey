import type { Vec2 } from "../types";

import { add } from "mathjs";

export function pointToPolar(pxy: Vec2, cxy: Vec2, radius: number) {
    const dx = pxy[0] - cxy[0];
    const dy = pxy[1] - cxy[1];
    const angle = 360 + Math.atan2(dy, dx) * 180 / Math.PI;
    const r = Math.sqrt(dx * dx + dy * dy);
    return [angle % 360, r / radius];
}

export function polarToPoint(cxy: Vec2, polar: Vec2, radius: number) {
    // Convert angle to radians
    const rad = (polar[0] % 360) * Math.PI / 180;

    const offset = [radius * polar[1] * Math.cos(rad), radius * polar[1] * Math.sin(rad)];
    return add(cxy, offset);
}

export function closestPointOnCircle(pxy: Vec2, cxy: Vec2, radius: number) {
    const dx = pxy[0] - cxy[0];
    const dy = pxy[1] - cxy[1];
    const distance = Math.sqrt(dx * dx + dy * dy);
    const ratio = radius / distance;
    const x = cxy[0] + dx * ratio;
    const y = cxy[1] + dy * ratio;
    return [x, y];
}

export function pointInCircle(pxy: Vec2, cxy: Vec2, radius: number) {
    const dx = pxy[0] - cxy[0];
    const dy = pxy[1] - cxy[1];
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < radius;
}

export function pointOnBoundary(cxy: Vec2, angle: number) {
    // Convert angle to radians
    const rad = ((angle % 360) * Math.PI) / 180;

    let x, y;

    const c = Math.cos(rad);
    const s = Math.sin(rad);

    x = (cxy[0] + 5) * -1.2 * c;
    y = (cxy[1] + 5) * -1.2 * s;

    // The point's position will be relative to the center, so we need to add the center's coordinates
    x -= cxy[0];
    y -= cxy[1];

    return [x, y];
}

export function boundedAngle(angle: number) {
    if (angle < 0) {
        return 360 + -1 * (Math.abs(angle) % 360);
    }
    if (angle > 360) {
        return (angle % 360);
    }
    return angle;
}