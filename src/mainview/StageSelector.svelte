<script lang="ts">
    import { AppStage } from "../types";
    import { appStage, appStageStore } from "../stores/appStage";

    function selectStage(stage: AppStage) {
        appStageStore.update(stage);
    }
</script>

<div class="btn-group btn-group-horizontal w-full flex justify-end p-2">
    <button
        class="btn btn-sm"
        class:btn-active={$appStage === AppStage.Build}
        on:click={() => selectStage(AppStage.Build)}
    >
        Build
    </button>
    <!--<button
        class="btn btn-sm"
        class:btn-active={$appStage === AppStage.Concept}
        on:click={() => selectStage(AppStage.Concept)}
    >
        Concept
    </button>-->
    <button
        class="btn btn-sm"
        class:btn-active={$appStage === AppStage.History}
        on:click={() => selectStage(AppStage.History)}
    >
        History
    </button>
</div>