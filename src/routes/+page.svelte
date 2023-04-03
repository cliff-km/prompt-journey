<script lang="ts">
  import { v4 as uuidv4 } from 'uuid';
  import { parsePrompts } from '../lib/prompt.js';
	import { promptList, promptStore } from '../lib/store.js'
  import CirclePrompt from '../components/CirclePrompt.svelte';
  import debounce from 'lodash/debounce';
  import SidebarSelect from '../components/SidebarSelect.svelte';
  import SidebarEdit from '../components/SidebarEdit.svelte';
  import SidebarGenerate from '../components/SidebarGenerate.svelte';
  import SidebarSettings from '../components/SidebarSettings.svelte';
    import PromptBox from '../components/PromptBox.svelte';

  let storedPromptConfigs = $promptList;
  let openaiKey = "";

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
  let controllerScaling = 2;
  let controllerScalingExponential = true;
  let controllerMode = 'circle';
  let panelMode = 'select';

  let controllerW;
  let controllerH;

  let activePrompt = null;
  let value = "Magic potion in a beautiful bottle.::1 A beautiful decanter.::1 A beautiful tequila bottle.::1 A beautiful sake bottle.::1 A beautiful perfume bottle.::1 A beatiful glass vase of flowers.::1 A beautiful glass tea kettle.::1 A beautiful wine bottle.::1 A beautiful vinegar bottle.::1 A beautiful fishbowl.::1 A beautiful piece of tourmaline.::1 A beautiful piece of sphalerite.::1 A beautiful piece of sapphire.::1 Chihuly glass art.::1 Iittala glass art.::1";
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
    promptStore.updatePrompt(uuidv4(), {...controllerData, date: Date.now(), exponentialScaling: controllerScalingExponential, mode: controllerMode});
    selectPanelMode('select');
  }

  function copyToClipboard () {
    navigator.clipboard.writeText(value);
  };

  function pasteFromClipboard () {
    navigator.clipboard.readText().then(text => {
      value = text;
    });
  };


  function handleCircleDataStateChange(circleData) {
    controllerData = circleData;
    // console.log(controllerData);
  }

  function clearData() {
    value = "";
    activePrompt = null;
    controllerData = {};
    controllerMarker = [0, 0];
    controllerPoints = {};
    controllerScaling = 2;
    controllerMode = 'circle';
  }

  function loadStoredData(id, data) {
    controllerData = data;
    const {points, pointAngles, scaling, exponentialScaling, marker, mode} = data;

    value = Object.entries(points).reduce((acc, [id, point]) => {
      acc.push(`${point.text}::${point.parsedWeight}`);
      return acc;
    }, [] as string[]).join(" ");
    prompts = points;
    activePrompt = id;
    controllerScaling = scaling;
    controllerScalingExponential = Boolean(exponentialScaling);
    controllerMarker = marker;
    controllerPoints = pointAngles;
    controllerMode = mode;
    selectPanelMode('edit');
  }

  function selectPanelMode(mode) {
    panelMode = mode;
  }

  function handleDeletePrompt(id) {
    if(id) promptStore.deletePrompt(id);
    selectPanelMode('select');
    clearData();
  }

  const handlePromptChange = debounce((e) => {
    value = e.target.value;
  }, 500);

  const handleSinglePromptChange = debounce((id, text) => {
    currentPromptData[id].text = text;
    value = Object.entries(currentPromptData).reduce((acc, [id, point]) => {
      acc.push(`${point.text}::${point.parsedWeight}`);
      return acc;
    }, [] as string[]).join(" ");
  }, 500);

  const handleNewPromptChange = debounce((text) => {
    const id = Object.keys(currentPromptData).length;
    currentPromptData[id] = { id, text, parsedWeight: 1 };
    value = Object.entries(currentPromptData).reduce((acc, [id, point]) => {
      acc.push(`${point.text}::${point.parsedWeight}`);
      return acc;
    }, [] as string[]).join(" ");
  }, 500);


  $:controllerCenter = [Math.round(controllerW / 2), Math.round(controllerH / 2)];
  $:controllerRadius = Math.round(Math.min(controllerW, controllerH) / 2) - 150;
</script>
<div class="max-w-md w-1/2 h-screen overflow-y-auto">
    <div class="h-screen overflow-y-auto">
      <div class="btn-group btn-group-vertical sm:btn-group-horizontal bg-base-100 w-full flex justify-center p-2">
        <button class={panelMode === 'select' ? 'btn btn-active' : 'btn'} on:click={()=>selectPanelMode('select')}>Select</button>
        <button class={panelMode === 'edit' ? 'btn btn-active' : 'btn'} on:click={()=>selectPanelMode('edit')}>Edit</button>
        <button class={panelMode === 'generate' ? 'btn btn-active' : 'btn'} on:click={()=>selectPanelMode('generate')}>Generate</button>
        <button class={panelMode === 'settings' ? 'btn btn-active' : 'btn'} on:click={()=>selectPanelMode('settings')}>Settings</button>
      </div>
      <!-- Sidebar content here -->
      {#if panelMode==='select'}
        <SidebarSelect 
          selectNew={()=>{clearData(); selectPanelMode('edit');}}
          selectData={loadStoredData}
        />
      {:else if panelMode==='edit'}
        <SidebarEdit 
          prompts={currentPromptData}
          handlePromptChange={handleSinglePromptChange}
          handleNewPromptChange={handleNewPromptChange}
          handlePaste={pasteFromClipboard}
          handleDelete={()=>handleDeletePrompt(activePrompt)}
          handleSave={saveToStore}
        />
      {:else if panelMode==='generate'}
        <SidebarGenerate openaiKey={openaiKey} />
      {:else if panelMode==='settings'}
        <SidebarSettings openaiKey={openaiKey} handleOpenAIKeyChange={(key)=>{openaiKey = key}} />
      {/if}
    </div>
</div>
<div class="w-full h-screen">
    <!-- Page content here -->
    <div class="flex flex-col h-full place-content-between">
      <div class="w-full h-full" bind:clientWidth={controllerW} bind:clientHeight={controllerH}>
        <CirclePrompt points={currentPromptData} pointAngles={controllerPoints} marker={controllerMarker} center={controllerCenter} radius={controllerRadius} exponentialScaling={controllerScalingExponential} scaling={controllerScaling} handleWeightChange={handleWeightChange} handleDataStateChange={handleCircleDataStateChange} />
      </div>
      <div class="px-2 py-4 pb-0 flex">
        <div class="w-52 px-2">
          <label class="label">
            <span class="label-text">Exponential Scaling</span>
          </label>
          <input type="checkbox" class="toggle" bind:checked={controllerScalingExponential} />
        </div>
        {#if controllerScalingExponential}
          <div class="w-full px-2">
            <label class="label">
              <span class="label-text">Scaling Power</span>
            </label>
            <input bind:value={controllerScaling} type="range" min="0.5" max="3" step="0.1" class="range"/>
          </div>
        {/if}
      </div>
      <div class="h-32 w-full p-4">
        <div class="h-32 w-full flex">
          <PromptBox prompts={currentPromptData} weights={weights} handleClick={copyToClipboard}/>
        </div>
      </div>
    </div>
</div>
