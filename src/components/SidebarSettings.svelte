<script lang="ts">
    import { keyStore, key } from '../lib/keyStore.js';
    import { preferredModelStore, preferredModel } from '../lib/prefferedModelStore.js';
    import { createOpenAI, listModels } from '../lib/openai.js';

    const supportedModels = [
        'text-davinci-003',
        'text-curie-001',
        'text-babage-001',
        'text-ada-001',
        'gpt-3.5-turbo',
        'gpt-3.5-turbo-0301',
    ];

    let openaiKey = $key;

    let models = [];
    let selectedModel = $preferredModel;

    async function fetchModels(openaiKey) {
        if(!openaiKey || models.length) return;
        const openai = createOpenAI(openaiKey);
        const response = await listModels(openai);
        console.log(response)

        if(response.data) models = response.data.data.map(({id}) => id).filter(id => supportedModels.includes(id));
    }

    function handleModelSelect(e) {
        selectedModel = e.target.value;
        preferredModelStore.updateModel(selectedModel);
    }

    $: {
        fetchModels(openaiKey);
    }
</script>
  
<div class="h-full p-4 w-full bg-base-100 overflow-y-auto text-base-content inline-block">
    <div class="flex justify-center">
        <div class="form-control w-full max-w-xs">
            <label class="label">
                <span class="label-text-alt">Open AI Key</span>
            </label>
            <input value={$key} on:input={(e)=>keyStore.updateKey(e.target.value)} type="password" placeholder="Open AI Key" class="input input-bordered w-full max-w-xs" />
        </div>
    </div>


    {#if models.length > 0}
        <div class="flex justify-center">
                <div class="form-control w-full max-w-xs mb-4">
                    <label class="label">
                        <span class="label-text">Pick a model to use for model generation</span>
                    </label>
                    <select value={selectedModel} on:change={handleModelSelect} class="select select-bordered">
                        <option disabled selected={selectedModel===null}>Pick one</option>
                        {#each models as m (m)}
                            <option value={m} selected={selectedModel===m}>{m}</option>
                        {/each}
                    </select>
                </div>
            </div>
    {/if}
</div>