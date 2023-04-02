<script lang="ts">
  import { afterUpdate } from 'svelte';
  import { parsePrompts } from './lib/prompt.js';
  import CirclePrompt from './components/CirclePrompt.svelte';
  import debounce from 'lodash/debounce'

  let prompts = {
  };

  let weights = {
  };

  let scaling = 10;

  let controllerW;
  let controllerH;

  let activePrompt = null;
  let value = "Minimalistic retro 80s Japanese album art::20 Minimalistic abstract geometric design::5 80s japanese movie posters::30 Minimalistic photography by Gregory Crewdson with japanese typography::50 Retro japanese typography::10 Formicapunk, cassette futurism.::30";
  $: currentPromptData = [...parsePrompts(value)].reduce((acc, { prompt, weight }, idx) => {
    const id = idx;
    acc[id] = { id, text: prompt, parsedWeight: weight };
    return acc;
  }, {});
  

  function handleWeightChange(weightsById) {
    weights = weightsById;

    if(Object.entries(weights).length === Object.entries(currentPromptData).length) {
      value = Object.entries(weights).reduce((acc, [id, weight]) => {
        const prompt = currentPromptData[id].text;
        acc.push(`${prompt}::${weight}`);
        return acc;
      }, [] as string[]).join(" ");
    }
  }

  function copyToClipboard () {
    navigator.clipboard.writeText(value);
  };

  const handlePromptChange = debounce((e) => {
    value = e.target.value;
  }, 500);


  $:controllerCenter = [Math.round(controllerW / 2), Math.round(controllerH / 2)];
  $:controllerRadius = Math.round(Math.min(controllerW, controllerH) / 2) - 150;
</script>
<div class="max-w-md w-1/2 h-screen overflow-y-auto">
    <div class="h-screen overflow-y-auto">
      <ul class="menu h-screen p-4 bg-base-100 overflow-y-auto text-base-content inline-block">
        <!-- Sidebar content here -->
        <li><a class="text-xs">New +</a></li>
        <li><a class="text-xs inline-block">Minimalistic retro 80s Japanese album art::<b>20</b> Minimalistic abstract geometric design::<b>5</b> 80s japanese movie posters::<b>30</b> Minimalistic photography by Cody Ellingham with japanese typography::<b>30</b> Retro japanese typography::<b>10</b> Formicapunk, cassette futurism.::<b>30</b></a></li>
        <li><a class="text-xs inline-block">Minimalistic retro 80s Japanese album art::<b>20</b> Minimalistic abstract geometric design::<b>5</b> 80s japanese movie posters::<b>30</b> Minimalistic photography by Cody Ellingham with japanese typography::<b>30</b> Retro japanese typography::<b>10</b> Formicapunk, cassette futurism.::<b>30</b></a></li>
      </ul>
    </div>
</div>
<div class="w-full h-screen">
    <!-- Page content here -->
    <div class="flex flex-col h-full place-content-between">
      <div class="w-full h-full" bind:clientWidth={controllerW} bind:clientHeight={controllerH}>
        <CirclePrompt center={controllerCenter} radius={controllerRadius} points={currentPromptData} handleWeightChange={handleWeightChange} scaling={scaling}/>
      </div>
      <div class="p-4 pb-0">
        <label class="label">
          <span class="label-text">Scaling</span>
        </label>
        <input bind:value={scaling} type="range" min="1" max="20" class="range"/>
      </div>
      <div class="h-32 w-full p-4">
        <div class="h-32 w-full flex">
          <textarea placeholder="Prompt" class="textarea textarea-bordered w-full h-24 text-sm resize-none" value={value} on:input={handlePromptChange}/>
          <!-- Copy text value -->
          <div class="h-24 pl-2 flex flex-col justify-center">
            <button class="btn btn-sm btn-circle btn-outline" on:click={copyToClipboard}>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path fill="rgba(96,117,151, 1)" d="M272 0H396.1c12.7 0 24.9 5.1 33.9 14.1l67.9 67.9c9 9 14.1 21.2 14.1 33.9V336c0 26.5-21.5 48-48 48H272c-26.5 0-48-21.5-48-48V48c0-26.5 21.5-48 48-48zM48 128H192v64H64V448H256V416h64v48c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V176c0-26.5 21.5-48 48-48z"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
</div>