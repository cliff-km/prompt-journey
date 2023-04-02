export const manifest = {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png"]),
	mimeTypes: {".png":"image/png"},
	_: {
		client: {"start":{"file":"_app/immutable/entry/start.3df1fb4f.js","imports":["_app/immutable/entry/start.3df1fb4f.js","_app/immutable/chunks/index.6cbec532.js","_app/immutable/chunks/singletons.57fcde0e.js","_app/immutable/chunks/index.065b1b8d.js"],"stylesheets":[],"fonts":[]},"app":{"file":"_app/immutable/entry/app.c4393f2c.js","imports":["_app/immutable/entry/app.c4393f2c.js","_app/immutable/chunks/index.6cbec532.js"],"stylesheets":[],"fonts":[]}},
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
