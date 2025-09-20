<script setup>
import ChatViewWrapper from '@/components/ChatComponents/ChatViewWrapper.vue';
</script>

<template>
  <div class="home-page-wrapper">
    <ChatViewWrapper />
  </div>
</template>

<style scoped lang="scss">
.home-page-wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #f2f1eb;
}
</style>
