export const manifest = {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png"]),
	mimeTypes: {".png":"image/png"},
	_: {
		client: {"start":{"file":"_app/immutable/entry/start.08f3a542.js","imports":["_app/immutable/entry/start.08f3a542.js","_app/immutable/chunks/index.6cbec532.js","_app/immutable/chunks/singletons.977a1f5f.js","_app/immutable/chunks/index.065b1b8d.js"],"stylesheets":[],"fonts":[]},"app":{"file":"_app/immutable/entry/app.b8bd7c7d.js","imports":["_app/immutable/entry/app.b8bd7c7d.js","_app/immutable/chunks/index.6cbec532.js"],"stylesheets":[],"fonts":[]}},
		nodes: [
			() => import('./nodes/0.js'),
			() => import('./nodes/1.js'),
			() => import('./nodes/2.js')
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0], errors: [1], leaf: 2 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		}
	}
};
