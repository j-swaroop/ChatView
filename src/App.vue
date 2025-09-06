<script setup>
import { RouterView, useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useCommon } from '@/stores/common.store.js';
import { useRemIndicator } from '@/composables/remIndicatorComposable';
import CircularProgressBar from '@/components/sharedComponents/CircularProgressBar.vue';

const useCommonStore = useCommon();
let { commonLoaderState } = storeToRefs(useCommonStore);

const route = useRoute();
const init = () => {
  // Call any API call here that needs to happen on app initialization
};

// Initialize REM indicator functionality
const { remIndicatorRef } = useRemIndicator();

init();
</script>

<template>
  <div class="app-wrapper">
    <RouterView :key="route.fullPath" />
    <CircularProgressBar v-if="commonLoaderState"></CircularProgressBar>
  </div>
  <div id="remIndicator" ref="remIndicatorRef"></div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Unbounded:wght@200..900&family=Work+Sans:ital,wght@0,100..900;1,100..900&display=swap');

.app-wrapper {
  height: 100%;
  width: 100%;
}

#remIndicator {
  position: absolute;
  top: -10000px;
  left: -10000px;
  background: transparent;
  opacity: 0;
  width: 1rem;
  height: 1rem;
  z-index: 1;
  pointer-events: none;
  visibility: hidden;
}
</style>
