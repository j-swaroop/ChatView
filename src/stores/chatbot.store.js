import { defineStore } from 'pinia';
import { nextTick } from 'vue';

export const useChatbotStore = defineStore('chatBotStore', {
  state: () => ({
    isPrimaryTextareaFocused: false,
    currentConversationId: '1243',
    conversationList: [
      {
        _id: 1,
        role: 'user',
        message: 'Hello! Can you help me understand how to use this chat interface?',
        uploadedFiles: [],
      },
      {
        _id: 2,
        role: 'assistant',
        message:
          "Hello! I'd be happy to help you understand how to use this chat interface. This is a conversational AI assistant that can help you with various tasks. You can type your questions or requests in the text area below, and I'll do my best to assist you. Feel free to ask me anything!",
        thinking: false,
        isGenerating: false,
        identifying: false,
        generatedImages: [],
      },
      {
        _id: 3,
        role: 'user',
        message: 'What can you help me with?',
        uploadedFiles: [],
      },
      {
        _id: 4,
        role: 'assistant',
        message:
          "I can help you with a wide variety of tasks including:\n\n• **General Questions**: Answer questions on various topics\n• **Code Help**: Assist with programming and debugging\n• **Writing**: Help with essays, emails, creative writing\n• **Analysis**: Analyze data, documents, or images\n• **Problem Solving**: Work through complex problems step by step\n• **Learning**: Explain concepts and provide educational content\n• **Planning**: Help organize tasks, projects, or events\n\nJust describe what you need help with, and I'll do my best to assist you!",
        thinking: false,
        isGenerating: false,
        identifying: false,
        generatedImages: [],
      },
      {
        _id: 5,
        role: 'user',
        message: 'Can you help me write a simple JavaScript function?',
        uploadedFiles: [],
      },
      {
        _id: 6,
        role: 'assistant',
        message:
          'Absolutely! Here\'s a simple JavaScript function example:\n\n```javascript\nfunction greetUser(name) {\n  return `Hello, ${name}! Welcome to our chat interface.`;\n}\n\n// Usage example\nconst message = greetUser("John");\nconsole.log(message); // Output: "Hello, John! Welcome to our chat interface."\n```\n\nThis function:\n- Takes a `name` parameter\n- Returns a personalized greeting message\n- Uses template literals for string interpolation\n\nWould you like me to help you with a specific function or explain any part of this code?',
        thinking: false,
        isGenerating: false,
        identifying: false,
        generatedImages: [],
      },
      {
        _id: 7,
        role: 'user',
        message: "That's great! Can you also help me with CSS styling? I want to center a div element.",
        uploadedFiles: [],
      },
      {
        _id: 8,
        role: 'assistant',
        message:
          'Of course! Here are several ways to center a div element in CSS:\n\n## Method 1: Flexbox (Recommended)\n```css\n.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh; /* or any desired height */\n}\n```\n\n## Method 2: CSS Grid\n```css\n.container {\n  display: grid;\n  place-items: center;\n  height: 100vh;\n}\n```\n\n## Method 3: Traditional Centering\n```css\n.container {\n  position: relative;\n  height: 100vh;\n}\n\n.centered-div {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n}\n```\n\n## Method 4: Margin Auto (for block elements)\n```css\n.centered-div {\n  width: 300px; /* set a width */\n  margin: 0 auto;\n}\n```\n\nThe flexbox method is generally the most modern and flexible approach. Which method would work best for your specific use case?',
        thinking: false,
        isGenerating: false,
        identifying: false,
        generatedImages: [],
      },
      {
        _id: 9,
        role: 'user',
        message: 'Can you help me create a modern card design with an image?',
        uploadedFiles: [
          {
            url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
            name: 'mountain-landscape.jpg',
            type: 'image/jpeg',
          },
        ],
      },
      {
        _id: 10,
        role: 'assistant',
        message:
          "Absolutely! I can see you've uploaded a beautiful mountain landscape image. Here's a modern card design that will showcase it perfectly.\n\nThis design features:\n- Rounded corners for a modern look\n- Subtle shadows with hover effects\n- Responsive image sizing\n- Clean typography hierarchy\n- Smooth transitions\n\nThe card will have a clean, minimalist appearance that highlights your beautiful mountain landscape image with elegant styling and smooth hover animations.",
        thinking: false,
        isGenerating: false,
        identifying: false,
        generatedImages: [
          {
            isSkeleton: false,
            url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
          },
          {
            isSkeleton: false,
            url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
          },
          {
            isSkeleton: true,
            // url: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=300&fit=crop'
          },
        ],
      },
      {
        _id: 13,
        role: 'user',
        message: 'How can I implement real-time chat with Socket.IO?',
        uploadedFiles: [],
      },
      {
        _id: 14,
        role: 'assistant',
        message:
          "Great question! Socket.IO is perfect for real-time chat applications. Here's how you can implement it:\n\n## Key Concepts\nSocket.IO enables real-time, bidirectional communication between web clients and servers.\n\n## Essential Resources\n- [Socket.IO Official Documentation](https://socket.io/docs/v4/)\n- [Socket.IO Client API](https://socket.io/docs/v4/client-api/)\n- [Real-time Chat Tutorial](https://socket.io/get-started/chat/)\n- [Socket.IO GitHub Repository](https://github.com/socketio/socket.io)\n\n## Basic Implementation\n1. **Server Setup** - Install and configure Socket.IO server\n2. **Client Connection** - Connect from your frontend application\n3. **Event Handling** - Listen for and emit events\n4. **Room Management** - Organize users into chat rooms\n\n## Popular Alternatives\n- [Pusher](https://pusher.com/) - Hosted real-time messaging service\n- [Firebase Realtime Database](https://firebase.google.com/products/realtime-database) - Google's real-time solution\n- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) - Native browser WebSocket support\n\nSocket.IO provides excellent fallbacks and handles connection issues automatically, making it ideal for production chat applications!",
        thinking: false,
        isGenerating: false,
        identifying: false,
        generatedImages: [],
      },
    ],
    currentStreamAbortController: null,
    currentSelectedImageForFullView: '',
    hideFullPageImageViewer: false,
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

    showModeSwitcher(value) {
      this.hideFullPageImageViewer = !value;
    },

    async downloadImage(imgUrl) {
      console.log('downloading image...');
      try {
        const response = await fetch(imgUrl, { mode: 'cors' });
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `ManageAI-${imgUrl.split('/').pop() || 'download.png'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // cleanup
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Image download failed:', err);
      }
    },
    openFullScreenImageViewer(url) {
      this.currentSelectedImageForFullView = url;
      if (url) {
        this.showModeSwitcher(false);
      } else {
        this.showModeSwitcher(true);
      }
    },
  },
  getters: {
    isStreamingGenerationInProgress() {
      return this.conversationList.some((chat) => chat?.isGenerating);
    },
  },
});
