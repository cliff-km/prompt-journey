function M(){}function ct(t,e){for(const n in e)t[n]=e[n];return t}function lt(t){return!!t&&(typeof t=="object"||typeof t=="function")&&typeof t.then=="function"}function R(t){return t()}function G(){return Object.create(null)}function v(t){t.forEach(R)}function V(t){return typeof t=="function"}function St(t,e){return t!=t?e==e:t!==e||t&&typeof t=="object"||typeof t=="function"}function ot(t){return Object.keys(t).length===0}function X(t,...e){if(t==null)return M;const n=t.subscribe(...e);return n.unsubscribe?()=>n.unsubscribe():n}function At(t){let e;return X(t,n=>e=n)(),e}function Mt(t,e,n){t.$$.on_destroy.push(X(e,n))}function jt(t,e,n,i){if(t){const r=Y(t,e,n,i);return t[0](r)}}function Y(t,e,n,i){return t[1]&&i?ct(n.ctx.slice(),t[1](i(e))):n.ctx}function Ct(t,e,n,i){if(t[2]&&i){const r=t[2](i(n));if(e.dirty===void 0)return r;if(typeof r=="object"){const o=[],s=Math.max(e.dirty.length,r.length);for(let u=0;u<s;u+=1)o[u]=e.dirty[u]|r[u];return o}return e.dirty|r}return e.dirty}function zt(t,e,n,i,r,o){if(r){const s=Y(e,n,i,o);t.p(s,r)}}function Ot(t){if(t.ctx.length>32){const e=[],n=t.ctx.length/32;for(let i=0;i<n;i++)e[i]=-1;return e}return-1}let j=!1;function ut(){j=!0}function at(){j=!1}function ft(t,e,n,i){for(;t<e;){const r=t+(e-t>>1);n(r)<=i?t=r+1:e=r}return t}function dt(t){if(t.hydrate_init)return;t.hydrate_init=!0;let e=t.childNodes;if(t.nodeName==="HEAD"){const c=[];for(let l=0;l<e.length;l++){const d=e[l];d.claim_order!==void 0&&c.push(d)}e=c}const n=new Int32Array(e.length+1),i=new Int32Array(e.length);n[0]=-1;let r=0;for(let c=0;c<e.length;c++){const l=e[c].claim_order,d=(r>0&&e[n[r]].claim_order<=l?r+1:ft(1,r,a=>e[n[a]].claim_order,l))-1;i[c]=n[d]+1;const _=d+1;n[_]=c,r=Math.max(_,r)}const o=[],s=[];let u=e.length-1;for(let c=n[r]+1;c!=0;c=i[c-1]){for(o.push(e[c-1]);u>=c;u--)s.push(e[u]);u--}for(;u>=0;u--)s.push(e[u]);o.reverse(),s.sort((c,l)=>c.claim_order-l.claim_order);for(let c=0,l=0;c<s.length;c++){for(;l<o.length&&s[c].claim_order>=o[l].claim_order;)l++;const d=l<o.length?o[l]:null;t.insertBefore(s[c],d)}}function _t(t,e){t.appendChild(e)}function ht(t,e){if(j){for(dt(t),(t.actual_end_child===void 0||t.actual_end_child!==null&&t.actual_end_child.parentNode!==t)&&(t.actual_end_child=t.firstChild);t.actual_end_child!==null&&t.actual_end_child.claim_order===void 0;)t.actual_end_child=t.actual_end_child.nextSibling;e!==t.actual_end_child?(e.claim_order!==void 0||e.parentNode!==t)&&t.insertBefore(e,t.actual_end_child):t.actual_end_child=e.nextSibling}else(e.parentNode!==t||e.nextSibling!==null)&&t.appendChild(e)}function Wt(t,e,n){j&&!n?ht(t,e):(e.parentNode!==t||e.nextSibling!=n)&&t.insertBefore(e,n||null)}function Z(t){t.parentNode&&t.parentNode.removeChild(t)}function Bt(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}function tt(t){return document.createElement(t)}function mt(t){return document.createElementNS("http://www.w3.org/2000/svg",t)}function T(t){return document.createTextNode(t)}function It(){return T(" ")}function Lt(){return T("")}function J(t,e,n,i){return t.addEventListener(e,n,i),()=>t.removeEventListener(e,n,i)}function Pt(t,e,n){n==null?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function Tt(t){return t===""?null:+t}function pt(t){return Array.from(t.childNodes)}function yt(t){t.claim_info===void 0&&(t.claim_info={last_index:0,total_claimed:0})}function et(t,e,n,i,r=!1){yt(t);const o=(()=>{for(let s=t.claim_info.last_index;s<t.length;s++){const u=t[s];if(e(u)){const c=n(u);return c===void 0?t.splice(s,1):t[s]=c,r||(t.claim_info.last_index=s),u}}for(let s=t.claim_info.last_index-1;s>=0;s--){const u=t[s];if(e(u)){const c=n(u);return c===void 0?t.splice(s,1):t[s]=c,r?c===void 0&&t.claim_info.last_index--:t.claim_info.last_index=s,u}}return i()})();return o.claim_order=t.claim_info.total_claimed,t.claim_info.total_claimed+=1,o}function nt(t,e,n,i){return et(t,r=>r.nodeName===e,r=>{const o=[];for(let s=0;s<r.attributes.length;s++){const u=r.attributes[s];n[u.name]||o.push(u.name)}o.forEach(s=>r.removeAttribute(s))},()=>i(e))}function qt(t,e,n){return nt(t,e,n,tt)}function Dt(t,e,n){return nt(t,e,n,mt)}function gt(t,e){return et(t,n=>n.nodeType===3,n=>{const i=""+e;if(n.data.startsWith(i)){if(n.data.length!==i.length)return n.splitText(i.length)}else n.data=i},()=>T(e),!0)}function Ft(t){return gt(t," ")}function Ht(t,e){e=""+e,t.data!==e&&(t.data=e)}function Ut(t,e){t.value=e??""}function Gt(t,e,n,i){n===null?t.style.removeProperty(e):t.style.setProperty(e,n,i?"important":"")}function Jt(t,e,n){for(let i=0;i<t.options.length;i+=1){const r=t.options[i];if(r.__value===e){r.selected=!0;return}}(!n||e!==void 0)&&(t.selectedIndex=-1)}let S;function bt(){if(S===void 0){S=!1;try{typeof window<"u"&&window.parent&&window.parent.document}catch{S=!0}}return S}function Kt(t,e){getComputedStyle(t).position==="static"&&(t.style.position="relative");const i=tt("iframe");i.setAttribute("style","display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;"),i.setAttribute("aria-hidden","true"),i.tabIndex=-1;const r=bt();let o;return r?(i.src="data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}<\/script>",o=J(window,"message",s=>{s.source===i.contentWindow&&e()})):(i.src="about:blank",i.onload=()=>{o=J(i.contentWindow,"resize",e),e()}),_t(t,i),()=>{(r||o&&i.contentWindow)&&o(),Z(i)}}function Qt(t,e){return new t(e)}let k;function g(t){k=t}function C(){if(!k)throw new Error("Function called outside component initialization");return k}function Rt(t){C().$$.before_update.push(t)}function Vt(t){C().$$.on_mount.push(t)}function Xt(t){C().$$.after_update.push(t)}const x=[],K=[];let $=[];const Q=[],it=Promise.resolve();let L=!1;function rt(){L||(L=!0,it.then(q))}function Yt(){return rt(),it}function P(t){$.push(t)}const I=new Set;let w=0;function q(){if(w!==0)return;const t=k;do{try{for(;w<x.length;){const e=x[w];w++,g(e),wt(e.$$)}}catch(e){throw x.length=0,w=0,e}for(g(null),x.length=0,w=0;K.length;)K.pop()();for(let e=0;e<$.length;e+=1){const n=$[e];I.has(n)||(I.add(n),n())}$.length=0}while(x.length);for(;Q.length;)Q.pop()();L=!1,I.clear(),g(t)}function wt(t){if(t.fragment!==null){t.update(),v(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(P)}}function xt(t){const e=[],n=[];$.forEach(i=>t.indexOf(i)===-1?e.push(i):n.push(i)),n.forEach(i=>i()),$=e}const A=new Set;let b;function $t(){b={r:0,c:[],p:b}}function vt(){b.r||v(b.c),b=b.p}function D(t,e){t&&t.i&&(A.delete(t),t.i(e))}function st(t,e,n,i){if(t&&t.o){if(A.has(t))return;A.add(t),b.c.push(()=>{A.delete(t),i&&(n&&t.d(1),i())}),t.o(e)}else i&&i()}function Zt(t,e){const n=e.token={};function i(r,o,s,u){if(e.token!==n)return;e.resolved=u;let c=e.ctx;s!==void 0&&(c=c.slice(),c[s]=u);const l=r&&(e.current=r)(c);let d=!1;e.block&&(e.blocks?e.blocks.forEach((_,a)=>{a!==o&&_&&($t(),st(_,1,1,()=>{e.blocks[a]===_&&(e.blocks[a]=null)}),vt())}):e.block.d(1),l.c(),D(l,1),l.m(e.mount(),e.anchor),d=!0),e.block=l,e.blocks&&(e.blocks[o]=l),d&&q()}if(lt(t)){const r=C();if(t.then(o=>{g(r),i(e.then,1,e.value,o),g(null)},o=>{if(g(r),i(e.catch,2,e.error,o),g(null),!e.hasCatch)throw o}),e.current!==e.pending)return i(e.pending,0),!0}else{if(e.current!==e.then)return i(e.then,1,e.value,t),!0;e.resolved=t}}function te(t,e,n){const i=e.slice(),{resolved:r}=t;t.current===t.then&&(i[t.value]=r),t.current===t.catch&&(i[t.error]=r),t.block.p(i,n)}function ee(t,e){t.d(1),e.delete(t.key)}function ne(t,e){st(t,1,1,()=>{e.delete(t.key)})}function ie(t,e,n,i,r,o,s,u,c,l,d,_){let a=t.length,m=o.length,h=a;const z={};for(;h--;)z[t[h].key]=h;const E=[],O=new Map,W=new Map,F=[];for(h=m;h--;){const f=_(r,o,h),p=n(f);let y=s.get(p);y?i&&F.push(()=>y.p(f,e)):(y=l(p,f),y.c()),O.set(p,E[h]=y),p in z&&W.set(p,Math.abs(h-z[p]))}const H=new Set,U=new Set;function B(f){D(f,1),f.m(u,d),s.set(f.key,f),d=f.first,m--}for(;a&&m;){const f=E[m-1],p=t[a-1],y=f.key,N=p.key;f===p?(d=f.first,a--,m--):O.has(N)?!s.has(y)||H.has(y)?B(f):U.has(N)?a--:W.get(y)>W.get(N)?(U.add(y),B(f)):(H.add(N),a--):(c(p,s),a--)}for(;a--;){const f=t[a];O.has(f.key)||c(f,s)}for(;m;)B(E[m-1]);return v(F),E}function re(t){t&&t.c()}function se(t,e){t&&t.l(e)}function kt(t,e,n,i){const{fragment:r,after_update:o}=t.$$;r&&r.m(e,n),i||P(()=>{const s=t.$$.on_mount.map(R).filter(V);t.$$.on_destroy?t.$$.on_destroy.push(...s):v(s),t.$$.on_mount=[]}),o.forEach(P)}function Et(t,e){const n=t.$$;n.fragment!==null&&(xt(n.after_update),v(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function Nt(t,e){t.$$.dirty[0]===-1&&(x.push(t),rt(),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function ce(t,e,n,i,r,o,s,u=[-1]){const c=k;g(t);const l=t.$$={fragment:null,ctx:[],props:o,update:M,not_equal:r,bound:G(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(e.context||(c?c.$$.context:[])),callbacks:G(),dirty:u,skip_bound:!1,root:e.target||c.$$.root};s&&s(l.root);let d=!1;if(l.ctx=n?n(t,e.props||{},(_,a,...m)=>{const h=m.length?m[0]:a;return l.ctx&&r(l.ctx[_],l.ctx[_]=h)&&(!l.skip_bound&&l.bound[_]&&l.bound[_](h),d&&Nt(t,_)),a}):[],l.update(),d=!0,v(l.before_update),l.fragment=i?i(l.ctx):!1,e.target){if(e.hydrate){ut();const _=pt(e.target);l.fragment&&l.fragment.l(_),_.forEach(Z)}else l.fragment&&l.fragment.c();e.intro&&D(t.$$.fragment),kt(t,e.target,e.anchor,e.customElement),at(),q()}g(c)}class le{$destroy(){Et(this,1),this.$destroy=M}$on(e,n){if(!V(n))return M;const i=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return i.push(n),()=>{const r=i.indexOf(n);r!==-1&&i.splice(r,1)}}$set(e){this.$$set&&!ot(e)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}export{Jt as $,kt as A,Et as B,jt as C,zt as D,Ot as E,Ct as F,ht as G,M as H,Mt as I,At as J,mt as K,Dt as L,J as M,v as N,Bt as O,P,Kt as Q,Ut as R,le as S,Tt as T,V as U,ie as V,ne as W,Rt as X,Zt as Y,te as Z,ee as _,It as a,X as a0,Wt as b,Ft as c,st as d,Lt as e,vt as f,D as g,Z as h,ce as i,Xt as j,tt as k,qt as l,pt as m,Pt as n,Vt as o,Gt as p,T as q,gt as r,St as s,Yt as t,Ht as u,$t as v,K as w,Qt as x,re as y,se as z};