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

const emit = defineEmits(['file:remove', 'file:clicked']);

function handleRemoveUploadedFile(index) {
  emit('file:remove', index);
}
function handleFileClicked(file) {
  emit('file:clicked', file);
}
</script>
<template>
  <div class="uploaded-files-section">
    <div class="uploaded-file-cards-wrapper">
      <div
        v-for="(file, index) in uploadedFiles"
        class="uploaded-file-card"
        :key="file?._id"
        :class="{ image: file?.fileType?.startsWith('image') }"
        @click.stop="handleFileClicked(file)"
      >
        <div v-if="!hideRemoveFileIcon" class="cross-icon" @click.stop="handleRemoveUploadedFile(index)">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div class="file-preview">
          <img v-if="file?.preview" :src="file?.preview" />
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="24" viewBox="0 0 20 24" fill="none">
            <g opacity="0.5">
              <path
                opacity="0.3"
                d="M13.9663 4.92475C13.4196 4.92422 12.8955 4.70681 12.5089 4.32024C12.1223 3.93368 11.9049 3.40953 11.9044 2.86285V1.85844e-07H2.69187C2.33842 -0.000131161 1.98839 0.0693611 1.66181 0.204531C1.33522 0.339701 1.03847 0.537895 0.788498 0.787778C0.538522 1.03766 0.340225 1.33434 0.204934 1.66088C0.0696424 1.98741 -2.44048e-08 2.3374 0 2.69086V18.912C-2.44048e-08 19.2655 0.0696424 19.6155 0.204934 19.942C0.340225 20.2686 0.538522 20.5653 0.788498 20.8151C1.03847 21.065 1.33522 21.2632 1.66181 21.3984C1.98839 21.5335 2.33842 21.6031 2.69187 21.6029H13.7513C14.1047 21.6029 14.4546 21.5333 14.7811 21.3981C15.1075 21.2629 15.4042 21.0646 15.6541 20.8148C15.9039 20.5649 16.1021 20.2683 16.2373 19.9418C16.3726 19.6153 16.4422 19.2654 16.4422 18.912V4.92475H13.9663Z"
                fill="#6B7280"
              />
            </g>
            <path
              d="M16.4401 4.92475H13.9642C13.4176 4.92422 12.8934 4.70681 12.5068 4.32024C12.1203 3.93368 11.9029 3.40953 11.9023 2.86284V0L16.4401 4.92475Z"
              fill="#6B7280"
            />
            <path
              d="M18.3944 17.0625H5.89107C5.00414 17.0625 4.28516 17.7815 4.28516 18.6684V22.3962C4.28516 23.2832 5.00414 24.0022 5.89107 24.0022H18.3944C19.2814 24.0022 20.0004 23.2832 20.0004 22.3962V18.6684C20.0004 17.7815 19.2814 17.0625 18.3944 17.0625Z"
              fill="#6B7280"
            />
          </svg>
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
    padding-bottom: 0.75rem;
    cursor: pointer;
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
        padding: 0.125rem;
        background: #b5ccf1;
        // display: flex;
        flex-flow: row nowrap;
        align-items: center;
        justify-content: center;
        border-radius: 100%;
        display: none;
        cursor: pointer;
        img {
          width: 0.5rem;
          height: 0.5rem;
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
