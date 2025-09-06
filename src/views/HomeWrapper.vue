<script setup>
import { inject } from 'vue';

const rem = inject('remToPixel');

</script>

<template>
  <div class="home-page-wrapper">
    {{ rem }}
  </div>
</template>

<style scoped lang="scss">
.home-page-wrapper {
  height: 100%;
  width: 100%;
  display: grid;
  overflow: hidden;
  color: $color-red;
}
</style>
