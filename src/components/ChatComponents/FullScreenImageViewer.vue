<script setup>
import { ref, defineProps, defineEmits } from 'vue';
const props = defineProps({
  currentSelectedImageForFullView: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['fullScreenViewerClose', 'downloadImage']);

const isClosing = ref(false);

function openFullScreenImageViewer(data) {
  isClosing.value = true;
  setTimeout(() => {
    isClosing.value = false;
    emit('fullScreenViewerClose', data);
  }, 600);
}

function downloadImage(data) {
  emit('downloadImage', data);
}
</script>
<template>
  <div @click="openFullScreenImageViewer(null)" class="full-screen-image-viewer" :class="{ closing: isClosing }">
    <div class="top-actions-section">
      <div class="left-section"></div>
      <div class="right-side-actions">
        <!-- <div
            v-if="!hideEditImageIcon"
            @click.stop="onEditImageBtnClick(currentSelectedImageForFullView)"
            class="download-icon"
          >
            <img :src="$appImages['pencil-icon.svg']" />
          </div> -->
        <div @click.stop="downloadImage(currentSelectedImageForFullView)" class="download-icon">
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
        <div class="cross-icon" @click.stop="openFullScreenImageViewer(null)">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
    <div class="main-section">
      <img
        @click.stop
        class="full-screen-img"
        :src="currentSelectedImageForFullView"
      />
        <!-- v-lazy="{
          src: currentSelectedImageForFullView,
          loading: $appImages['spinnerLoader.gif'],
        }" -->
      <!-- <div @click.stop="handleSubmitRefineMentBtn" class="manual-refinement-btn">
          {{ 'Submit for Manual Refinement' }}
        </div> -->
    </div>
  </div>
</template>
<style scoped lang="scss">
.full-screen-image-viewer {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 105;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  animation: fadeBgAnimation 0.25s ease-out;
  &.closing {
    animation: closing 0.7s ease-out;

    @keyframes closing {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
      }
    }
  }
  @keyframes fadeBgAnimation {
    from {
      background: transparent;
    }
    to {
      background: #fff;
    }
  }

  .top-actions-section {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    gap: 20px;
    padding-bottom: 8px;

    .right-side-actions {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 0 16px;
      padding-right: 0;

      .download-icon,
      .cross-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding: 4px;
        border-radius: 100px;
        transition: 0.25s ease-out;
        img {
          width: 16px;
          height: 16px;
        }
        &:hover {
          background-color: rgba(#6b46c1, 0.08);
        }
      }
      .cross-icon {
        img {
          height: 20px;
          width: 20px;
        }
      }
    }
  }

  .main-section {
    flex: 1;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    justify-content: center;
    width: 100%;
    gap: 1.5rem;

    .full-screen-img {
      max-width: calc(100vw - 32px);
      max-height: calc(100vh - 200px); // Accounts for top bar height + padding
      width: auto;
      height: auto;
      object-fit: contain;
      border-radius: 8px;
      animation: scaleImage 0.375s ease-in-out;
      @keyframes scaleImage {
        0% {
          transform: scale(0.8);
        }
        50% {
          transform: scale(1.05);
        }
        100% {
          transform: scale(1);
        }
      }
    }
    .full-screen-img[lazy='loading'] {
      height: 5rem;
      width: 5rem;
    }
    .manual-refinement-btn {
      display: flex;
      width: 16.3125rem;
      height: 2.75rem;
      padding: 0.5rem 1rem;
      justify-content: center;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;
      border-radius: 0.5rem;
      background: #431a80;

      /* /shadow/md */
      box-shadow:
        0px 4px 6px -1px rgba(0, 0, 0, 0.1),
        0px 2px 4px -1px rgba(0, 0, 0, 0.06);
      cursor: pointer;
      color: var(--white, #fff);
      text-align: center;
      font-family: Nunito;
      font-size: 1rem;
      font-style: normal;
      font-weight: 500;
      line-height: normal;
      transition: 0.25s ease-out;
      &:hover {
        background: #e3cffe;
        color: #431a80;
      }
    }
  }
}
</style>
