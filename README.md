# prompt-journey

See it live [here](https://cliff-km.github.io/prompt-journey/).

## Overview

A tool to help play with Midjourney prompts. It's mostly aimed at multi-prompts but can help you reorder and shuffle single prompts. Create multi-prompts from scratch, paste them in (and paragraphs or comma lists), or generate them from GPT if you provide an OpenAI key.

## Future Plans

I have some more ideas for better prompt management, a few more weight controller ideas, and some alternative generators. I'd also like to integrate the Midjourney API when it gets released. Some of these ideas may require a proper backend and I'm not sure I feel like paying for it.

So, TBD.

## Known Issues

- Not mobile or small window friendly
- Embed mapping could use some zooming and navigation.
- tSNE mapping feels too random
  - Partially addressed by adding in some anchoring that uses kMeans clustering.
- Error handling 🙏
- Built with tape and thumbtacks
- Started hitting the bounds of localStorage. It was fun while it lasted.
  - Partially addressed by sharing embeds between prompts but still very limited.
- Generally handles small pools of prompts well but does not handle large pools which is something I'd like.

If you find anything else, let me know with an issue.

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

