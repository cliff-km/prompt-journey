import{w as u}from"./index.065b1b8d.js";import{a as h}from"./paths.81e2671d.js";const g="1680473593531",E="sveltekit:snapshot",w="sveltekit:scroll",A="sveltekit:index",f={tap:1,hover:2,viewport:3,eager:4,off:-1};function R(e){let t=e.baseURI;if(!t){const n=e.getElementsByTagName("base");t=n.length?n[0].href:e.URL}return t}function I(){return{x:pageXOffset,y:pageYOffset}}function i(e,t){return e.getAttribute(`data-sveltekit-${t}`)}const d={...f,"":f.hover};function _(e){let t=e.assignedSlot??e.parentNode;return(t==null?void 0:t.nodeType)===11&&(t=t.host),t}function S(e,t){for(;e&&e!==t;){if(e.nodeName.toUpperCase()==="A"&&e.hasAttribute("href"))return e;e=_(e)}}function y(e,t){let n;try{n=new URL(e instanceof SVGAElement?e.href.baseVal:e.href,document.baseURI)}catch{}const l=e instanceof SVGAElement?e.target.baseVal:e.target,s=!n||!!l||v(n,t)||(e.getAttribute("rel")||"").split(/\s+/).includes("external")||e.hasAttribute("download");return{url:n,external:s,target:l}}function T(e){let t=null,n=null,l=null,s=null,r=null,a=null,o=e;for(;o&&o!==document.documentElement;)l===null&&(l=i(o,"preload-code")),s===null&&(s=i(o,"preload-data")),t===null&&(t=i(o,"keepfocus")),n===null&&(n=i(o,"noscroll")),r===null&&(r=i(o,"reload")),a===null&&(a=i(o,"replacestate")),o=_(o);return{preload_code:d[l??"off"],preload_data:d[s??"off"],keep_focus:t==="off"?!1:t===""?!0:null,noscroll:n==="off"?!1:n===""?!0:null,reload:r==="off"?!1:r===""?!0:null,replace_state:a==="off"?!1:a===""?!0:null}}function p(e){const t=u(e);let n=!0;function l(){n=!0,t.update(a=>a)}function s(a){n=!1,t.set(a)}function r(a){let o;return t.subscribe(c=>{(o===void 0||n&&c!==o)&&a(o=c)})}return{notify:l,set:s,subscribe:r}}function b(){const{set:e,subscribe:t}=u(!1);let n;async function l(){clearTimeout(n);const s=await fetch(`${h}/_app/version.json`,{headers:{pragma:"no-cache","cache-control":"no-cache"}});if(s.ok){const a=(await s.json()).version!==g;return a&&(e(!0),clearTimeout(n)),a}else throw new Error(`Version check failed: ${s.status}`)}return{subscribe:t,check:l}}function v(e,t){return e.origin!==location.origin||!e.pathname.startsWith(t)}function x(e){e.client}const O={url:p({}),page:p({}),navigating:u(null),updated:b()};export{A as I,f as P,w as S,E as a,y as b,T as c,I as d,x as e,S as f,R as g,v as i,O as s};
