<script setup>
import PrimaryInput from '@/components/ChatComponents/PrimaryInput.vue';
import MainAIChatView from './MainAIChatView.vue';
import UploadedFilesSection from './UploadedFilesSection.vue';

import { storeToRefs } from 'pinia';
import { ref, inject, computed, onMounted } from 'vue';
import { useChatbotStore } from '@/stores/chatbot.store';

const chatbotStore = useChatbotStore();

const { currentConversationId, conversationList, isStreamingGenerationInProgress, currentStreamAbortController } =
  storeToRefs(chatbotStore);

const { convertAndResizeImageToBase64, startAiAgentResponseStreaming } = chatbotStore;

const messageInput = ref('');
const uploadedFiles = ref([]);
const appImages = inject('appImages');

const promptInputPlaceholder = computed(() => {
  return `Type or say what you need… (e.g., 'Summarize today's tasks')`;
});

// Dummy conversation data for testing
const dummyConversations = ref([
  //   {
  //     _id: 1757162514777,
  //     role: "user",
  //     message: "Hi there! Can you help me with a Vue.js project?",
  //     uploadedFiles: []
  //   },
  //   {
  //     _id: 1757162514778,
  //     role: "assistant",
  //     message: "Hello! I'd be happy to help you with your Vue.js project. What specific aspect would you like assistance with? Whether it's component structure, state management, routing, or any other Vue.js topic, I'm here to help!",
  //     thinking: false,
  //     isGenerating: false,
  //     identifying: false,
  //     generatedImages: []
  //   },
  //   {
  //     _id: 1757162514779,
  //     role: "user",
  //     message: "I'm working on a chat application and need to implement real-time messaging. What's the best approach?",
  //     uploadedFiles: []
  //   },
  //   {
  //     _id: 1757162514780,
  //     role: "assistant",
  //     message: "Great question! For real-time messaging in a Vue.js chat application, here are the most effective approaches:\n\n## WebSocket Solutions\n1. **Socket.io** - Most popular choice with excellent Vue integration\n2. **Native WebSockets** - Lightweight but requires more manual handling\n3. **Server-Sent Events (SSE)** - Good for one-way communication\n\n## Implementation Steps\n1. Set up WebSocket connection in your Vue app\n2. Create a composable for message handling\n3. Implement message state management (Pinia recommended)\n4. Handle connection states and reconnection logic\n\nWould you like me to show you a specific implementation example?",
  //     thinking: false,
  //     isGenerating: false,
  //     identifying: false,
  //     generatedImages: []
  //   },
  //   {
  //     _id: 1757162514781,
  //     role: "user",
  //     message: "Yes, please show me a Socket.io example with Vue 3 and Pinia!",
  //     uploadedFiles: []
  //   },
  //   {
  //     _id: 1757162514782,
  //     role: "assistant",
  //     message: "Perfect! Here's a complete Socket.io implementation with Vue 3 and Pinia:\\n\\n```javascript\\n// stores/chat.store.js\\nimport { defineStore } from 'pinia'\\nimport { io } from 'socket.io-client'\\n\\nexport const useChatStore = defineStore('chat', {\\n  state: () => ({\\n    socket: null,\\n    messages: [],\\n    isConnected: false\\n  }),\\n  \\n  actions: {\\n    initSocket() {\\n      this.socket = io('http://localhost:3001')\\n      \\n      this.socket.on('connect', () => {\\n        this.isConnected = true\\n      })\\n      \\n      this.socket.on('message', (message) => {\\n        this.messages.push(message)\\n      })\\n    }\\n  }\\n})\\n```\\n\\nThis gives you a solid foundation for real-time messaging!",
  //     thinking: false,
  //     isGenerating: false,
  //     identifying: false,
  //     generatedImages: []
  //   }
]);

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
        // ✅ Convert & resize image, return {file, base64}
        return await convertAndResizeImageToBase64(file);
      }
      // Non-images: keep file but no preview
      return { file, base64: null };
    })
  );

  // Step 2: prepare previews
  const previews = processedFiles.map(({ file, base64, isImage, originalName }) => ({
    _id: crypto.randomUUID(),
    preview: base64, // base64 only for images
    type: isImage ? 'png' : file.type.split('/')[1] || 'unknown', // keep real extension for non-images
    fileType: file.type,
    url: null,
    file,
    fileName: file.name,
    // icon: getFileIconByFileType(file.type),
    // icon: "file-icon",
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

function handleSubmitMessage(message) {
  const filesToSend = [...uploadedFiles.value]; // snapshot before clearing
  const msg = message;

  startAiAgentResponseStreaming({
    conversation_id: currentConversationId.value,
    message: msg,
    uploadedFiles: filesToSend,
  });

  console.log('Message submitted:', msg, 'Files:', filesToSend);

  uploadedFiles.value = [];
  messageInput.value = '';
}

function handlePauseResponse() {
  currentStreamAbortController.value?.abort();
  const lastMessage = conversationList.value[conversationList.value.length - 1];
  lastMessage.isGenerating = false;
  lastMessage.thinking = false;
}
</script>

<template>
  <div class="chat-component-middle-section-wrapper">
    <!-- :class="{ inConversation: conversationList?.length }" -->
    <div class="chat-agent-main-wrapper">
      <div v-if="conversationList?.length || dummyConversations?.length" class="chat-messages-view">
        <MainAIChatView :chats="conversationList?.length ? conversationList : dummyConversations" />
      </div>
      <div v-else class="initial-header-wrapper">
        <div class="main-agent-icon">
          <img :src="appImages['aiAssistantLogo.svg']" class="ai-logo-img" />
        </div>
        <div class="agent-greet-title">Hey Bro!</div>
        <div class="agent-greet-subtitle">What do you want to do today?</div>
      </div>
      <div class="prompt-input-wrapper">
        <transition name="uploaded-files-transition">
          <!-- <div
            class="upload-file-section-wrapper"
            v-if="uploadedFiles.length"
            :class="{ 'absolute-positioned': conversationList.length }"
          >
            <UploadedFilesSection
              v-if="uploadedFiles.length"
              :uploaded-files="uploadedFiles"
              @file:remove="handleRemoveUploadedFile"
            />
          </div> -->
        </transition>

        <PrimaryInput
          :textarea-placeholder="promptInputPlaceholder"
          :dropdown-suggestions="dropdownSuggestions"
          :hideSuggestionsDropdown="conversationList?.length"
          :inProgress="isStreamingGenerationInProgress || false"
          @files-selected="handleFilesSelected"
          @submit:message="handleSubmitMessage"
          @pause-response="handlePauseResponse"
          v-model="messageInput"
        />
      </div>
    </div>
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
  padding: 1rem;
  max-width: 56.25rem;
  transition: all 0.5s ease;
  overflow: auto;
  &.inConversation {
    // padding-right: 0;
    .prompt-input-wrapper {
      // padding-right: 6.25rem;
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
