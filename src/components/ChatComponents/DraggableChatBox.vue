<template>
  <div
    v-show="isVisible"
    ref="chatBoxRef"
    class="draggable-chat-box"
    :class="{ minimize: minimizingBox }"
    :style="chatBoxStyles"
    @mousedown="startDrag"
  >
    <!-- Header with drag handle -->
    <div class="chat-box-header" @mousedown="startDrag">
      <div class="chat-box-title">Manage AI</div>
      <div class="close-and-edit-wrapper">
        <OTooltip v-if="!hideTooltip" content="Restart conversation" position="top" :showArrow="false">
          <div class="close-button" @click.stop="handleRestartConversation" @mousedown.stop>
            <svg
              class="refresh-button-svg"
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="13"
              viewBox="0 0 12 13"
              fill="none"
            >
              <path
                d="M11 6.5C11 9.26 8.76 11.5 6 11.5C3.24 11.5 1.555 8.72 1.555 8.72M1.555 8.72H3.815M1.555 8.72V11.22M1 6.5C1 3.74 3.22 1.5 6 1.5C9.335 1.5 11 4.28 11 4.28M11 4.28V1.78M11 4.28H8.78"
                stroke="#9CA3AF"
                stroke-width="0.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </OTooltip>
        <OTooltip v-if="!hideTooltip" content="Minimize" position="top" :showArrow="false">
          <div class="close-button" @click.stop="handleMinimizeChatBox" @mousedown.stop>
            <div class="minimize-line"></div>
          </div>
        </OTooltip>
      </div>
    </div>
    <!-- Content Area -->
    <ChatViewWrapper class="draggable-chat-box-content-area" />
  </div>
</template>

<script setup>
import { ref, defineEmits, defineProps, computed, onMounted, onUnmounted } from 'vue';

import ChatViewWrapper from './ChatViewWrapper.vue';
import OTooltip from './OTooltip.vue';

import { storeToRefs } from 'pinia';
import { useChatbotStore } from '@/stores/chatbot.store';

const chatbotStore = useChatbotStore();
const { conversationList } = storeToRefs(chatbotStore);

// Props
const props = defineProps({
  isVisible: {
    type: Boolean,
    default: true,
  },
});

// Emits
const emit = defineEmits(['close']);

// Reactive data
const chatBoxRef = ref(null);
const position = ref({ x: 0, y: 0 });
const isDragging = ref(false);
const dragOffset = ref({ x: 0, y: 0 });
const hasBeenOpened = ref(false);
const minimizingBox = ref(false);
const hideTooltip = ref(false);

// Computed styles
const chatBoxStyles = computed(() => {
  // If chat box has been opened before, use stored position
  if (hasBeenOpened.value) {
    // Common styles that don't change
    const commonStyles = {
      top: `${position.value.y}px`,
      //   cursor: isDragging.value ? "grabbing" : "grab",
      transform: isDragging.value ? 'rotate(0.5deg)' : 'none',
      transition: isDragging.value ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: isDragging.value
        ? '0 35px 70px -12px rgba(0, 0, 0, 0.35), 0 8px 32px rgba(81, 108, 224, 0.15)'
        : '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    };

    return {
      left: `${position.value.x}px`,
      ...commonStyles,
    };
  }

  // First time opening - use calculated bottom and right positioning
  const chatBoxWidth = 530; // chat box width from CSS
  const chatBoxHeight = 500; // chat box height from CSS
  const margin = 32; // 2rem margin

  // Normal positioning from the right
  const leftPosition = window.innerWidth - chatBoxWidth - margin;

  const bottomPosition = window.innerHeight - chatBoxHeight - margin;

  return {
    left: `${leftPosition}px`,
    top: `${bottomPosition}px`,
    // cursor: isDragging.value ? "grabbing" : "grab",
    transform: isDragging.value ? 'rotate(0.5deg)' : 'none',
    transition: isDragging.value ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: isDragging.value
      ? '0 35px 70px -12px rgba(0, 0, 0, 0.35), 0 8px 32px rgba(81, 108, 224, 0.15)'
      : '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  };
});

// Drag functionality
const startDrag = (event) => {
  // Only allow dragging from the header area
  if (!event.target.closest('.chat-box-header')) {
    return;
  }

  isDragging.value = true;
  const rect = chatBoxRef.value.getBoundingClientRect();

  // Mark as opened and capture current position
  if (!hasBeenOpened.value) {
    hasBeenOpened.value = true;
    // When transitioning from CSS right/bottom to left/top,
    // use the current rect position which represents the actual position
    position.value = {
      x: rect.left,
      y: rect.top,
    };
  } else {
    // If already opened, use the current rect position
    position.value = {
      x: rect.left,
      y: rect.top,
    };
  }

  dragOffset.value = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };

  event.preventDefault();
};

const onMouseMove = (event) => {
  if (!isDragging.value) return;

  const newX = event.clientX - dragOffset.value.x;
  const newY = event.clientY - dragOffset.value.y;

  // Keep within viewport bounds
  const maxX = window.innerWidth - chatBoxRef.value.offsetWidth;
  const maxY = window.innerHeight - chatBoxRef.value.offsetHeight;

  position.value = {
    x: Math.max(0, Math.min(newX, maxX)),
    y: Math.max(0, Math.min(newY, maxY)),
  };
};

const onMouseUp = () => {
  isDragging.value = false;
};

function handleMinimizeChatBox() {
  minimizingBox.value = true;
  hideTooltip.value = true;

  setTimeout(() => {
    minimizingBox.value = false;
    hideTooltip.value = false;

    emit('close');
  }, 400);
}

const handleRestartConversation = () => {
  // Restart conversation logic removed
  conversationList.value = [];
  // currentConversationId.value = '';
};

// Lifecycle hooks for event listeners
onMounted(() => {
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
});

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', onMouseUp);
});
</script>

<style scoped lang="scss">
.draggable-chat-box {
  position: fixed;
  display: flex;
  height: 31.25rem;
  width: 33.125rem;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  flex-shrink: 0;
  background: var(--white, #fff);
  border-radius: 1rem;
  box-shadow: 0 1.5625rem 3.125rem -0.75rem rgba(0, 0, 0, 0.25);
  z-index: 2;
  user-select: none;
  font-family: sans-serif;
  // will-change: transform;
  backface-visibility: hidden;
  transform-origin: center center;
  animation: scaleIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
  &.minimize {
    animation: minimize 0.4s ease-in-out forwards;
  }
  @keyframes minimize {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(200%) translateX(50%) scale(0.6);
      opacity: 0;
    }
  }
  .chat-box-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 0.0625rem solid #f0f0f0;
    cursor: grab;
    transition: all 0.2s ease;
    position: relative;
    width: 100%;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(81, 108, 224, 0.05) 0%, rgba(81, 108, 224, 0.02) 100%);
      opacity: 0;
      transition: opacity 0.3s ease;
      border-radius: 12px 12px 0 0;
    }

    &:hover::before {
      opacity: 1;
    }

    &:active {
      cursor: grabbing;
    }

    .chat-box-title {
      opacity: 0.8;
      color: #121212;
      font-size: 0.875rem;
      font-weight: 300;
      letter-spacing: 0.125rem;
    }

    .close-and-edit-wrapper {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      z-index: 2 !important;
      .close-button {
        border-radius: 0.3rem;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: all 0.35s ease;
        height: 1.125rem;
        width: 1.125rem;
        .minimize-line {
          width: 0.75rem;
          background: #9ca3af;
          height: 1px;
          // margin-top: 0.5rem;
        }
        svg {
          height: 100%;
          width: 100%;
          path {
            transition: all 0.35s ease;
          }
        }
        .refresh-button-svg {
          height: 80%;
          width: 90%;
        }
        &:hover {
          background-color: #f3f4f6;
          .close-button-svg {
            path {
              fill: #444444;
            }
          }
          .refresh-button-svg {
            path {
              stroke: #444444;
            }
          }
          .minimize-line {
            color: #000;
          }
        }
      }
    }
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes scaleIn {
  0% {
    opacity: 0;
    transform: scale(0.1);
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
  }
  100% {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 1.5625rem 3.125rem -0.75rem rgba(0, 0, 0, 0.25);
  }
}

// Slide-fade transition animations for title
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.1s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-50px);
}
</style>

<style lang="scss">
.draggable-chat-box-content-area {
  &.chat-component-middle-section-wrapper {
    .chat-agent-main-wrapper {
      justify-content: flex-end;
      .initial-header-wrapper {
        padding: 0;
        padding-bottom: 1.5rem;
      }
      .chat-messages-view {
        .main-ai-chat-view-wrapper {
          padding: 1rem;
        }
      }
      .prompt-input-wrapper {
        padding: 1rem;
        padding-top: 0;
      }
    }
  }
}
</style>
