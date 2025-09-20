<script setup>
import { ref, watch, nextTick, toRefs, computed, onBeforeUnmount, inject } from 'vue';
// import UploadedFilesSection from "./UploadedFilesSection.vue";
import CustomMarkdown from '../MarkdownComponent/CustomMarkdown.vue';
import SentMessageMarkdown from '../MarkdownComponent/SentMessageMarkdown.vue';

const props = defineProps({
  chats: {
    type: Array,
    default: () => [],
  },
});

const appImages = inject('appImages');

const { chats } = toRefs(props);

const chatWrapperRef = ref(null);
const lastMessageRef = ref(null);

//--------------------------------------------------------------------------------------------
const elapsed = ref(0); // Accurate in decimals
const elapsedTime = ref(0); // In whole seconds for messaging
let intervalId = null;
let startTime = null;

const hasLoadingBlocks = computed(() => {
  return chats.value?.some((chat) => chat?.generatedImages?.some((item) => item.isSkeleton));
});

watch(
  () => hasLoadingBlocks.value,
  (newVal) => {
    if (newVal) {
      startTime = Date.now();
      intervalId = setInterval(() => {
        const now = Date.now();
        const seconds = (now - startTime) / 1000;
        elapsed.value = +seconds.toFixed(1);
        elapsedTime.value = Math.floor(seconds);

        if (elapsed.value >= 60) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }, 100);
    } else {
      clearInterval(intervalId);
      intervalId = null;
      elapsed.value = 0;
      elapsedTime.value = 0;
      startTime = null;
    }
  }
);

onBeforeUnmount(() => {
  clearInterval(intervalId);
});

const getThinkingText = computed(() => {
  if (elapsedTime.value < 10) {
    return 'AlterSquare ai thinking...';
  } else if (elapsedTime.value < 25) {
    return 'Processing the image...';
  } else if (elapsedTime.value < 50) {
    return 'Generating the image...';
  } else {
    return 'Almost there...';
  }
});

const getImageProcessingTimeText = computed(() => {
  return elapsed.value >= 60 ? 'Almost there..' : `${elapsed.value.toFixed(1)}/60s`;
});

//--------------------------------------------------------------------------------------------
</script>

<template>
  <div class="main-ai-chat-view-wrapper" ref="chatWrapperRef" :class="{ bottomSpacing: chats.length > 2 }">
    <div class="messages-container">
      <div
        v-for="(chat, index) in chats"
        :key="chat._id"
        class="message-container"
        :class="[chat.role]"
        :ref="index === chats.length - 1 ? lastMessageRef : null"
        :id="chat._id"
      >
        <div v-if="chat.role === 'assistant'" class="agent-icon">
          <img :src="appImages['aiAssistantLogo.svg']" />
        </div>
        <div class="message-content">
          <div v-if="chat?.identifying || chat?.thinking" class="thinking-text-wrapper">
            <div class="thinking-text">
              {{ chat?.identifying ? 'Identifying...' : chat?.thinking ? getThinkingText : '' }}
            </div>
          </div>

          <div v-if="chat?.error" class="error-message">
            {{ 'Failed to generate response. Please try again.' }}
          </div>
          <!-- <UploadedFilesSection
          v-if="chat?.uploadedFiles?.length"
          :uploaded-files="chat?.uploadedFiles"
          :hide-remove-file-icon="true"
        /> -->
          <div v-if="chat?.generatedImages?.length" class="generated-images-wrapper">
            <div class="generated-images">
              <div
                v-for="image in chat.generatedImages"
                :key="image"
                class="generated-image-block"
                :class="{ skeleton: image?.isSkeleton }"
              >
                <div v-if="image?.isSkeleton" class="timer-wrapper">
                  <div class="dots">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                  </div>
                  <div class="time-text">
                    {{ getImageProcessingTimeText }}
                  </div>
                </div>
                <img v-if="image.url" class="generated-img" :src="image.url" />
              </div>
            </div>
          </div>

          <div v-if="chat.role === 'assistant'" class="text-message">
            <CustomMarkdown :content="chat.message" />
          </div>
          <div v-else class="text-message">
            <SentMessageMarkdown :content="chat.message" />
          </div>
          <div v-if="chat?.analyzing" class="thinking-text-wrapper">
            <div class="thinking-text">
              {{ 'Analyzing this image...' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// ::-webkit-scrollbar {
//   display: none;
// }
.main-ai-chat-view-wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: flex-start;
  overflow: auto;
  overflow-x: hidden;
  // padding-right: 6.25rem;
  gap: 1rem;
  scroll-behavior: smooth;
  .messages-container {
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    justify-content: flex-start;
    height: 100%;
    width: 100%;
    max-width: 56.25rem;
    gap: 1rem;
    padding: 1rem 0;

    &.bottomSpacing {
      // padding-bottom: 58vh;
    }

    .message-container {
      width: 100%;
      display: flex;
      flex-flow: row nowrap;
      align-items: flex-start;
      .agent-icon {
        display: flex;
        flex-flow: row nowrap;
        place-items: center;
        img {
          width: 2.5rem;
          height: 2.5rem;
          flex-shrink: 0;
        }
      }
      &.user {
        justify-content: flex-end;
        .message-content {
          max-width: 50%;
          width: auto;
          .text-message {
            background: #f9fafb;
            color: var(--gray-600, #4b5563);
            font-family: Nunito;
            font-size: 1rem;
            font-style: normal;
            font-weight: 400;
            line-height: normal;
            text-wrap: wrap;
            word-break: normal;
          }
        }
      }
      &.assistant {
        justify-content: flex-start;
        .message-content {
          max-width: 100%;
          justify-content: flex-start;
          .text-message {
            width: 100%;
            max-width: 100%;
            display: flex;
            flex-flow: row nowrap;
            justify-content: flex-start;
          }
        }
      }
      .message-content {
        display: flex;
        flex-flow: column nowrap;
        align-items: flex-end;
        gap: 0.5rem;
        .thinking-text-wrapper {
          width: 100%;
          display: flex;
          flex-flow: row nowrap;
          justify-content: flex-start;
          margin-top: 0.5rem;
          padding-left: 0.5rem;

          .thinking-text {
            background: linear-gradient(
              100deg,
              #3b82f6 0%,
              rgba(59, 130, 246, 0) 25%,
              #3b82f6 50%,
              rgba(59, 130, 246, 0) 75%,
              #3b82f6 100%
            );
            background-size: 400% auto;
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            color: transparent;
            font-family: Nunito;
            font-size: 1rem;
            font-style: normal;
            font-weight: 500;
            line-height: normal;

            /* ✨ Shimmer animation */
            animation: shimmer 20s linear infinite;
          }
        }

        .error-message {
          padding: 0.5rem;
          color: #ef4444;
          background: #ef44442e;
          border-radius: 0.25rem;
        }
        .generated-images-wrapper {
          width: 100%;
          overflow: hidden;
          padding: 0.5rem;
          .generated-images {
            display: flex;
            flex-flow: row nowrap;
            align-items: center;
            justify-content: flex-start;
            gap: 1rem;
            width: 100%;
            overflow-x: auto;
            .generated-image-block {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 14.6875rem;
              height: 14.6875rem;
              flex-shrink: 0;
              // aspect-ratio: 1/1;
              border-radius: 0.5rem;
              position: relative;
              &.skeleton {
                background: linear-gradient(
                  90deg,
                  rgba(249, 250, 251, 0) 0%,
                  rgba(173, 173, 173, 0.1) 50%,
                  rgba(95, 96, 97, 0) 100%
                );
                background-size: 400% auto;
                animation: shimmer 10s linear infinite;
              }
              .generated-img {
                height: 100%;
                width: 100%;
                object-fit: cover;
                border-radius: inherit;
              }
              .timer-wrapper {
                position: absolute;
                z-index: 9;
                top: 8px;
                right: 8px;
                background: #fff;
                display: flex;
                padding: 8px 10px;
                justify-content: center;
                align-items: center;
                gap: 4px;
                color: #6c6c6c;
                text-align: right;
                font-family: Nunito;
                font-size: 0.75rem;
                font-style: normal;
                font-weight: 500;
                line-height: 16px; /* 133.333% */
                .dots {
                  gap: 2px;
                  .dot {
                    background: #f9fafb;
                    height: 2px;
                    width: 2px;
                  }
                }
              }
            }
          }
        }

        .text-message {
          display: inline-block; // ✅ keeps width independent of other siblings
          max-width: 100%; // ✅ prevents overflow
          color: var(--gray-600, #4b5563);
          font-family: Nunito;
          font-size: 1rem;
          font-style: normal;
          font-weight: 400;
          line-height: normal;
          padding: 0.625rem 0.875rem;
          border-radius: 1rem;
          width: fit-content; // ✅ bubble wraps only around its text
          :deep(*) {
            user-select: text;
          }
        }
      }
    }
  }
}

.dots {
  display: flex;
  align-items: center;
  gap: 3px;

  .dot {
    &:not(:last-child) {
      margin-right: 2px;
    }
    height: 0.375rem;
    width: 0.375rem;
    border-radius: 6.25rem;
    background: rgba(0, 0, 0, 0.2);
    animation: pulse 1s infinite ease-in-out;

    &:nth-child(1) {
      animation-delay: 0s;
    }
    &:nth-child(2) {
      animation-delay: 0.1s;
    }
    &:nth-child(3) {
      animation-delay: 0.2s;
    }
    &:nth-child(4) {
      animation-delay: 0.3s;
    }
  }

  @keyframes pulse {
    0%,
    20%,
    100% {
      transform: scale(1) translateY(0);
      opacity: 0.6;
      background-color: rgba(0, 0, 0, 0.2);
    }
    50% {
      transform: scale(1.2) translateY(-0.125rem);
      opacity: 1;
      background-color: #000;
    }
  }
}

@keyframes shimmer {
  0% {
    background-position: 400% center;
  }
  100% {
    background-position: -400% center;
  }
}
</style>
