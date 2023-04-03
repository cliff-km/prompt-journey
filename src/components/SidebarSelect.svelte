<script lang="ts">
  import { promptList } from '../lib/store.js';
  import pkg from 'lodash';
  const { orderBy } = pkg;

  export let selectNew = () => {};
  export let selectData = (data) => {};

</script>

<ul class="menu h-screen p-4 w-full bg-base-100 overflow-y-auto text-base-content inline-block">
    <li><a class="text-xs inline-block" on:click={selectNew}>New +</a></li>
    {#each orderBy($promptList, (i) => i[1].date, 'desc') as [promptId, data] (promptId)}
        <li><a class="text-xs inline-block" on:click={()=>selectData(data)}>{#each Object.entries(data.points) as [id, point]}{point.text}::<b>{point.parsedWeight}</b> {/each}</a></li>
    {/each}
</ul>