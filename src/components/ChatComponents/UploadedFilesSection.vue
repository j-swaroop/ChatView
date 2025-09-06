<script setup>
const props = defineProps({
  uploadedFiles: {
    type: Array,
    default: [],
  },
  hideRemoveFileIcon: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["file:remove"]);

function handleRemoveUploadedFile(index) {
  emit("file:remove", index);
}
</script>
<template>
  <div class="uploaded-files-section">
    <div class="uploaded-file-cards-wrapper">
      <div
        v-for="(file, index) in uploadedFiles"
        :key="file?._id"
        class="uploaded-file-card"
        :class="{ image: file?.fileType?.startsWith('image') }"
      >
        <div
          v-if="!hideRemoveFileIcon"
          @click="handleRemoveUploadedFile(index)"
          class="cross-icon"
        >
          <img :src="$appImages['crossIcon3.svg']" />
        </div>
        <div class="file-preview">
          <img :src="file?.preview || $appImages[file?.icon]" />
        </div>
        <div v-show="!file?.fileType?.startsWith('image')" class="file-detail">
          <div class="file-name">{{ file?.fileName }}</div>
          <div class="file-type">{{ file?.type }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.uploaded-files-section {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  width: 100%;

  .uploaded-file-cards-wrapper {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    gap: 0.75rem;
    overflow: auto;
    padding-top: 1rem;
    padding-bottom: 0.751rem;
    .uploaded-file-card {
      display: flex;
      min-width: 14.0625rem;
      height: 3.5rem;
      padding: 0.5rem;
      align-items: center;
      gap: 0.625rem;
      border-radius: 0.5rem;
      border: 0.0625rem solid var(--gray-100, #f3f4f6);
      background: var(--white, #fff);
      position: relative;
      //   box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
      //     0 2px 4px -1px rgba(0, 0, 0, 0.06);
      animation: none;
      &:hover {
        .cross-icon {
          display: flex;
        }
      }
      &.image {
        width: auto;
        min-width: auto;
        height: auto;
        padding: 0;
        border: none;
        animation: heightIncrease 1s ease;

        .file-preview {
          img {
            display: flex;
            width: 3.5rem;
            height: 3.5rem;
            justify-content: center;
            align-items: center;
            aspect-ratio: 1/1;
            border-radius: 0.25rem;
            object-fit: cover;
            animation: heightIncrease 1s ease;
            transition: height 0.5s ease;
          }
        }
      }
      .cross-icon {
        position: absolute;
        top: -0.625rem;
        right: -0.625rem;
        padding: 0.375rem;
        background: #f3f4f6;
        // display: flex;
        flex-flow: row nowrap;
        align-items: center;
        justify-content: center;
        border-radius: 100%;
        display: none;
        cursor: pointer;
        img {
          width: 0.625rem;
          height: 0.625rem;
          flex-shrink: 0;
        }
      }
      .file-preview {
        img {
          width: 2.5rem;
          height: 2.5rem;
          flex-shrink: 0;
          aspect-ratio: 1/1;
          animation: heightIncreasePreview 1.4s ease;
        }
      }
      .file-detail {
        display: flex;
        flex-flow: column nowrap;
        align-items: flex-start;
        justify-content: center;
        gap: 0.25rem;
        .file-name {
          color: var(--gray-600, #4b5563);
          font-family: Nunito;
          font-size: 0.875rem;
          font-style: normal;
          font-weight: 400;
          line-height: normal;
          max-width: 10rem;
          overflow: hidden;
          text-wrap: nowrap;
          text-overflow: ellipsis;
        }
        .file-type {
          color: var(--gray-400, #9ca3af);
          font-family: Nunito;
          font-size: 0.75rem;
          font-style: normal;
          font-weight: 400;
          line-height: normal;
        }
      }
      &:nth-child(1) {
        animation: none !important;

        .file-preview img {
          animation: none !important;
        }

        .file-detail {
          animation: none !important;
        }

        &.image {
          animation: none !important;

          .file-preview img {
            animation: none !important;
            transition: none !important; // remove smooth resize too
          }
        }
      }
    }
  }
}

@keyframes heightIncrease {
  from {
    height: 0;
    opacity: 0;
  }
  to {
    height: 3.5rem;
    opacity: 1;
  }
}

@keyframes heightIncreasePreview {
  from {
    height: 0;
  }
  to {
    height: 2.5rem;
  }
}
</style>
