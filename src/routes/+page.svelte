<script>
  import { v4 as uuidv4 } from 'uuid'
  import { afterUpdate } from 'svelte';
  import CirclePrompt from './circle/CirclePrompt.svelte';
  import debounce from 'lodash/debounce'

  let prompts = {
  };

  let weights = {
  };

  let scaling = 10;

  let activePrompt = null;
  let value = "Minimalistic retro 80s Japanese album art::20 Minimalistic abstract geometric design::5 80s japanese movie posters::30 Minimalistic photography by Gregory Crewdson with japanese typography::50 Retro japanese typography::10 Formicapunk, cassette futurism.::30";
  $: currentPromptData = [...parsePrompts(value)].reduce((acc, { prompt, weight }, idx) => {
    const id = idx;
    acc[id] = { id, text: prompt, parsedWeight: weight };
    return acc;
  }, {});

  function parsePrompt(prompt) {
    let parsed = prompt.split("::");
    let promptText = parsed[0];
    let promptWeight = parsed[1];
    return {text: promptText, weight: promptWeight};
  }
  
  function parsePrompts(input) {
    const promptWeightPairs = [];
    const regex = /((?:[^:]+|:(?!:))+)(?:::(\d+(?:\.\d+)?))?(?=\s|$)/g;
    let match;

    while ((match = regex.exec(input)) !== null) {
      const prompt = match[1].trim();
      const weight = match[2] ? parseFloat(match[2], 10) : 1;
      if(prompt) {
        promptWeightPairs.push({ prompt, weight });
      }
    }

    return promptWeightPairs;
  }

  function handleWeightChange(weightsById) {
    console.log("weightsById, ", weightsById);

    weights = weightsById;

    if(Object.entries(weights).length === Object.entries(currentPromptData).length) {
      value = Object.entries(weights).reduce((acc, [id, weight]) => {
        const prompt = currentPromptData[id].text;
        acc.push(`${prompt}::${weight}`);
        return acc;
      }, []).join(" ");
    }
  }


  afterUpdate(() => {
		console.log(currentPromptData);
	});

  function copyToClipboard () {
    navigator.clipboard.writeText(value);
  };

  const handlePromptChange = debounce((e) => {
    console.log(e.target.value)
    value = e.target.value;
  }, 500);


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
      <div class="w-full h-full">
        <CirclePrompt points={currentPromptData} handleWeightChange={handleWeightChange} scaling={scaling}/>
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