<template>
  <div class="draggable-chatbox-wrapper">
    <div v-if="!isChatBoxVisible" class="fixed-bottom-right-icon" @click="handleIconClick">
      <div ref="iconWrapper" class="ai-logo-wrapper" @animationend="onIconAnimationEnd">
        <RotationAnimation
          :duration="3"
          primaryColor="#60a5fa"
          secondaryColor="#3b82f6"
          backgroundColor="#dbeafe"
          :class="getIconClass"
        />
        <div class="ai-logo-background"></div>
      </div>
    </div>
    <DraggableChatBox v-else ref="chatBoxRef" :is-visible="isChatBoxVisible" @close="handleChatBoxClose" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useChatbotStore } from '@/stores/chatbot.store';

import DraggableChatBox from './DraggableChatBox.vue';
import RotationAnimation from './RotationAnimation.vue';

const chatbotStore = useChatbotStore();
const { isChatBoxVisible } = storeToRefs(chatbotStore);

const isIconFading = ref(false);
const iconWrapper = ref(null);
const chatBoxRef = ref(null);

const handleIconClick = () => {
  isIconFading.value = true;
};

const onIconAnimationEnd = () => {
  if (isIconFading.value) {
    isChatBoxVisible.value = true;
    isIconFading.value = false;
  }
};

const handleChatBoxClose = () => {
  console.log('Closing chat box from wrapper');
  isChatBoxVisible.value = false;
};

const getIconClass = computed(() => {
  return isIconFading.value ? 'fade-out' : '';
});
</script>

<style lang="scss" scoped>
.draggable-chatbox-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  .fixed-bottom-right-icon {
    position: fixed;
    bottom: 2rem;
    right: 2.5rem;
    z-index: 2;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    animation: slideInFromBottom 0.5s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      .ai-logo-wrapper {
        transform: scale(1.1);
      }
    }

    &:active {
      transform: scale(0.95);
    }

    .ai-logo-wrapper {
      position: relative;
      cursor: pointer;
      transition: all 0.3s ease;
      &.pulsate {
        animation: pulsating 3s ease-in infinite forwards;
      }
      .fade-out {
        animation: fadeOut 0.5s ease-in forwards;
      }

      @keyframes pulsating {
        0% {
          transform: scale(0.9);
        }
        50% {
          transform: scale(1.1);
        }
        100% {
          transform: scale(0.9);
        }
      }

      .ai-logo-background {
        position: absolute;
        top: 0;
        left: -50%;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        z-index: -1;
        // opacity: 0.8;
        background: conic-gradient(
          from 180deg at 50% 50%,
          rgba(59, 130, 246, 0.4) 0deg,
          rgba(219, 234, 254, 0.4) 120.6000030040741deg,
          rgba(59, 130, 246, 0.4) 250.19999742507935deg,
          rgba(96, 165, 250, 0.4) 360deg
        );
        filter: blur(1rem);
        height: 5rem;
        width: 5rem;
      }
    }
  }

  // Animation for icon appearance
  @keyframes slideInFromBottom {
    from {
      opacity: 0;
      transform: translateY(2rem);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeOut {
    0% {
      opacity: 1;
      transform: scale(1) rotate(0deg);
    }
    100% {
      opacity: 0;
      transform: scale(2) rotate(360deg);
    }
  }
}
</style>
