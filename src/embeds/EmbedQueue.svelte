<script lang="ts">
	import { onDestroy } from 'svelte';
    import { embedString } from "$lib/embed";
    import { concepts } from "../stores/concepts";
    import { key } from "../stores/key";
    import { embedQueue } from "../stores/embedQueue";
    import { cacheSize } from "../stores/cacheSize";

    let embedding = false;

    function queueLength() {
        return Object.keys($embedQueue).length;
    }

    const conceptUnsub = concepts.subscribe((c) => {
        const unembeddedConcepts = Object.entries(c).filter(([cKey, embed]) => !embed);
        
        if ($key && unembeddedConcepts.length > 0) {
            unembeddedConcepts.forEach(([c, e]) => {
                embedQueue.update((q) => {
                    q[c] = false;
                    return q;
                });
            })}
        ;
    });

    const embedUnsub = embedQueue.subscribe((q) => {
        const requiresEmbedStart = Boolean(key.get() && queueLength() > 0 && !embedding);

        if(requiresEmbedStart) {
            embedding = true;
            embedNext();
        }
    });

    function embedNext() {
        console.log("start embedding");
        const next = Object.keys($embedQueue)[0];
        embedQueue.update((q) => {
            q[next] = true;
            return q;
        })
        embedString(next).then((e) => {
            concepts.update(next, e);
            concepts.cache($cacheSize);
            const newQueue = { ...$embedQueue };
            delete newQueue[next];
            embedQueue.set(newQueue);
            if (queueLength() > 0) embedNext();
            else embedding = false;
        });
    }

    onDestroy(() => {
        conceptUnsub();
        embedUnsub();
    });
</script>

{#if embedding}
    <div class="w-full flex justify-center p-4">
        <div class="flex flex-col justify-start mr-5">
            <progress class="progress progress-primary w-20" />
        </div>
        <div class="flex flex-col justify-start mr-5">
            <p class="text-xs">Embedding...</p>
        </div>
    </div>
{:else if !$key}
    <div class="w-full flex justify-center p-4">
        <div class="flex flex-col justify-start mr-5">
            <p class="text-xs">Some features require OpenAI Key</p>
        </div>
    </div>
{/if}
