<script lang="ts">
    import { embedString } from "$lib/embed.js";
    import { concepts } from "../stores/concepts.js";

    let queue : Record<string, boolean> = { a: false };
    let embedding = false;

    $: unembeddedConcepts = Object.entries($concepts).filter(
        ([c,e]) => !e
    );

    $: {
        if (unembeddedConcepts.length > 0) {
            unembeddedConcepts.forEach(([c,e]) => {
                queue[c] = false;
            });
        }
    }

    $: {
        if (!embedding && Object.keys(queue).length > 0) {
            embedding = true;
            embedNext();
        }
    }

    function embedNext() {
        console.log('start embedding')
        const next = Object.keys(queue)[0];
        queue[next] = true;
        console.log('embedding', next);
        embedString(next).then((e) => {
            console.log('embedded', next);
            concepts.update(next, e);
            const newQueue = {...queue};
            delete newQueue[next];
            queue = newQueue;
            if(Object.keys(queue).length > 0)
                embedNext();
            else
                embedding = false;
        });
    }
    
</script>

{#if Object.keys(queue).length > 0}
    <div class="flex justify-end">
        <div class="flex flex-col justify-center mr-5">
            <progress class="progress progress-primary w-20" />
        </div>
        <div class="flex flex-col justify-center mr-5">
            <p class="text-xs">Embedding...</p>
        </div>
    </div>
{/if}
