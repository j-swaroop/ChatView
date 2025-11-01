<script setup>
import PrimaryInput from '@/components/ChatComponents/PrimaryInput.vue';
import MainAIChatView from './MainAIChatView.vue';
import UploadedFilesSection from './UploadedFilesSection.vue';
import FullScreenImageViewer from './FullScreenImageViewer.vue';
import RotationAnimation from './RotationAnimation.vue';

import { storeToRefs } from 'pinia';
import { ref, inject, computed, onMounted } from 'vue';
import { useChatbotStore } from '@/stores/chatbot.store';

const chatbotStore = useChatbotStore();

const {
  currentConversationId,
  conversationList,
  isStreamingGenerationInProgress,
  currentStreamAbortController,
  currentSelectedImageForFullView,
} = storeToRefs(chatbotStore);

const { convertAndResizeImageToBase64, startAiAgentResponseStreaming, openFullScreenImageViewer, downloadImage } =
  chatbotStore;

const messageInput = ref('');
const uploadedFiles = ref([]);
const selectedReferringText = ref('');
const appImages = inject('appImages');

const promptInputPlaceholder = computed(() => {
  return `Type or say what you need… (e.g., "Help me write a professional email")`;
});

const dropdownSuggestions = computed(() => {
  return [
    'Help me write a professional email',
    'Create a project timeline for my team',
    'Generate ideas for a presentation',
    'Summarize the latest industry trends',
    'Draft a meeting agenda',
    'Write a code review checklist',
    'Create a budget breakdown',
    'Plan a team building activity',
    'Generate creative content ideas',
  ].filter((item) => {
    return item.toLowerCase().includes(messageInput.value.toLowerCase());
  });
});

async function handleFilesSelected(files) {
  const filesArray = [...files];
  console.log(filesArray, 'files array');

  // Step 1: convert/resize images before preparing previews
  const processedFiles = await Promise.all(
    filesArray.map(async (file) => {
      if (file.type.startsWith('image/')) {
        const { base64, originalName } = await convertAndResizeImageToBase64(file);
        return { file, base64, isImage: true, originalName };
      }
      return { file, base64: null, isImage: false, originalName: file.name };
    })
  );

  // Step 2: prepare previews with isUploading=true (push early so UI shows skeleton)
  const previews = processedFiles.map(({ file, base64, isImage }) => ({
    _id: crypto.randomUUID(),
    preview: base64,
    type: isImage ? 'png' : file.type.split('/')[1] || 'unknown',
    fileType: file.type,
    url: null,
    file,
    fileName: file.name,
    // icon: getFileIconByFileType(file.type),
    isUploading: true, // ✅ show skeleton
  }));

  uploadedFiles.value.push(...previews);

  // Step 3: get signed URLs
  // const signedUrls = await Promise.all(
  //   processedFiles.map(async ({ file }) => {
  //     const signedUrl = await getSignedUrl(file);
  //     const success = await uploadFileUsingSignedUrl({ file }, signedUrl);
  //     if (success && success.status === 200) {
  //       const u = new URL(signedUrl);
  //       return u.origin + u.pathname;
  //     }
  //   })
  // );

  // Step 4: assign URLs
  // previews.forEach((item, idx) => {
  //   item.url = signedUrls[idx];
  // });

  console.log(uploadedFiles.value, '✅ final file objects');
}

function handleRemoveUploadedFile(index) {
  uploadedFiles.value.splice(index, 1);
}

function handleUploadedFileClicked(file) {
  if (file.fileType.startsWith('image/')) {
    const fileToShow = file.url || file.preview;
    openFullScreenImageViewer(fileToShow);
  } else {
  }
}

function handleSubmitMessage(message) {
  const filesToSend = [...uploadedFiles.value]; // snapshot before clearing
  const msg = message;

  startAiAgentResponseStreaming({
    conversation_id: currentConversationId.value,
    message: msg,
    uploadedFiles: filesToSend,
    referenceText: selectedReferringText.value,
  });

  console.log('Message submitted:', msg, 'Files:', filesToSend);

  uploadedFiles.value = [];
  messageInput.value = '';
  selectedReferringText.value = '';
}

function handlePauseResponse() {
  currentStreamAbortController.value?.abort();
  const lastMessage = conversationList.value[conversationList.value.length - 1];
  lastMessage.isGenerating = false;
  lastMessage.thinking = false;
}

function handleAskSelection(content) {
  selectedReferringText.value = content;
}
</script>

<template>
  <div class="chat-component-middle-section-wrapper">
    <!-- :class="{ inConversation: conversationList?.length }" -->
    <div
      class="animation-bg"
      :class="{
        animate: conversationList.some((chat) => chat?.isGenerating) || isStreamingGenerationInProgress,
        long: conversationList.length,
      }"
    >
      <div class="animation-container"></div>
    </div>
    <div class="chat-agent-main-wrapper">
      <div v-if="conversationList?.length" class="chat-messages-view">
        <MainAIChatView :chats="conversationList" @askSelection="handleAskSelection" />
      </div>
      <div v-else class="initial-header-wrapper">
        <div class="main-agent-icon">
          <RotationAnimation
            :duration="3"
            primaryColor="#60a5fa"
            secondaryColor="#3b82f6"
            backgroundColor="#dbeafe"
            class="ai-logo-img"
          />
        </div>
        <div class="agent-greet-title">Hey Bro!</div>
        <div class="agent-greet-subtitle">What do you want to do today?</div>
      </div>

      <div class="prompt-input-wrapper">
        <transition name="uploaded-files-transition">
          <div
            class="upload-file-section-wrapper"
            v-if="uploadedFiles.length"
            :class="{ 'absolute-positioned': conversationList.length }"
          >
            <UploadedFilesSection
              v-if="uploadedFiles.length"
              :uploaded-files="uploadedFiles"
              @file:clicked="handleUploadedFileClicked"
              @file:remove="handleRemoveUploadedFile"
            />
          </div>
        </transition>

        <PrimaryInput
          v-model="messageInput"
          :textarea-placeholder="promptInputPlaceholder"
          :dropdown-suggestions="dropdownSuggestions"
          :hideSuggestionsDropdown="conversationList?.length"
          :inProgress="isStreamingGenerationInProgress"
          :short="conversationList.length"
          :referred-text="selectedReferringText"
          @files-selected="handleFilesSelected"
          @submit:message="handleSubmitMessage"
          @pause-response="handlePauseResponse"
          @remove-reference="selectedReferringText = ''"
        />
      </div>
    </div>
    <FullScreenImageViewer
      v-if="currentSelectedImageForFullView"
      :current-selected-image-for-full-view="currentSelectedImageForFullView"
      @downloadImage="downloadImage"
      @fullScreenViewerClose="openFullScreenImageViewer"
    />
  </div>
</template>

<style lang="scss" scoped>
.chat-component-middle-section-wrapper {
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  // padding: 1rem;
  // max-width: 56.25rem;
  transition: all 0.5s ease;
  overflow: auto;
  position: relative;
  .animation-bg {
    position: absolute;
    width: 100%;
    height: 100%;
    bottom: 0;
    left: 0;
    display: flex;
    justify-content: center;
    overflow: hidden;
    pointer-events: none;
    .animation-container {
      position: absolute;
      bottom: 0;
      background: linear-gradient(to right, #93c5fd, #bfdbfe, #ddd6fe);
      filter: blur(5rem);
      height: 4rem;
      width: 100%;
      transform: translateY(5rem);
      transition: all 1s ease;
      background-size: 200% 200%; /* make gradient larger for smooth motion */
      background-position: center;
    }
    &.long {
      .animation-container {
        height: 5.5rem;
      }
    }
    &.animate {
      .animation-container {
        animation: breathingAnimation 5s ease-in-out infinite;
        filter: blur(100px);
      }
    }
    @keyframes breathingAnimation {
      from {
        height: 8.4375rem;
        background-position: 0% 50%;
        transform: translateY(5rem) translateX(-15%) scaleY(0.8);
        border-radius: 50% 30% 60% 40%;
      }
      to {
        height: 16.4375rem;
        background-position: 100% 50%;
        transform: translateY(3rem) translateX(15%) scaleY(1.2);
        border-radius: 40% 60% 30% 50%;
      }
    }
  }
}
.chat-agent-main-wrapper {
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  transition: all 0.5s ease;

  .chat-messages-view {
    height: 100%;
    width: 100%;
    overflow: hidden;
    // animation: maximizeHeight 1s ease;
    // @keyframes maximizeHeight {
    //   from {
    //     height: 50%;
    //   }
    //   to {
    //     height: 100%;
    //   }
    // }
  }
  .initial-header-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 4rem;
    .main-agent-icon {
      // padding-bottom: 1rem;
      .ai-logo-img {
        border-radius: 50%;
        position: relative;
        z-index: 2;
        height: 4rem;
        width: 4rem;
      }
    }
    .agent-greet-title {
      color: var(--gray-600, #4b5563);
      text-align: center;
      font-size: 1.5rem;
      font-style: normal;
      font-weight: 400;
      line-height: normal;
      padding-bottom: 0.5rem;
    }
    .agent-greet-subtitle {
      color: var(--gray-600, #4b5563);
      text-align: center;
      font-size: 0.875rem;
      font-style: normal;
      font-weight: 400;
      line-height: normal;
    }
  }
  .prompt-input-wrapper {
    display: flex;
    flex-flow: column;
    align-items: flex-start;
    justify-content: center;
    width: 100%;
    transition: all 0.5s ease;
    position: relative;
    max-width: 56.25rem;
    padding: 1rem 0;
    padding-top: 0;
    .upload-file-section-wrapper {
      width: 100%;
      &.absolute-positioned {
        position: absolute;
        top: -5rem;
        left: 0;
        width: 100%;
        z-index: 99;
      }
    }
  }
}

.uploaded-files-transition-enter-active,
.uploaded-files-transition-leave-active {
  transition:
    max-height 0.5s ease,
    opacity 0.3s ease,
    margin 0.3s ease;
}

.uploaded-files-transition-enter-from,
.uploaded-files-transition-leave-to {
  max-height: 0;
  opacity: 0;
  margin: 0;
}

.uploaded-files-transition-enter-to,
.uploaded-files-transition-leave-from {
  max-height: 5rem; // adjust depending on expected max
  opacity: 1;
  margin: 1rem 0; // match your actual spacing
}
</style>
