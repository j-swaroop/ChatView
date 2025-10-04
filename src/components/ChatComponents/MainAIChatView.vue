<script setup>
import { ref, watch, nextTick, toRefs, computed, onBeforeUnmount, inject } from 'vue';
import UploadedFilesSection from './UploadedFilesSection.vue';
import CustomMarkdown from '../MarkdownComponent/CustomMarkdown.vue';
import SentMessageMarkdown from '../MarkdownComponent/SentMessageMarkdown.vue';
import { useChatbotStore } from '@/stores/chatbot.store';

const chatbotStore = useChatbotStore();

const { downloadImage, openFullScreenImageViewer } = chatbotStore;

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

// const hasLoadingBlocks = computed(() => {
//   return chats.value?.some((chat) => chat?.generatedImages?.some((item) => item.isSkeleton));
// });

// ✅ Track only the last message in conversationsArray
const lastMessage = computed(() => {
  return chats.value?.[chats.value.length - 1] || null;
});

const hasLoadingBlocks = computed(() => {
  return lastMessage.value?.generatedImages?.some((item) => item.isSkeleton) || false;
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

function handleUploadedFileClicked(file) {
  if (file.fileType.startsWith('image')) {
    const fileToShow = file.url || file.preview;
    openFullScreenImageViewer(fileToShow);
  } else {
  }
}
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

          <div v-if="chat?.uploadedFiles?.length" class="images-user-messages-block-wrapper">
            <UploadedFilesSection
              v-if="chat?.uploadedFiles?.length"
              :uploaded-files="chat?.uploadedFiles"
              :hide-remove-file-icon="true"
              @file:clicked="handleUploadedFileClicked"
            />
          </div>

          <div v-if="chat?.generatedImages?.length" class="generated-images-wrapper">
            <div class="generated-images">
              <div
                v-for="image in chat.generatedImages"
                :key="image"
                class="generated-image-block scale-animation"
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

                <div class="image-actions" v-if="!image?.isSkeleton && image?.url">
                  <div class="image-actions-left-side">
                    <!-- <div class="shop-btn"></div> -->
                  </div>
                  <div class="image-actions-right-side">
                    <div @click="editBtnClicked(image?.url)" class="edit-btn action">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M3.69332 13.0137C3.28666 13.0137 2.90666 12.8737 2.63332 12.6137C2.28666 12.287 2.11999 11.7937 2.17999 11.2604L2.42666 9.10036C2.47332 8.69369 2.71999 8.15369 3.00666 7.86036L8.47999 2.06702C9.84666 0.620358 11.2733 0.580358 12.72 1.94703C14.1667 3.31369 14.2067 4.74036 12.84 6.18703L7.36666 11.9804C7.08666 12.2804 6.56666 12.5604 6.15999 12.627L4.01332 12.9937C3.89999 13.0004 3.79999 13.0137 3.69332 13.0137ZM10.62 1.94036C10.1067 1.94036 9.65999 2.26036 9.20666 2.74036L3.73332 8.54036C3.59999 8.68036 3.44666 9.01369 3.41999 9.20703L3.17332 11.367C3.14666 11.587 3.19999 11.767 3.31999 11.8804C3.43999 11.9937 3.61999 12.0337 3.83999 12.0004L5.98666 11.6337C6.17999 11.6004 6.49999 11.427 6.63332 11.287L12.1067 5.49369C12.9333 4.61369 13.2333 3.80036 12.0267 2.66702C11.4933 2.15369 11.0333 1.94036 10.62 1.94036Z"
                          fill="#6B7280"
                        />
                        <path
                          d="M11.56 7.30022C11.5466 7.30022 11.5266 7.30022 11.5133 7.30022C9.4333 7.09356 7.75996 5.51356 7.43996 3.44689C7.39996 3.17356 7.58663 2.92023 7.85996 2.87356C8.1333 2.83356 8.38663 3.02023 8.4333 3.29356C8.68663 4.90689 9.9933 6.14689 11.62 6.30689C11.8933 6.33356 12.0933 6.58022 12.0666 6.85356C12.0333 7.10689 11.8133 7.30022 11.56 7.30022Z"
                          fill="#6B7280"
                        />
                        <path
                          d="M14 15.167H2C1.72667 15.167 1.5 14.9403 1.5 14.667C1.5 14.3937 1.72667 14.167 2 14.167H14C14.2733 14.167 14.5 14.3937 14.5 14.667C14.5 14.9403 14.2733 15.167 14 15.167Z"
                          fill="#6B7280"
                        />
                      </svg>
                    </div>
                    <div @click="downloadImage(image?.url)" class="download-btn action">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M7.91984 9.99406C7.79318 9.99406 7.66651 9.9474 7.56651 9.8474L5.85984 8.14073C5.66651 7.9474 5.66651 7.6274 5.85984 7.43406C6.05318 7.24073 6.37318 7.24073 6.56651 7.43406L7.91984 8.7874L9.27318 7.43406C9.46651 7.24073 9.78651 7.24073 9.97984 7.43406C10.1732 7.6274 10.1732 7.9474 9.97984 8.14073L8.27318 9.8474C8.17318 9.9474 8.04651 9.99406 7.91984 9.99406Z"
                          fill="#6B7280"
                        />
                        <path
                          d="M7.92188 9.94797C7.64854 9.94797 7.42188 9.7213 7.42188 9.44797V2.66797C7.42188 2.39464 7.64854 2.16797 7.92188 2.16797C8.19521 2.16797 8.42188 2.39464 8.42188 2.66797V9.44797C8.42188 9.7213 8.19521 9.94797 7.92188 9.94797Z"
                          fill="#6B7280"
                        />
                        <path
                          d="M8.0013 13.9544C4.56797 13.9544 2.16797 11.5544 2.16797 8.12109C2.16797 7.84776 2.39464 7.62109 2.66797 7.62109C2.9413 7.62109 3.16797 7.84776 3.16797 8.12109C3.16797 10.9678 5.15464 12.9544 8.0013 12.9544C10.848 12.9544 12.8346 10.9678 12.8346 8.12109C12.8346 7.84776 13.0613 7.62109 13.3346 7.62109C13.608 7.62109 13.8346 7.84776 13.8346 8.12109C13.8346 11.5544 11.4346 13.9544 8.0013 13.9544Z"
                          fill="#6B7280"
                        />
                      </svg>
                    </div>
                    <div @click="openFullScreenImageViewer(image?.url)" class="maximize-btn action">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path
                          d="M12.25 5.6875C12.0108 5.6875 11.8125 5.48917 11.8125 5.25V2.1875H8.75C8.51083 2.1875 8.3125 1.98917 8.3125 1.75C8.3125 1.51083 8.51083 1.3125 8.75 1.3125H12.25C12.4892 1.3125 12.6875 1.51083 12.6875 1.75V5.25C12.6875 5.48917 12.4892 5.6875 12.25 5.6875Z"
                          fill="white"
                        />
                        <path
                          d="M5.25 12.6875H1.75C1.51083 12.6875 1.3125 12.4892 1.3125 12.25V8.75C1.3125 8.51083 1.51083 8.3125 1.75 8.3125C1.98917 8.3125 2.1875 8.51083 2.1875 8.75V11.8125H5.25C5.48917 11.8125 5.6875 12.0108 5.6875 12.25C5.6875 12.4892 5.48917 12.6875 5.25 12.6875Z"
                          fill="white"
                        />
                        <path
                          d="M7.87745 6.56251C7.76661 6.56251 7.65578 6.52167 7.56828 6.43417C7.39911 6.26501 7.39911 5.98501 7.56828 5.81584L11.9433 1.44084C12.1124 1.27167 12.3924 1.27167 12.5616 1.44084C12.7308 1.61001 12.7308 1.89001 12.5616 2.05917L8.18661 6.43417C8.09911 6.52167 7.98828 6.56251 7.87745 6.56251Z"
                          fill="white"
                        />
                        <path
                          d="M1.75245 12.6875C1.64161 12.6875 1.53078 12.6467 1.44328 12.5592C1.27411 12.39 1.27411 12.11 1.44328 11.9408L5.81828 7.56584C5.98745 7.39667 6.26745 7.39667 6.43662 7.56584C6.60578 7.73501 6.60578 8.01501 6.43662 8.18417L2.06161 12.5592C1.97411 12.6467 1.86328 12.6875 1.75245 12.6875Z"
                          fill="white"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <img
                  v-if="image.url"
                  @click="openFullScreenImageViewer(image?.url)"
                  class="generated-img"
                  :class="{ animate: chat?.isGenerating }"
                  :src="image?.url"
                />
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
    // height: 100%;
    width: 100%;
    max-width: 56.25rem;
    gap: 1rem;
    padding: 2rem 0;
    // padding-bottom: 2rem;
    flex: 1 0 0;

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
              &.scale-animation {
                overflow: hidden;
                cursor: pointer;
                transition: all 0.35s ease;

                .generated-img {
                  transition: transform 0.35s ease;
                }

                &:hover {
                  .generated-img {
                    transform: scale(1.1);
                  }
                }
              }
              .image-actions {
                position: absolute;
                top: 0;
                left: 0;
                z-index: 2;
                width: 100%;
                opacity: 0;
                display: flex;
                flex-flow: row nowrap;
                align-items: center;
                justify-content: space-between;
                padding: 0.625rem;
                transition: opacity 0.25s ease;
                .image-actions-left-side {
                  .shop-btn {
                    color: var(--white, #fff);
                    font-family: Nunito;
                    font-size: 0.875rem;
                    font-style: normal;
                    font-weight: 500;
                    line-height: 0.875rem; /* 100% */
                    padding: 0.5rem 0.75rem;
                    border-radius: 6.25rem;
                    background: rgba(0, 0, 0, 0.2);
                    backdrop-filter: blur(20px);
                    cursor: pointer;
                    transition: all 0.25s ease;
                    &:hover {
                      background: #000;
                    }
                  }
                }
                .image-actions-right-side {
                  display: flex;
                  gap: 0.5rem;
                }

                .action {
                  width: 1.75rem;
                  height: 1.75rem;
                  flex-shrink: 0;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  backdrop-filter: blur(1.25rem);
                  border-radius: 100%;
                  cursor: pointer;
                  transition: all 0.25s ease;
                  background: #00000030;
                  svg {
                    height: 1rem;
                    width: 1rem;
                    transition: all 0.25s ease;

                    path {
                      fill: #fff;
                      transition: all 0.25s ease;
                    }
                  }

                  &:hover {
                    background: #000;
                  }
                }
              }
              &:hover {
                .image-actions {
                  opacity: 1;
                }
              }
              .generated-img {
                height: 100%;
                width: 100%;
                object-fit: cover;
                border-radius: inherit;
                cursor: pointer;
                &[lazy='loading'] {
                  background: linear-gradient(
                    90deg,
                    rgba(249, 250, 251, 0) 0%,
                    rgba(173, 173, 173, 0.1) 50%,
                    rgba(95, 96, 97, 0) 100%
                  );
                  background-size: 400% auto;
                  animation: shimmer 10s linear infinite;
                }
                &[lazy='loaded'] {
                  animation: fadeBlurReveal 0.1s ease-in;
                }
                &.animate {
                  animation: fadeBlurReveal 1.5s ease-in;
                  &[lazy='loaded'] {
                    animation: fadeBlurReveal 1.5s ease-in;
                  }
                }
                @keyframes fadeBlurReveal {
                  from {
                    filter: blur(10px);
                  }
                  to {
                    filter: none;
                  }
                }
              }

              .timer-wrapper {
                position: absolute;
                z-index: 9;
                top: 0.5rem;
                right: 0.5rem;
                background: #fff;
                display: flex;
                padding: 0.5rem 0.625rem;
                justify-content: center;
                align-items: center;
                gap: 0.25rem;
                color: #6c6c6c;
                text-align: right;
                font-family: Nunito;
                font-size: 0.75rem;
                font-style: normal;
                font-weight: 500;
                line-height: 1rem; /* 133.333% */
                .dots {
                  gap: 0.125rem;
                  .dot {
                    background: #f9fafb;
                    height: 0.125rem;
                    width: 0.125rem;
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
        .images-user-messages-block-wrapper {
          display: flex;
          flex-flow: row nowrap;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          .selected-image-edited-section {
            display: flex;
            flex-flow: row nowrap;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            .reference-icon {
              display: flex;
              flex-flow: row nowrap;
              align-items: center;
              justify-content: center;
              img {
                height: 2rem;
                width: 2rem;
              }
            }
            .selected-image {
              display: flex;
              flex-flow: row nowrap;
              align-items: center;
              justify-content: center;
              img {
                height: 3.5rem;
                width: 3.5rem;
                filter: brightness(0.8);
                border-radius: 0.5rem;
                object-fit: cover;
              }
            }
          }
        }
      }
    }
  }
}

.dots {
  display: flex;
  align-items: center;
  gap: 0.1875rem;

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
