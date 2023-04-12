<script lang="ts">
    import type { SlotSet } from "../types";
    import { v4 as uuidv4 } from "uuid";
    import { slotSets } from "../stores/slotSets.js";
    import debounce from "lodash/debounce";
    import { getSlotAlias, validateSlotName } from "$lib/slots";

    let activeSlotSetId: string | null = null;
    let slotName = "";
    let newSlotText = "";
    let activeSlotSet: SlotSet | null = null;

    $: {
        handleSlotSetChange(activeSlotSetId);
    }

    function handleSlotSetChange(id: string | null) {
        activeSlotSet =
            id && id !== "new"
                ? { ...$slotSets[id] }
                : id === "new"
                ? ({ name: "New Slot Set", values: [] } as SlotSet)
                : null;

        slotName = activeSlotSet ? activeSlotSet.name : "";
    }

    function checkNameAvailability(name: string) {
        const nameAvailable = Object.values($slotSets).every(
            (slotSet: SlotSet) => slotSet.name !== name
        );

        return nameAvailable;
    }

    function saveSlotSet() {
        if (!activeSlotSet) return;
        if (activeSlotSetId && activeSlotSetId !== "new") {
            slotSets.update(activeSlotSetId, {
                ...activeSlotSet,
                name: slotName,
            });
        } else {
            // make sure name is free
            const nameAvailable = checkNameAvailability();

            if(!nameAvailable) {
                alert("Name already in use");
                return;
            }

            const id = uuidv4();
            slotSets.update(id, {
                ...activeSlotSet,
                name: slotName,
            });
            activeSlotSetId = id;
        }
    }

    function deleteSlotSet() {
        slotSets.delete(activeSlotSetId);
        slotName = "";
        newSlotText = ""
        activeSlotSetId = null;
        activeSlotSet = null;
    }

    const handleSinglePromptChange = debounce((idx, text) => {
        if (!activeSlotSet || !activeSlotSetId) return;
        const newSlots = [...activeSlotSet.values];

        if(text.length === 0) {
            newSlots.splice(idx, 1);
        } else {
            newSlots[idx] = text;
        }

        activeSlotSet.values = newSlots;

        if(activeSlotSetId !== "new") slotSets.update(activeSlotSetId, activeSlotSet);
    }, 1000);

    const handleNewSlotChange = debounce((text) => {
        if (!activeSlotSet || !activeSlotSetId) return;
        const newSlots = [...activeSlotSet.values];

        if(text.length > 0) {
            newSlots.push(text);

            activeSlotSet.values = newSlots;
            newSlotText = "";

            if(activeSlotSetId !== "new") slotSets.update(activeSlotSetId, activeSlotSet);
        }
    }, 1000);
</script>

<div
    class="h-full p-2 w-full bg-base-100 overflow-y-auto text-base-content inline-block"
>
    <div class="flex justify-center">
        <div class="form-control w-full max-w-xs mb-4">
            <label class="label">
                <span class="label-text">Edit Slots</span>
            </label>
            <select bind:value={activeSlotSetId} class="select select-bordered">
                <option disabled selected={activeSlotSetId === null}
                    >Pick one</option
                >
                {#each Object.entries($slotSets) as [id, data] (id)}
                    <option value={id} selected={activeSlotSetId === id}
                        >{data.name}</option
                    >
                {/each}
                <option value="new" selected={activeSlotSetId === "new"}
                    >New</option
                >
            </select>
        </div>
    </div>
    {#if activeSlotSetId}
        <div class="w-full p-2 flex justify-between">
            <div class="flex flex-col w-full pr-2 ">
                <input
                    bind:value={slotName}
                    type="text"
                    placeholder="Name"
                    class="input input-bordered input-sm w-full max-w-xs"
                />
                <div class="tooltip tooltip-primary tooltip-bottom" data-tip="Use in prompts or directives to get random slot.">
                    <label class="label">
                        <span class="label-text">Alias: <b on:click={()=>navigator.clipboard.writeText(getSlotAlias(slotName))} class="text-white cursor-copy">{getSlotAlias(slotName)}</b></span>
                    </label>
                </div>
                {#if ((activeSlotSetId==="new" || (activeSlotSet && activeSlotSet.name !== slotName)) && !checkNameAvailability(slotName))}
                    <label class="label">
                        <span class="label-text text-orange-300">Name In Use</span>
                    </label>
                {/if}
            </div>
            <button on:click={saveSlotSet} class:btn-disabled={!validateSlotName(slotName) || ((activeSlotSetId==="new" || (activeSlotSet && activeSlotSet.name !== slotName)) && !checkNameAvailability(slotName))} class="btn btn-sm btn-primary"
                >Save</button
            >
        </div>
        <ul
            class="px-4 py-2 w-full bg-base-100 overflow-y-auto text-base-content inline-block"
        >
            {#if activeSlotSet}
                {#each activeSlotSet.values as text, idx (idx)}
                    <li class="p-1">
                        <input
                            value={text}
                            on:input={(e) =>
                                handleSinglePromptChange(idx, e.target.value)}
                            type="text"
                            placeholder=""
                            class="input input-bordered input-sm w-full"
                        />
                    </li>
                {/each}
            {/if}
            <li class="p-1">
                <input
                    bind:value={newSlotText}
                    type="text"
                    on:input={(e) => handleNewSlotChange(e.target.value)}
                    placeholder="Add slot"
                    class="input input-bordered input-sm w-full italic"
                />
            </li>
        </ul>
        <div class="w-full p-2 h-12 flex justify-between">
            <button on:click={deleteSlotSet} class="btn btn-sm btn-error ml-4"
                >Delete</button
            >
        </div>
    {/if}
</div>
