import type { EmbeddedConcepts, Embeddings, PointData, Vec2 } from "../types";
import * as clustering from "density-clustering";
import TSNE from "tsne-js";
import { getDistance } from "../lib/vector";
import { add, multiply } from "mathjs";
import Munkres from "munkres-js";

export function getHighestClusterAvailable(embedCount: number) {
    if (embedCount < 2) return 0;
    if (embedCount < 4) return 2;
    if (embedCount < 6) return 4;
    if (embedCount < 8) return 6;
    return 8;
}

export function getKMeansClusters(embeddings, k: number) {
    const kmeans = new clustering.KMEANS();
    const clusters = kmeans.run(embeddings, k);
    return clusters;
}

export function createDistanceMatrix(setA: Vec2[], setB: Vec2[]) {
    return setA.map((pointA) =>
        setB.map((pointB) => getDistance(pointA, pointB))
    );
}

export function getClusterAnchors(k: number) : Vec2[] {
    switch (k) {
        case 2:
            return [
                multiply(add([0, 0], [0, 1]), 0.5) as Vec2,
                multiply(add([1, 0], [1, 1]), 0.5) as Vec2,
            ];
        case 4:
            return [
                [0, 0],
                [0, 1],
                [1, 1],
                [1, 0],
            ];
        case 6:
            return [
                multiply(add([0, 0], [0, 1]), 0.5) as Vec2,
                multiply(add([1, 0], [1, 1]), 0.5) as Vec2,
                [0, 0],
                [0, 1],
                [1, 1],
                [1, 0],
            ];
        case 8:
            return [
                multiply(add([0, 0], [0, 1]), 0.5) as Vec2,
                multiply(add([1, 0], [1, 1]), 0.5) as Vec2,
                [0, 0],
                [0, 1],
                [1, 1],
                [1, 0],
                multiply(add([0, 0], [1, 0]), 0.5) as Vec2,
                multiply(add([0, 1], [1, 1]), 0.5) as Vec2,
            ];
        default:
            return [];
    }
}

export function pairPoints(setA: Vec2[], setB: Vec2[]) {
    if (setA.length !== setB.length) {
        throw new Error("Both sets should have the same number of points");
    }

    const distanceMatrix = createDistanceMatrix(setA, setB);

    const indexes: Vec2[] = Munkres(distanceMatrix);

    if (!indexes) {
        return null;
    }

    return indexes.map(([indexA, indexB]) => ({
        ids: [indexA, indexB],
        points: [setA[indexA], setB[indexB]],
    }));
}

export function get2DEmbeddings(embeddings: Embeddings) {
    let model = new TSNE({
        dim: 2,
        perplexity: 30.0,
        earlyExaggeration: 4.0,
        learningRate: 100.0,
        nIter: 5000,
        metric: "euclidean",
    });

    // inputData is a nested array which can be converted into an ndarray
    // alternatively, it can be an array of coordinates (second argument should be specified as 'sparse')

    const ids = Object.keys(embeddings);
    const data = Object.values(embeddings);

    model.init({
        data,
        type: "dense",
    });

    // `error`,  `iter`: final error and iteration number
    // note: computation-heavy action happens here
    let [error, iter] = model.run();

    // `outputScaled` is `output` scaled to a range of [-1, 1]
    let outputScaled = model.getOutputScaled();

    // adjust to [0, 1]
    let unitScaled = outputScaled.map(([x, y]) => [
        (x + 1) / 2,
        (y + 1) / 2,
    ]);

    let unitScaledById = ids.reduce((acc, id, idx) => {
        acc[id] = unitScaled[idx];
        return acc;
    }, {});

    return unitScaledById;
}