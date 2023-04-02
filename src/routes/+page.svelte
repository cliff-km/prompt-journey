<script lang="ts">
  import { v4 as uuidv4 } from 'uuid';
  import { parsePrompts } from '../lib/prompt.js';
	import { promptList, promptStore } from '../lib/store.js'
  import CirclePrompt from '../components/CirclePrompt.svelte';
  import debounce from 'lodash/debounce'
  import pkg from 'lodash';
  const { orderBy } = pkg;

  let storedPromptConfigs = $promptList;

  $: {
    console.log(storedPromptConfigs);
  }

  let prompts = {
  };

  let weights = {
  };

  let controllerData = {};

  let controllerMarker = [0, 0];
  let controllerPoints = {};
  let controllerScaling = 5;

  let controllerW;
  let controllerH;

  let activePrompt = null;
  let value = "A basic example::1 A simple prototype::1 A starting point.::1";
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

  function saveToStore() {
    promptStore.updatePrompt(uuidv4(), {...controllerData, date: Date.now()});
  }

  function copyToClipboard () {
    navigator.clipboard.writeText(value);
  };

  function sortPromptListByDate(promptList) {
    return promptList;
  }

  function handleCircleDataStateChange(circleData) {
    controllerData = circleData;
    // console.log(controllerData);
  }

  function clearData() {
    value = "";
    controllerData = {};
    controllerMarker = [0, 0];
    controllerPoints = {};
    controllerScaling = 10;
  }

  function loadStoredData(data) {
    controllerData = data;
    const {points, pointAngles, scaling, marker} = data;

    value = Object.entries(points).reduce((acc, [id, point]) => {
      acc.push(`${point.text}::${point.parsedWeight}`);
      return acc;
    }, [] as string[]).join(" ");
    prompts = points;
    controllerScaling = scaling;
    controllerMarker = marker;
    controllerPoints = pointAngles;
  }

  const handlePromptChange = debounce((e) => {
    value = e.target.value;
  }, 500);


  $:controllerCenter = [Math.round(controllerW / 2), Math.round(controllerH / 2)];
  $:controllerRadius = Math.round(Math.min(controllerW, controllerH) / 2) - 150;
</script>
<div class="max-w-md w-1/2 h-screen overflow-y-auto">
    <div class="h-screen overflow-y-auto">
      <ul class="menu h-screen p-4 w-full bg-base-100 overflow-y-auto text-base-content inline-block">
        <!-- Sidebar content here -->
        <li><a class="text-xs inline-block" on:click={clearData}>New +</a></li>
        {#each orderBy($promptList, (i) => i[1].date, 'desc') as [promptId, data] (promptId)}
          <li><a class="text-xs inline-block" on:click={()=>loadStoredData(data)}>{#each Object.entries(data.points) as [id, point]}{point.text}::<b>{point.parsedWeight}</b> {/each}</a></li>
        {/each}
      </ul>
    </div>
</div>
<div class="w-full h-screen">
    <!-- Page content here -->
    <div class="flex flex-col h-full place-content-between">
      <div class="w-full h-full" bind:clientWidth={controllerW} bind:clientHeight={controllerH}>
        <CirclePrompt points={currentPromptData} pointAngles={controllerPoints} marker={controllerMarker} center={controllerCenter} radius={controllerRadius} scaling={controllerScaling} handleWeightChange={handleWeightChange} handleDataStateChange={handleCircleDataStateChange} />
      </div>
      <div class="p-4 pb-0">
        <label class="label">
          <span class="label-text">Scaling</span>
        </label>
        <input bind:value={controllerScaling} type="range" min="1" max="20" class="range"/>
      </div>
      <div class="h-32 w-full p-4">
        <div class="h-32 w-full flex">
          <textarea placeholder="Prompt" class="textarea textarea-bordered w-full h-24 text-sm resize-none" value={value} on:input={handlePromptChange}/>
          <!-- Copy text value -->
          <div class="h-24 pl-2 flex flex-col justify-evenly">
            <button class="btn btn-sm btn-circle btn-outline" on:click={copyToClipboard}>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path fill="rgba(96,117,151, 1)" d="M272 0H396.1c12.7 0 24.9 5.1 33.9 14.1l67.9 67.9c9 9 14.1 21.2 14.1 33.9V336c0 26.5-21.5 48-48 48H272c-26.5 0-48-21.5-48-48V48c0-26.5 21.5-48 48-48zM48 128H192v64H64V448H256V416h64v48c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V176c0-26.5 21.5-48 48-48z"/></svg>
            </button>
            <button class="btn btn-sm btn-circle btn-outline" on:click={saveToStore}>
              <svg id="Layer_1" style="enable-background:new 0 0 30 30;" version="1.1" class="h-4 w-4" viewBox="0 0 30 30" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path fill="rgba(96,117,151, 1)" d="M22,4h-2v6c0,0.552-0.448,1-1,1h-9c-0.552,0-1-0.448-1-1V4H6C4.895,4,4,4.895,4,6v18c0,1.105,0.895,2,2,2h18  c1.105,0,2-0.895,2-2V8L22,4z M22,24H8v-6c0-1.105,0.895-2,2-2h10c1.105,0,2,0.895,2,2V24z"/><rect height="5" width="2" x="16" y="4"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
</div>
