import type { Vec2 } from "../types";
import { multiply } from "mathjs";


export function getDistance(p1: Vec2, p2: Vec2) {
    const dx = p1[0] - p2[0];
    const dy = p1[1] - p2[1];
    return Math.sqrt(dx * dx + dy * dy);
}

export function findBoxCenter(wh: Vec2) : Vec2 {
    return multiply(wh, 0.5) as Vec2;
}

export function getSVGInputLocation(e: TouchEvent | MouseEvent) : Vec2 {
    const svg = e.currentTarget as SVGSVGElement;

    if(!svg) throw new Error("No SVG element found");

    var pt = svg.createSVGPoint();

    if(e instanceof TouchEvent) {
        pt.x = e.touches[0].clientX;
        pt.y = e.touches[0].clientY;
    } else {
        pt.x = e.clientX;
        pt.y = e.clientY;
    }
    
    const domMatrix = svg.getScreenCTM();

    if(!domMatrix) throw new Error("No DOM Matrix found");

    const loc = pt.matrixTransform(domMatrix.inverse());
    return [loc.x, loc.y];
}