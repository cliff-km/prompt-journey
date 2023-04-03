<script lang="ts">
    import { ClarinetPuppet1 } from "../directives/clarinet-puppet-1";
    import { ClarinetPuppet2 } from "../directives/clarinet-puppet-2";
    import { FiveSentences } from "../directives/five-sentences";
    import { TenSentences } from "../directives/ten-sentences";
    import { Fragments } from "../directives/fragments";
    import { PoeticAccents } from "../directives/poetic-accent";

    export let openaiKey = "";

    let directives = {
        "Clarinet Puppet 1": {text: ClarinetPuppet1, builtIn: true},
        "Clarinet Puppet 2": {text: ClarinetPuppet2, builtIn: true},
        "Five Sentences": {text: FiveSentences, builtIn: true},
        "Ten Sentences": {text: TenSentences, builtIn: true},
        "Fragments": {text: Fragments, builtIn: true},
        "Poetic Accents": {text: PoeticAccents, builtIn: true},
    };

    let selectedDirective = null;

    $: directiveText = selectedDirective  && selectedDirective !== 'new'? directives[selectedDirective].text : "";
    $: builtInDirective = selectedDirective && selectedDirective !== 'new' && directives[selectedDirective].builtIn;

</script>
  

<div class="h-full p-2 w-full bg-base-100 overflow-y-auto text-base-content inline-block">
    {#if openaiKey}
        <div class="flex justify-center">
            <div class="form-control w-full max-w-xs mb-4">
                <label class="label">
                    <span class="label-text">Pick a directive for prompt creation</span>
                </label>
                <select bind:value={selectedDirective} class="select select-bordered">
                    <option disabled selected={selectedDirective===null}>Pick one</option>
                    {#each Object.keys(directives) as d}
                        <option value={d} selected={selectedDirective===d}>{d}{directives[d].builtIn ? " (Built-In)" : ""}</option>
                    {/each}
                    <!-- <option value='new' selected={selectedDirective==='new'}>New</option> -->
                </select>
            </div>
        </div>
        {#if selectedDirective}
            {#if !builtInDirective}
                <div class="w-full p-2 h-12 flex justify-between">
                    <input type="text" placeholder="Name" class="input input-bordered input-sm w-full max-w-xs" />
                    <button class="btn btn-sm btn-primary ml-4">Save</button>
                </div>
            {/if}
            <div class="w-full p-2 h-1/2">
                <textarea value={directiveText} class="textarea textarea-bordered w-full h-full" placeholder="GPT Directives"></textarea>
            </div>
            <div class="w-full p-2 h-1/5">
                <textarea class="textarea textarea-bordered w-full h-full" placeholder="Describe the prompt to generate."></textarea>
            </div>
            <div class="w-full p-2 h-12 flex justify-end">
                <button class="btn btn-sm btn-primary ml-4">Generate</button>
            </div>
        {/if}
    {:else}
        <div class="w-full p-2 flex justify-center">
            <p>Open AI Key must be provided in settings.</p>
        </div>
    {/if}
</div>