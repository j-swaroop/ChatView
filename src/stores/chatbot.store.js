import { defineStore } from 'pinia';
import { nextTick } from 'vue';

export const useChatbotStore = defineStore('chatBotStore', {
  state: () => ({
    isPrimaryTextareaFocused: false,
    currentConversationId: '1243',
    conversationList: [],
    currentStreamAbortController: null,
  }),
  actions: {
    // Helper: load image
    loadImage(file) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });
    },

    // ✅ Helper: base64 → File
    base64ToFile(base64, filename) {
      const arr = base64.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, { type: mime });
    },
    async convertAndResizeImageToBase64(file) {
      const img = await this.loadImage(file);
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      if (width > 1024 || height > 1024) {
        if (width > height) {
          height = Math.round((height * 1024) / width);
          width = 1024;
        } else {
          width = Math.round((width * 1024) / height);
          height = 1024;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const base64 = canvas.toDataURL('image/png');
      const fileData = this.base64ToFile(base64, file.name.replace(/\.[^.]+$/, '') + '.png');

      return { file: fileData, base64, isImage: true, originalName: file.name };
    },
    createSystemPrompt(uploadedFiles = []) {
      if (!uploadedFiles || uploadedFiles.length === 0) {
        return '';
      }

      // ✅ helper for ordinal numbers
      const getOrdinal = (n) => {
        const s = ['th', 'st', 'nd', 'rd'];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
      };

      // ✅ lightweight type mapping
      const getFileTypeLabel = (ext) => {
        const lowerExt = ext.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(lowerExt)) return 'an image';
        if (['pdf'].includes(lowerExt)) return 'a PDF file';
        if (['csv'].includes(lowerExt)) return 'a CSV file';
        if (['json'].includes(lowerExt)) return 'a JSON file';
        if (['txt', 'md'].includes(lowerExt)) return 'a text file';
        if (['xls', 'xlsx'].includes(lowerExt)) return 'an Excel file';
        if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(lowerExt)) return 'a video file';
        if (['mp3', 'wav', 'ogg', 'flac'].includes(lowerExt)) return 'an audio file';
        return `a ${lowerExt.toUpperCase()} file`;
      };

      const fileSummaries = uploadedFiles.map((url, idx) => {
        try {
          const fileName = url.split('/').pop()?.split('?')[0] || `file_${idx + 1}`;
          const ext = fileName.includes('.') ? fileName.split('.').pop().toLowerCase() : 'unknown';
          const typeLabel = getFileTypeLabel(ext);
          return `${getOrdinal(idx + 1)} file is ${typeLabel}: ${url}`;
        } catch {
          return `${getOrdinal(idx + 1)} file is unknown type: ${url}`;
        }
      });

      return (
        `SYSTEM: User has uploaded the following file URLs. ` +
        `Use them for context until otherwise specified:\n` +
        fileSummaries.join('\n')
      );
    },
    async startAiAgentResponseStreaming(request = { conversation_id, message, uploadedFiles }) {
      const { conversation_id, message, uploadedFiles } = request;

      this.conversationList.push({
        _id: Date.now(),
        role: 'user',
        message: message,
        uploadedFiles: uploadedFiles,
      });

      console.log(this.conversationList, 'conversations array');

      //scroll the user message to the view
      if (this.conversationList.length > 1) {
        await nextTick();
        document.getElementById(this.conversationList[this.conversationList.length - 1]._id).scrollIntoView();
      }

      //---------------------------------------
      const aiMessageId = Date.now() + 1;
      this.conversationList.push({
        _id: aiMessageId,
        role: 'assistant',
        message: '',
        thinking: true,
        isGenerating: true,
        identifying: false,
        // finding: false,
        generatedImages: [],
        // shoppingList: [],
      });

      // ✅ Use reusable system prompt creator
      const systemMessage = this.createSystemPrompt((uploadedFiles || []).map((file) => file?.url));

      const finalMessage = `${message}\n\n${systemMessage}`;

      const finalPayload = {
        config: {
          user_name: 'User',
          user_email: '',
          user_phone_number: '',
          user_id: '123',
        },
        conversation_id,
        message: finalMessage,
      };

      console.log(finalPayload, 'final payload to send for streaming message');
      try {
        this.currentStreamAbortController = new AbortController();
        // TODO: Implement sendMessageWithStream function
        // await sendMessageWithStream(
        //   finalPayload,
        //   (data) => {
        //     this.handleStreamData(data, aiMessageId);
        //   },
        //   this.currentStreamAbortController.signal
        // );

        // Mock response for now
        setTimeout(() => {
          const lastMessage = this.conversationList.find((msg) => msg._id === aiMessageId);
          if (lastMessage) {
            lastMessage.thinking = false;
            lastMessage.isGenerating = false;
            lastMessage.message = 'Mock response: ' + message;
          }
        }, 2000);
      } catch (e) {
        // If the error is due to abort, do nothing
        if (e.name === 'AbortError') {
          console.log('Stream aborted by user');
          return;
        }

        // Otherwise, mark message as error
        console.error(e, 'Error occurred generating stream');
        const lastMessage = this.conversationList.find((msg) => msg._id === aiMessageId);
        if (lastMessage) {
          lastMessage.error = true;
          lastMessage.thinking = false;
          lastMessage.isGenerating = false;
        }
      }

      // send finalPayload to your streaming logic
    },
    handleStreamData(data, aiMessageId) {
      const { type, content, conversation_id = 1234, agent_name, url } = data;

      const lastMessage = this.conversationList.find((msg) => msg._id === aiMessageId);
      const imageGenerationTypes = [
        'image_generation_model1',
        'image_generation_model2',
        'wall_paint_editing_model2',
        'wall_paint_editing_model1',
        'apply_wallpaper_described_by_prompt',
        'mask_based_wall_color_painting',
        'advanced_wallpaper_application',
        'add_remove_replace_prompt',
        // "ideate_beta",
        'wall_color_painting_application',
        'advanced_wallpaper_application',
        'apply_wallpaper_described_by_prompt',
        'editing_tool_1',
        'editing_tool_2',
      ];

      switch (type) {
        case 'response_started':
          this.currentConversationId = conversation_id;
          lastMessage.isGenerating = true;
          break;
        case 'token':
          lastMessage.thinking = false;
          lastMessage.message += data['delta'];
          break;
        case 'tool_started':
          if (imageGenerationTypes.includes(data['tool_name'])) {
            lastMessage.generatedImages.push({
              isSkeleton: true,
            });
          }

          if (data['tool_name'] === 'identify_objects') {
            lastMessage.identifying = true;
          }

          if (data['tool_name'] === 'image_search') {
            lastMessage.analyzing = true;
          }

          // if (data['tool_name'] === 'search_products') {
          //   lastMessage.finding = true;
          // }
          break;
        case 'tool_ended':
          if (imageGenerationTypes.includes(data['tool_name'])) {
            if (data['output']['generated_image']) {
              // Find index of the first skeleton and replace it
              const skeletonIndex = lastMessage.generatedImages.findIndex((img) => img.isSkeleton === true);

              if (skeletonIndex !== -1) {
                lastMessage.generatedImages.splice(skeletonIndex, 1, {
                  isSkeleton: false,
                  url: data['output']['generated_image'],
                });
              } else {
                // fallback if no skeleton was found — just push it
                lastMessage.generatedImages.push({
                  isSkeleton: false,
                  url: data['output']['generated_image'],
                });
              }
              const hasSkeletonBlock = Array.isArray(lastMessage?.generatedImages)
                ? lastMessage.generatedImages.some((m) => m.isSkeleton)
                : false;

              lastMessage.thinking = hasSkeletonBlock;
            }
          }

          //Shop flow
          // if (data['tool_name'] === 'search_products' && data['output']) {
          //   console.log('getting searched products from the websites');
          //   let otherWebsitesResponse = Array.isArray(data?.output?.search_other_websites_response)
          //     ? data.output.search_other_websites_response
          //     : [];

          //   let prefferedWebsitesResponse = Array.isArray(data?.output?.search_preferred_websites_response)
          //     ? data.output.search_preferred_websites_response
          //     : [];

          //   let localResponse = Array.isArray(data?.output?.search_local_catalog_response)
          //     ? data.output.search_local_catalog_response
          //     : [];

          //   lastMessage.shoppingList = [
          //     ...localResponse.map((p) => ({
          //       ...p,
          //       isLocal: true,
          //     })),
          //     ...prefferedWebsitesResponse.map((p) => ({
          //       ...p,
          //       isPreffered: true,
          //     })),
          //     ...otherWebsitesResponse.map((p) => ({
          //       ...p,
          //       isOther: true,
          //     })),
          //   ];
          //   lastMessage.finding = false;
          // }

          //resets

          if (data['tool_name'] === 'identify_objects') {
            setTimeout(() => {
              lastMessage.identifying = false;
            }, 2000);
          }
          if (data['tool_name'] === 'image_search') {
            setTimeout(() => {
              lastMessage.analyzing = false;
            }, 1000);
          }
          break;
        case 'response_ended':
          lastMessage.isGenerating = false;
          break;
        default:
          console.warn('Unhandled stream type:', type);
      }
    },
  },
  getters: {
    isStreamingGenerationInProgress() {
      return this.conversationList.some((chat) => chat?.isGenerating);
    },
  },
});
