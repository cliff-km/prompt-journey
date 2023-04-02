import { b as get_store_value, c as create_ssr_component, d as add_attribute, f as add_styles, e as escape, v as validate_component, h as each, a as subscribe } from "../../chunks/index2.js";
import { d as derived, w as writable } from "../../chunks/index.js";
import { add, multiply, subtract } from "mathjs";
import debounce from "lodash/debounce.js";
import { orderBy } from "lodash";
function parsePrompts(input) {
  const promptWeightPairs = [];
  const regex = /((?:[^:]+|:(?!:))+)(?:::(\d+(?:\.\d+)?))?(?=\s|$)/g;
  let match;
  while ((match = regex.exec(input)) !== null) {
    const prompt = match[1].trim();
    const weight = match[2] ? parseFloat(match[2]) : 1;
    if (prompt) {
      promptWeightPairs.push({ prompt, weight });
    }
  }
  return promptWeightPairs;
}
function storablePromptConfigs() {
  const store = writable({});
  const { subscribe: subscribe2, set, update } = store;
  const isBrowser = typeof window !== "undefined";
  set(isBrowser && Object.keys(localStorage).reduce((acc, key) => {
    if (key.startsWith("prompt")) {
      const id = key.split("_")[1];
      acc[id] = JSON.parse(localStorage[key]);
    }
    return acc;
  }, {}) || {});
  return {
    subscribe: subscribe2,
    updatePrompt: (id, p) => {
      console.log("addPrompt", id, p);
      const currentStore = get_store_value(store);
      const currentDoc = currentStore[id] || {};
      const updatedDoc = { ...currentDoc, ...p };
      isBrowser && (localStorage[`prompt_${id}`] = JSON.stringify(updatedDoc));
      const updatedStore = { ...currentStore, [id]: updatedDoc };
      console.log("updatePrompt", id, updatedStore);
      set(updatedStore);
    },
    getPrompt: (id) => {
      const currentStore = get_store_value(store);
      console.log("getPrompt", id, currentStore);
      return currentStore[id];
    },
    deletePrompt: (id) => {
      isBrowser && delete localStorage[`prompt_${id}`];
      const newStore = { ...get_store_value(store) };
      delete newStore[id];
      console.log("deletePrompt", id, newStore);
      set(newStore);
    }
  };
}
const promptStore = storablePromptConfigs();
const promptList = derived(promptStore, ($promptStore) => Object.entries(get_store_value(promptStore)));
const Circle = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { xy = [500, 500] } = $$props;
  let { radius = 400 } = $$props;
  let { stroke = 2 } = $$props;
  let { color = "rgba(46,67,101, 0.4)" } = $$props;
  if ($$props.xy === void 0 && $$bindings.xy && xy !== void 0)
    $$bindings.xy(xy);
  if ($$props.radius === void 0 && $$bindings.radius && radius !== void 0)
    $$bindings.radius(radius);
  if ($$props.stroke === void 0 && $$bindings.stroke && stroke !== void 0)
    $$bindings.stroke(stroke);
  if ($$props.color === void 0 && $$bindings.color && color !== void 0)
    $$bindings.color(color);
  return `<circle${add_attribute("cx", xy[0], 0)}${add_attribute("cy", xy[1], 0)}${add_attribute("r", radius, 0)}${add_attribute("stroke", color, 0)}${add_attribute("stroke-width", stroke, 0)}${add_styles({ "fill": `rgba(0,0,0,0)` })}></circle>`;
});
const Point = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { xy = [100, 100] } = $$props;
  let { radius = 5 } = $$props;
  let { color = "black" } = $$props;
  let { hoverColor = "white" } = $$props;
  let { handleMouseDown = (e) => {
  } } = $$props;
  let c = color;
  if ($$props.xy === void 0 && $$bindings.xy && xy !== void 0)
    $$bindings.xy(xy);
  if ($$props.radius === void 0 && $$bindings.radius && radius !== void 0)
    $$bindings.radius(radius);
  if ($$props.color === void 0 && $$bindings.color && color !== void 0)
    $$bindings.color(color);
  if ($$props.hoverColor === void 0 && $$bindings.hoverColor && hoverColor !== void 0)
    $$bindings.hoverColor(hoverColor);
  if ($$props.handleMouseDown === void 0 && $$bindings.handleMouseDown && handleMouseDown !== void 0)
    $$bindings.handleMouseDown(handleMouseDown);
  return `<circle${add_attribute("cx", xy[0], 0)}${add_attribute("cy", xy[1], 0)}${add_attribute("r", radius, 0)}${add_styles({ "fill": c })}></circle>`;
});
const Line = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { p1 = [100, 100] } = $$props;
  let { p2 = [100, 100] } = $$props;
  let { stroke = 2 } = $$props;
  let { color = "rgba(46,67,101, 0.4)" } = $$props;
  if ($$props.p1 === void 0 && $$bindings.p1 && p1 !== void 0)
    $$bindings.p1(p1);
  if ($$props.p2 === void 0 && $$bindings.p2 && p2 !== void 0)
    $$bindings.p2(p2);
  if ($$props.stroke === void 0 && $$bindings.stroke && stroke !== void 0)
    $$bindings.stroke(stroke);
  if ($$props.color === void 0 && $$bindings.color && color !== void 0)
    $$bindings.color(color);
  return `<line${add_attribute("x1", p1[0], 0)}${add_attribute("y1", p1[1], 0)}${add_attribute("x2", p2[0], 0)}${add_attribute("y2", p2[1], 0)}${add_attribute("stroke", color, 0)} stroke-dasharray="10,10"${add_attribute("stroke-width", stroke, 0)}></line>`;
});
const PromptText_svelte_svelte_type_style_lang = "";
const css$2 = {
  code: ".small.svelte-1aqrv0r{font:italic 13px sans-serif}",
  map: null
};
const PromptText = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { xy = [100, 100] } = $$props;
  let { wh = [100, 100] } = $$props;
  let { text = "" } = $$props;
  let { color = "rgba(96,117,151, 1)" } = $$props;
  if ($$props.xy === void 0 && $$bindings.xy && xy !== void 0)
    $$bindings.xy(xy);
  if ($$props.wh === void 0 && $$bindings.wh && wh !== void 0)
    $$bindings.wh(wh);
  if ($$props.text === void 0 && $$bindings.text && text !== void 0)
    $$bindings.text(text);
  if ($$props.color === void 0 && $$bindings.color && color !== void 0)
    $$bindings.color(color);
  $$result.css.add(css$2);
  return `<foreignObject${add_attribute("x", xy[0], 0)}${add_attribute("y", xy[1], 0)}${add_attribute("width", wh[0], 0)}${add_attribute("height", wh[1], 0)}><p style="${"color:" + escape(color, true) + "; user-select: none; margin: 0; pointer-events:none;"}" class="small svelte-1aqrv0r">${escape(text)}</p></foreignObject>`;
});
const WeightMarker_svelte_svelte_type_style_lang = "";
const css$1 = {
  code: ".heavy.svelte-6if1p2{font:bold 20px sans-serif}",
  map: null
};
const WeightMarker = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { xy = [100, 100] } = $$props;
  let { radius = 25 } = $$props;
  let { textColor = "rgba(96,117,151, 1)" } = $$props;
  let { bgColor = "black" } = $$props;
  let { weight = "" } = $$props;
  if ($$props.xy === void 0 && $$bindings.xy && xy !== void 0)
    $$bindings.xy(xy);
  if ($$props.radius === void 0 && $$bindings.radius && radius !== void 0)
    $$bindings.radius(radius);
  if ($$props.textColor === void 0 && $$bindings.textColor && textColor !== void 0)
    $$bindings.textColor(textColor);
  if ($$props.bgColor === void 0 && $$bindings.bgColor && bgColor !== void 0)
    $$bindings.bgColor(bgColor);
  if ($$props.weight === void 0 && $$bindings.weight && weight !== void 0)
    $$bindings.weight(weight);
  $$result.css.add(css$1);
  return `<circle${add_attribute("cx", xy[0], 0)}${add_attribute("cy", xy[1], 0)}${add_attribute("r", radius, 0)}${add_styles({ "fill": bgColor })}></circle>
<foreignObject${add_attribute("x", xy[0] - radius, 0)}${add_attribute("y", xy[1] - radius, 0)}${add_attribute("width", radius * 2, 0)}${add_attribute("height", radius * 2, 0)}><p style="${"color:" + escape(textColor, true) + "; user-select: none; margin: 0;"}" class="heavy svelte-6if1p2">${escape(weight)}</p></foreignObject>`;
});
function pointToPolar(pxy, cxy, radius) {
  const dx = pxy[0] - cxy[0];
  const dy = pxy[1] - cxy[1];
  const angle = 360 + Math.atan2(dy, dx) * 180 / Math.PI;
  const r = Math.sqrt(dx * dx + dy * dy);
  return [angle % 360, r / radius];
}
function polarToPoint(cxy, polar, radius) {
  const rad = polar[0] % 360 * Math.PI / 180;
  const offset = [radius * polar[1] * Math.cos(rad), radius * polar[1] * Math.sin(rad)];
  return add(cxy, offset);
}
function humanizeWeight(weight) {
  return Math.round(weight * 100);
}
function getWeightOpacity(weight) {
  return Math.max(1 - Math.pow(1 - weight, 2), 0.25).toFixed(2);
}
function getTextBoxDimensions(text, textWidth) {
  const estimatedLines = Math.floor(text.length / 25) + 1;
  const height = estimatedLines * 20;
  return [textWidth, height];
}
function findBoxCenterOffset(textDimensions) {
  return multiply(textDimensions, 0.5);
}
const CirclePrompt_svelte_svelte_type_style_lang = "";
const css = {
  code: "svg{display:block;width:100%;height:100%}",
  map: null
};
function initializeAngles(points2, angles) {
  if (!points2)
    return null;
  return Object.entries(points2).reduce(
    (acc, [id, point], idx) => {
      const angle = acc[id] || idx * (360 / Object.keys(points2).length) - 90;
      acc[id] = angle;
      return acc;
    },
    angles
  );
}
function getDistance(p1, p2) {
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];
  return Math.sqrt(dx * dx + dy * dy);
}
const CirclePrompt = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { handleWeightChange = (weightsById) => {
  } } = $$props;
  let { center = [450, 450] } = $$props;
  let { radius = 250 } = $$props;
  let { pointRadius = 10 } = $$props;
  let { textWidth = 150 } = $$props;
  let { points = {} } = $$props;
  let { pointAngles = initializeAngles(points, {}) } = $$props;
  let { scaling = 20 } = $$props;
  let { marker = [0, 0] } = $$props;
  let { handleDataStateChange = (dataState) => {
  } } = $$props;
  let pointData = computePointData(points, center, radius, scaling, marker);
  function recomputeState(points2, center2, radius2, scaling2, marker2) {
    pointAngles = initializeAngles(points2, pointAngles);
    pointData = computePointData(points2, center2, radius2, scaling2, marker2);
    handleDataStateChange({
      points: points2,
      pointAngles,
      scaling: scaling2,
      marker: marker2
    });
  }
  function pointOnBoundary(wh, angle) {
    const rad = angle % 360 * Math.PI / 180;
    const cxy = findBoxCenterOffset(wh);
    let x, y;
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    x = (cxy[0] + 5) * -1.2 * c;
    y = (cxy[1] + 5) * -1.2 * s;
    x -= cxy[0];
    y -= cxy[1];
    return [x, y];
  }
  function getTextLocation(pxy, textDimensions) {
    let angle = pointToPolar(pxy, center, radius)[0] - 180;
    if (angle < 0) {
      angle += 360;
    }
    const offset = pointOnBoundary(textDimensions, angle);
    subtract(pxy, offset);
    return add(pxy, offset);
  }
  function activatePoint(pointId) {
  }
  function computePointData(points2, center2, radius2, scaling2, marker2) {
    if (!points2 || !center2 || !radius2 || !scaling2 || !marker2) {
      return null;
    }
    let pd = Object.entries(points2).reduce(
      (acc, [id, point]) => {
        acc[id] = {
          xy: polarToPoint(center2, [pointAngles[id], 1], radius2)
        };
        return acc;
      },
      {}
    );
    pd = Object.entries(pd).reduce(
      (acc, [id, point]) => {
        acc[id] = {
          ...acc[id],
          distance: getDistance(point.xy, polarToPoint(center2, marker2, radius2))
        };
        return acc;
      },
      pd
    );
    const totalDistance = Object.values(pd).reduce((acc, point) => acc + point.distance, 0);
    pd = Object.entries(pd).reduce(
      (acc, [id, point]) => {
        acc[id] = {
          ...acc[id],
          unitDistance: Math.round(point.distance / totalDistance * 100) / 100
        };
        return acc;
      },
      pd
    );
    pd = Object.entries(pd).reduce(
      (acc, [id, point]) => {
        acc[id] = {
          ...acc[id],
          invertedUnitDistance: Math.round((1 - point.unitDistance) * 100) / 100
        };
        return acc;
      },
      pd
    );
    pd = Object.entries(pd).reduce(
      (acc, [id, point]) => {
        acc[id] = {
          ...acc[id],
          unitWeight: Math.round(Math.pow(point.invertedUnitDistance, scaling2) * 100) / 100
        };
        return acc;
      },
      pd
    );
    const weights = Object.entries(pd).reduce(
      (acc, [id, data]) => {
        acc[id] = humanizeWeight(data.unitWeight);
        return acc;
      },
      {}
    );
    handleWeightChange(weights);
    return pd;
  }
  if ($$props.handleWeightChange === void 0 && $$bindings.handleWeightChange && handleWeightChange !== void 0)
    $$bindings.handleWeightChange(handleWeightChange);
  if ($$props.center === void 0 && $$bindings.center && center !== void 0)
    $$bindings.center(center);
  if ($$props.radius === void 0 && $$bindings.radius && radius !== void 0)
    $$bindings.radius(radius);
  if ($$props.pointRadius === void 0 && $$bindings.pointRadius && pointRadius !== void 0)
    $$bindings.pointRadius(pointRadius);
  if ($$props.textWidth === void 0 && $$bindings.textWidth && textWidth !== void 0)
    $$bindings.textWidth(textWidth);
  if ($$props.points === void 0 && $$bindings.points && points !== void 0)
    $$bindings.points(points);
  if ($$props.pointAngles === void 0 && $$bindings.pointAngles && pointAngles !== void 0)
    $$bindings.pointAngles(pointAngles);
  if ($$props.scaling === void 0 && $$bindings.scaling && scaling !== void 0)
    $$bindings.scaling(scaling);
  if ($$props.marker === void 0 && $$bindings.marker && marker !== void 0)
    $$bindings.marker(marker);
  if ($$props.handleDataStateChange === void 0 && $$bindings.handleDataStateChange && handleDataStateChange !== void 0)
    $$bindings.handleDataStateChange(handleDataStateChange);
  $$result.css.add(css);
  {
    {
      recomputeState(points, center, radius, scaling, marker);
    }
  }
  return `<svg id="svg" class="w-full h-full">${pointData && points ? `${validate_component(Circle, "Circle").$$render($$result, { xy: center, radius }, {}, {})}

        ${each(Object.entries(points), ([id, point]) => {
    return `${validate_component(Line, "Line").$$render(
      $$result,
      {
        p1: polarToPoint(center, marker, radius),
        p2: pointData[id].xy
      },
      {},
      {}
    )}
            ${validate_component(Point, "Point").$$render(
      $$result,
      {
        xy: pointData[id].xy,
        radius: pointRadius,
        color: "rgba(76,97,141, 1)",
        handleMouseDown: () => activatePoint()
      },
      {},
      {}
    )}
            ${validate_component(PromptText, "PromptText").$$render(
      $$result,
      {
        xy: getTextLocation(pointData[id].xy, getTextBoxDimensions(point.text, textWidth)),
        color: `rgba(255,255,255,${getWeightOpacity(pointData[id].unitWeight)}`,
        wh: getTextBoxDimensions(point.text, textWidth),
        text: point.text
      },
      {},
      {}
    )}
            ${validate_component(WeightMarker, "WeightMarker").$$render(
      $$result,
      {
        xy: multiply(add(polarToPoint(center, marker, radius), pointData[id].xy), 0.5),
        weight: humanizeWeight(pointData[id].unitWeight),
        radius: 15,
        textColor: `rgba(255,255,255,${getWeightOpacity(pointData[id].unitWeight)}`,
        bgColor: `rgb(8, 11, 22)`
      },
      {},
      {}
    )}`;
  })}

        ${Object.entries(points).length > 0 ? `${validate_component(Point, "Point").$$render(
    $$result,
    {
      xy: polarToPoint(center, marker, radius),
      radius: 10,
      color: "rgba(136,157,191, 1)",
      handleMouseDown: () => activatePoint()
    },
    {},
    {}
  )}` : ``}` : ``}</svg>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let currentPromptData;
  let controllerCenter;
  let controllerRadius;
  let $promptList, $$unsubscribe_promptList;
  $$unsubscribe_promptList = subscribe(promptList, (value2) => $promptList = value2);
  let storedPromptConfigs = $promptList;
  let weights = {};
  let controllerMarker = [0, 0];
  let controllerPoints = {};
  let controllerScaling = 10;
  let controllerW;
  let controllerH;
  let value = "A basic example::1 A simple prototype::1 A starting point.::1";
  function handleWeightChange(weightsById) {
    weights = weightsById;
    if (Object.entries(weights).length === Object.entries(currentPromptData).length) {
      value = Object.entries(weights).reduce(
        (acc, [id, weight]) => {
          const prompt = currentPromptData[id].text;
          acc.push(`${prompt}::${weight}`);
          return acc;
        },
        []
      ).join(" ");
    }
  }
  function handleCircleDataStateChange(circleData) {
  }
  debounce(
    (e) => {
      value = e.target.value;
    },
    500
  );
  {
    {
      console.log(storedPromptConfigs);
    }
  }
  currentPromptData = [...parsePrompts(value)].reduce(
    (acc, { prompt, weight }, idx) => {
      const id = idx;
      acc[id] = { id, text: prompt, parsedWeight: weight };
      return acc;
    },
    {}
  );
  controllerCenter = [Math.round(controllerW / 2), Math.round(controllerH / 2)];
  controllerRadius = Math.round(Math.min(controllerW, controllerH) / 2) - 150;
  $$unsubscribe_promptList();
  return `<div class="max-w-md w-1/2 h-screen overflow-y-auto"><div class="h-screen overflow-y-auto"><ul class="menu h-screen p-4 bg-base-100 overflow-y-auto text-base-content inline-block">
        <li><a class="text-xs inline-block">New +</a></li>
        ${each(orderBy($promptList, (i) => i[1].date, "desc"), ([promptId, data]) => {
    return `<li><a class="text-xs inline-block">${each(Object.entries(data.points), ([id, point]) => {
      return `${escape(point.text)}::<b>${escape(point.parsedWeight)}</b> `;
    })}</a></li>`;
  })}</ul></div></div>
<div class="w-full h-screen">
    <div class="flex flex-col h-full place-content-between"><div class="w-full h-full">${validate_component(CirclePrompt, "CirclePrompt").$$render(
    $$result,
    {
      points: currentPromptData,
      pointAngles: controllerPoints,
      marker: controllerMarker,
      center: controllerCenter,
      radius: controllerRadius,
      scaling: controllerScaling,
      handleWeightChange,
      handleDataStateChange: handleCircleDataStateChange
    },
    {},
    {}
  )}</div>
      <div class="p-4 pb-0"><label class="label"><span class="label-text">Scaling</span></label>
        <input type="range" min="1" max="20" class="range"${add_attribute("value", controllerScaling, 0)}></div>
      <div class="h-32 w-full p-4"><div class="h-32 w-full flex"><textarea placeholder="Prompt" class="textarea textarea-bordered w-full h-24 text-sm resize-none">${escape(value, false)}</textarea>
          
          <div class="h-24 pl-2 flex flex-col justify-evenly"><button class="btn btn-sm btn-circle btn-outline"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 512 512"><path fill="rgba(96,117,151, 1)" d="M272 0H396.1c12.7 0 24.9 5.1 33.9 14.1l67.9 67.9c9 9 14.1 21.2 14.1 33.9V336c0 26.5-21.5 48-48 48H272c-26.5 0-48-21.5-48-48V48c0-26.5 21.5-48 48-48zM48 128H192v64H64V448H256V416h64v48c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V176c0-26.5 21.5-48 48-48z"></path></svg></button>
            <button class="btn btn-sm btn-circle btn-outline"><svg id="Layer_1" style="enable-background:new 0 0 30 30;" version="1.1" class="h-4 w-4" viewBox="0 0 30 30" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path fill="rgba(96,117,151, 1)" d="M22,4h-2v6c0,0.552-0.448,1-1,1h-9c-0.552,0-1-0.448-1-1V4H6C4.895,4,4,4.895,4,6v18c0,1.105,0.895,2,2,2h18  c1.105,0,2-0.895,2-2V8L22,4z M22,24H8v-6c0-1.105,0.895-2,2-2h10c1.105,0,2,0.895,2,2V24z"></path><rect height="5" width="2" x="16" y="4"></rect></svg></button></div></div></div></div></div>`;
});
export {
  Page as default
};
