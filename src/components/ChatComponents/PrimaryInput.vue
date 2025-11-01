<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  textareaPlaceholder: {
    type: String,
    default: 'Enter something...',
  },
  dropdownSuggestions: {
    type: Array,
    default: [],
  },
  modelValue: {
    type: String,
    default: '',
  },
  hideSuggestionsDropdown: {
    type: [String, Boolean, Number],
    default: false,
  },
  inProgress: {
    type: Boolean,
    default: false,
  },
  short: {
    type: [Boolean, String, Number],
    default: false,
  },
  referredText: {
    type: String,
    default: '',
  },
});

const emit = defineEmits([
  'update:modelValue',
  'textarea:focused',
  'textarea:blur',
  'files-selected',
  'submit:message',
  'pause-response',
  'removeReference',
]);

const isTyping = ref(false);
const isTextAreaFocused = ref(false);
const highlightedIndex = ref(-1);
const suggestionRefs = ref([]);
const fileInputRef = ref(null);
const textareaRef = ref(null);

let typingTimeout = null;

const showDropdownSuggestions = computed(() => {
  return isTextAreaFocused.value && !props.hideSuggestionsDropdown && props.dropdownSuggestions.length;
});

const textAreaHeight = computed(() => {
  return props.short ? 30 : 80;
});

const allSuggestions = computed(() => {
  return [...props.dropdownSuggestions];
});

// --- textarea events ---
function handleTextareaInput(e) {
  emit('update:modelValue', e.target.value);
  isTyping.value = true;
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    isTyping.value = false;
  }, 500);
  autoResizeTextarea(); // Call auto-resize on input
}

function handleTextareaFocus() {
  isTextAreaFocused.value = true;
  emit('textarea:focused');
  autoResizeTextarea(); // Ensure correct size on focus
}

function handleTextareaBlur() {
  isTextAreaFocused.value = false;
  highlightedIndex.value = -1;
  emit('textarea:blur');
}

// --- auto-resize textarea ---
function autoResizeTextarea() {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto';
    const maxHeight = window.innerHeight * 0.3;
    textareaRef.value.style.height = `${Math.min(
      Math.max(textareaRef.value.scrollHeight, textAreaHeight.value),
      maxHeight
    )}px`;
  }
}

// --- keyboard navigation for dropdown ---
function handleKeyDown(e) {
  if (!showDropdownSuggestions.value || !allSuggestions.value.length) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    highlightedIndex.value = (highlightedIndex.value + 1) % allSuggestions.value.length;
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    highlightedIndex.value = (highlightedIndex.value - 1 + allSuggestions.value.length) % allSuggestions.value.length;
  }
}

// --- file uploads ---
function onUploadFileClicked() {
  if (fileInputRef.value) {
    fileInputRef.value.click();
  }
}

function handleFilesChange(e) {
  emit('files-selected', e.target.files);
  e.target.value = '';
}

// ✅ handle paste event globally
function handleGlobalPaste(e) {
  if (!e.clipboardData) return;
  const files = [];
  for (const item of e.clipboardData.items) {
    if (item.kind === 'file') {
      const file = item.getAsFile();
      if (file) files.push(file);
    }
  }
  if (files.length) {
    emit('files-selected', files);
  }
}

// --- submit message ---
function handleSubmitMessage() {
  if (props.inProgress) {
    emit('pause-response');
    return;
  }
  if (!props.modelValue.trim()) return;
  emit('submit:message', props.modelValue);
  emit('update:modelValue', '');
  if (textareaRef.value) {
    textareaRef.value.style.height = '30px';
  }
}

function handleSuggestionDropdownItemClick(suggestion) {
  emit('update:modelValue', suggestion);
  autoResizeTextarea();
}

function removeReference() {
  emit('removeReference');
}

// --- global typing capture ---
function handleGlobalTyping(e) {
  // Ignore if user is holding control/meta/alt etc.
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  // Ignore navigation / functional keys
  if (e.key.length !== 1) return;

  // Focus textarea if not already focused
  if (!isTextAreaFocused.value && textareaRef.value) {
    textareaRef.value.focus();
  }

  // Insert character into textarea
  if (textareaRef.value) {
    const cursorPos = textareaRef.value.selectionStart;
    const value = props.modelValue;
    const newValue = value.slice(0, cursorPos) + e.key + value.slice(cursorPos);

    emit('update:modelValue', newValue);

    // Move cursor correctly
    nextTick(() => {
      textareaRef.value.selectionStart = textareaRef.value.selectionEnd = cursorPos + 1;
      autoResizeTextarea();
    });
  }

  // Prevent default so it doesn’t trigger unwanted browser shortcuts
  e.preventDefault();
}

// --- scroll highlighted suggestion into view ---
watch(highlightedIndex, async (newIndex) => {
  if (newIndex >= 0) {
    await nextTick();
    const el = suggestionRefs.value[newIndex];
    if (el && el.scrollIntoView) {
      el.scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
        behavior: 'smooth',
      });
    }
  }
});

// --- global enter key + paste handling ---
onMounted(() => {
  const handleGlobalKeyDown = (e) => {
    if (e.key !== 'Enter') return;

    if (e.shiftKey && isTextAreaFocused.value) {
      autoResizeTextarea();
      return;
    }

    const hasDropdown = showDropdownSuggestions.value && allSuggestions.value.length > 0;
    const hasHighlight = highlightedIndex.value >= 0;

    if (hasDropdown && hasHighlight) {
      e.preventDefault();
      const suggestion = allSuggestions.value[highlightedIndex.value];
      emit('update:modelValue', suggestion);
      highlightedIndex.value = -1;
      autoResizeTextarea();
      return;
    }

    if (props.modelValue.trim() && !props.inProgress) {
      e.preventDefault();
      handleSubmitMessage();
    }
  };

  document.addEventListener('keydown', handleGlobalKeyDown);
  document.addEventListener('paste', handleGlobalPaste);
  document.addEventListener('keypress', handleGlobalTyping); // ✅ typing handler

  autoResizeTextarea();

  onUnmounted(() => {
    document.removeEventListener('keydown', handleGlobalKeyDown);
    document.removeEventListener('paste', handleGlobalPaste);
    document.removeEventListener('keypress', handleGlobalTyping);
    clearTimeout(typingTimeout);
  });

  console.log(props.short, '✅ PrimaryInput mounted with short prop');
});
</script>

<template>
  <div
    class="prompt-box-container"
    :class="{
      animateBorder: inProgress,
    }"
  >
    <transition name="heightFade">
      <div v-if="referredText" class="ask-reference-area">
        <div class="reference-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M9.84115 2.88151H5.17448C3.32531 2.88151 1.82031 4.38651 1.82031 6.23568C1.82031 8.08484 3.32531 9.58984 5.17448 9.58984H11.5911C11.8303 9.58984 12.0286 9.39151 12.0286 9.15234C12.0286 8.91318 11.8303 8.71484 11.5911 8.71484H5.17448C3.80948 8.71484 2.69531 7.60068 2.69531 6.23568C2.69531 4.87068 3.80948 3.75651 5.17448 3.75651H9.84115C10.0803 3.75651 10.2786 3.55818 10.2786 3.31901C10.2786 3.07984 10.0861 2.88151 9.84115 2.88151Z"
              fill="#4B5563"
            />
            <path
              d="M10.2485 7.25698C10.1377 7.25698 10.0269 7.29781 9.93938 7.38531C9.77021 7.55448 9.77021 7.83448 9.93938 8.00365L11.1235 9.18781L9.93938 10.372C9.77021 10.5411 9.77021 10.8211 9.93938 10.9903C10.1085 11.1595 10.3885 11.1595 10.5577 10.9903L12.051 9.49698C12.2202 9.32781 12.2202 9.04781 12.051 8.87865L10.5577 7.38531C10.4702 7.29781 10.3594 7.25698 10.2485 7.25698Z"
              fill="#4B5563"
            />
          </svg>
        </div>
        <div class="reference-text">{{ referredText }}</div>
        <div @click="removeReference" class="remove-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 12L12 4M4 4L12 12" stroke="#4B5563" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
      </div>
    </transition>
    <div class="prompt-input-area">
      <textarea
        :value="modelValue"
        ref="textareaRef"
        :placeholder="textareaPlaceholder"
        @input="handleTextareaInput"
        @focus="handleTextareaFocus"
        @blur="handleTextareaBlur"
        @keydown="handleKeyDown"
      ></textarea>
    </div>
    <div class="prompt-box-actions" :class="{ 'dropdown-visible': showDropdownSuggestions }">
      <div class="left-actions">
        <div @click="onUploadFileClicked" class="action-btn">
          <input type="file" multiple hidden ref="fileInputRef" @change="handleFilesChange" />
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M7.3125 15.1667C4.8325 15.1667 2.8125 13.1467 2.8125 10.6667V6.66667C2.8125 3.82 5.1325 1.5 7.97917 1.5C10.8258 1.5 13.1458 3.82 13.1458 6.66667V10.3333C13.1458 11.8933 11.8725 13.1667 10.3125 13.1667C8.7525 13.1667 7.47917 11.8933 7.47917 10.3333V8C7.47917 7.72667 7.70583 7.5 7.97917 7.5C8.2525 7.5 8.47917 7.72667 8.47917 8V10.3333C8.47917 11.3467 9.29917 12.1667 10.3125 12.1667C11.3258 12.1667 12.1458 11.3467 12.1458 10.3333V6.66667C12.1458 4.36667 10.2792 2.5 7.97917 2.5C5.67917 2.5 3.8125 4.36667 3.8125 6.66667V10.6667C3.8125 12.5933 5.37917 14.1667 7.3125 14.1667C7.58583 14.1667 7.8125 14.3933 7.8125 14.6667C7.8125 14.94 7.5925 15.1667 7.3125 15.1667Z"
              fill="#4B5563"
            />
          </svg>
        </div>
      </div>
      <div class="right-actions">
        <div
          @click="handleSubmitMessage"
          class="primary-action-btn"
          :class="{ pause: inProgress, disabled: !inProgress && !modelValue }"
        >
          <template v-if="!inProgress">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="white"
              xmlns="http://www.w3.org/2000/svg"
              class="icon"
            >
              <path
                d="M8.99992 16V6.41407L5.70696 9.70704C5.31643 10.0976 4.68342 10.0976 4.29289 9.70704C3.90237 9.31652 3.90237 8.6835 4.29289 8.29298L9.29289 3.29298L9.36907 3.22462C9.76184 2.90427 10.3408 2.92686 10.707 3.29298L15.707 8.29298L15.7753 8.36915C16.0957 8.76192 16.0731 9.34092 15.707 9.70704C15.3408 10.0732 14.7618 10.0958 14.3691 9.7754L14.2929 9.70704L10.9999 6.41407V16C10.9999 16.5523 10.5522 17 9.99992 17C9.44764 17 8.99992 16.5523 8.99992 16Z"
              ></path>
            </svg>
          </template>
          <div class="primary-action-btn-text">
            <template v-if="inProgress">
              <div class="pause-square"></div>
            </template>
            <!-- <template v-else>
              {{ 'Send' }}
            </template> -->
          </div>
        </div>
      </div>
    </div>
    <transition name="dropdown">
      <div v-show="showDropdownSuggestions" class="dropdown-suggestions-wrapper">
        <!-- <div v-if="modelValue" class="suggestion-item-wrapper">
          <div class="suggestion-item" :class="{ 'text-input': true }">
            <div class="main-suggestion-text">
              <img :src="appImages['suggestionDropdownMessageIcon.svg']" />
              <div class="text-wrapper">
                {{ modelValue }}
                <transition name="fade">
                  <span v-if="isTyping" class="fake-caret">|</span>
                </transition>
              </div>
            </div>
          </div>
        </div> -->
        <template v-if="dropdownSuggestions.length">
          <div
            v-for="(suggestion, index) in allSuggestions"
            :key="suggestion"
            :ref="(el) => (suggestionRefs[index] = el)"
            class="suggestion-item-wrapper"
          >
            <div
              class="suggestion-item"
              :class="{ highlighted: index === highlightedIndex }"
              @click="handleSuggestionDropdownItemClick(suggestion)"
            >
              <div class="main-suggestion-text">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M7.33594 13.8335C3.74927 13.8335 0.835938 10.9202 0.835938 7.3335C0.835938 3.74683 3.74927 0.833496 7.33594 0.833496C7.60927 0.833496 7.83594 1.06016 7.83594 1.3335C7.83594 1.60683 7.60927 1.8335 7.33594 1.8335C4.3026 1.8335 1.83594 4.30016 1.83594 7.3335C1.83594 10.3668 4.3026 12.8335 7.33594 12.8335C10.3693 12.8335 12.8359 10.3668 12.8359 7.3335C12.8359 7.06016 13.0626 6.8335 13.3359 6.8335C13.6093 6.8335 13.8359 7.06016 13.8359 7.3335C13.8359 10.9202 10.9226 13.8335 7.33594 13.8335Z"
                    fill="#9CA3AF"
                  />
                  <path
                    d="M11.334 1.07129C11.3787 1.07129 11.4471 1.0804 11.5225 1.12598C11.5976 1.17151 11.6866 1.25789 11.7676 1.4209H11.7686L12.1592 2.20312L12.1602 2.2041C12.1866 2.25503 12.2331 2.30011 12.2764 2.33203C12.3194 2.36375 12.3761 2.39566 12.4336 2.40527L13.1426 2.52246C13.3168 2.55167 13.4226 2.61134 13.4873 2.66895C13.5521 2.72677 13.5818 2.78833 13.5947 2.83008C13.6081 2.87345 13.6195 2.94146 13.6006 3.02637C13.5816 3.11106 13.5301 3.22076 13.4062 3.3457L12.8555 3.89941C12.8106 3.94437 12.7815 4.0077 12.7656 4.06348C12.7497 4.11941 12.7422 4.18684 12.7549 4.24707V4.24902L12.9131 4.93164C12.9605 5.13808 12.9452 5.2758 12.9141 5.36523C12.8831 5.45416 12.833 5.50358 12.7969 5.53027C12.7559 5.55951 12.6896 5.59375 12.5918 5.59375C12.4984 5.59371 12.3665 5.56355 12.1904 5.45996L11.5264 5.06641H11.5254C11.468 5.03309 11.3962 5.02154 11.335 5.02148C11.2743 5.02148 11.2016 5.03246 11.1445 5.06641L10.4775 5.45996C10.2947 5.5684 10.1589 5.59562 10.0645 5.59277C9.97077 5.58988 9.90771 5.55747 9.87012 5.53027H9.87109C9.83474 5.50332 9.78494 5.45353 9.75391 5.36523C9.72263 5.276 9.70738 5.13795 9.75586 4.93164L9.91406 4.24902L9.91309 4.24805C9.92754 4.18674 9.91918 4.11832 9.90332 4.06348C9.88707 4.00727 9.85724 3.94416 9.8125 3.89941L9.26172 3.34766C9.13692 3.2228 9.08538 3.1136 9.06641 3.0293C9.04747 2.94483 9.05939 2.87752 9.07324 2.83496C9.08729 2.792 9.11752 2.72998 9.18262 2.67188C9.24739 2.61408 9.35235 2.55367 9.52539 2.52441L10.2344 2.40723C10.292 2.39761 10.3495 2.36601 10.3926 2.33398C10.4354 2.30207 10.4814 2.25587 10.5068 2.20312L10.9004 1.4209C10.9813 1.258 11.0704 1.17153 11.1455 1.12598C11.2208 1.08038 11.2892 1.07132 11.334 1.07129ZM11.334 1.18457C11.255 1.18466 11.1868 1.22643 11.1357 1.27539C11.1097 1.30045 11.0853 1.33021 11.0625 1.36328L10.999 1.47266L10.6064 2.25488C10.577 2.31386 10.5229 2.37443 10.4561 2.42383C10.3893 2.47308 10.3158 2.50566 10.251 2.5166L9.54492 2.63477C9.4602 2.64851 9.38325 2.67348 9.32129 2.70898C9.2607 2.74378 9.20367 2.79524 9.17969 2.86719C9.15503 2.94138 9.17266 3.01806 9.20215 3.08105C9.2325 3.14574 9.28206 3.20994 9.34277 3.26953L9.89355 3.82031C9.94427 3.87103 9.98622 3.94695 10.0107 4.03223C10.0352 4.11764 10.0396 4.20493 10.0234 4.27539L9.86621 4.95703C9.83861 5.07582 9.83206 5.17411 9.84277 5.25195C9.85293 5.32556 9.88123 5.39897 9.94043 5.44141C9.99883 5.48312 10.0765 5.48731 10.1494 5.47461C10.2262 5.46116 10.3178 5.42606 10.4229 5.36523L10.4238 5.36426L11.0889 4.9707H11.0898C11.1539 4.93197 11.2418 4.90922 11.334 4.90918C11.4259 4.90918 11.5149 4.93124 11.582 4.9707L12.2461 5.36426C12.3508 5.42687 12.4427 5.46237 12.5205 5.47559C12.5944 5.48812 12.6717 5.48258 12.7295 5.44141C12.7899 5.39824 12.8175 5.32258 12.8271 5.25C12.8373 5.17257 12.831 5.07516 12.8047 4.95801V4.95703L12.6475 4.27539C12.6139 4.12858 12.6701 3.92836 12.7773 3.81934L13.3281 3.26953C13.3888 3.20883 13.4377 3.14449 13.4678 3.08008C13.497 3.01721 13.5141 2.94261 13.4922 2.87012L13.4912 2.86719L13.4668 2.81641C13.4379 2.7702 13.3948 2.73498 13.3496 2.70898C13.2875 2.67341 13.2099 2.6485 13.125 2.63477H13.126L12.417 2.5166C12.3522 2.5056 12.2786 2.47315 12.2119 2.42383C12.1451 2.37446 12.092 2.31382 12.0625 2.25488L11.6709 1.47266C11.6315 1.39389 11.5849 1.3256 11.5322 1.27539C11.481 1.22664 11.413 1.18457 11.334 1.18457Z"
                    stroke="#9CA3AF"
                    stroke-width="0.222222"
                  />
                  <path
                    d="M13.4381 15.1933C13.3848 15.1933 13.3314 15.1867 13.2848 15.18C12.9714 15.14 12.4048 14.9267 12.0848 13.9733C11.9181 13.4733 11.9781 12.9733 12.2514 12.5933C12.5248 12.2133 12.9848 12 13.5114 12C14.1914 12 14.7248 12.26 14.9648 12.72C15.2048 13.18 15.1381 13.7667 14.7581 14.3333C14.2848 15.0467 13.7714 15.1933 13.4381 15.1933ZM13.0381 13.66C13.1514 14.0067 13.3114 14.18 13.4181 14.1933C13.5248 14.2067 13.7248 14.08 13.9314 13.78C14.1248 13.4933 14.1381 13.2867 14.0914 13.1933C14.0448 13.1 13.8581 13 13.5114 13C13.3048 13 13.1514 13.0667 13.0648 13.18C12.9848 13.2933 12.9714 13.4667 13.0381 13.66Z"
                    fill="#9CA3AF"
                  />
                </svg>
                <div class="text-wrapper">
                  {{ suggestion }}
                </div>
              </div>
              <div v-show="index === highlightedIndex" class="enter-btn">Enter</div>
            </div>
          </div>
        </template>
      </div>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
@property --angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}

@keyframes rotateBorder {
  from {
    --angle: 0deg;
  }
  to {
    --angle: 360deg;
  }
}
::-webkit-scrollbar {
  display: none;
}
.prompt-box-container {
  display: flex;
  padding: 1rem;
  width: 100%;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  min-height: 6.375rem;
  border-radius: 0.5rem;
  border: 1px solid var(--gray-100, #e5e7eb);
  backdrop-filter: blur(50px);
  background: #f9fafb;
  transition: border-color 0.5s ease;
  &.animateBorder {
    border-color: transparent;
    &::before {
      content: '';
      position: absolute;
      inset: 0; // cover whole box
      border-radius: inherit;
      padding: 1px; // thickness of border
      background: conic-gradient(
          from var(--angle) at 50% 50%,
          #3b82f6,
          rgba(249, 250, 251, 0.75) 25%,
          rgba(249, 250, 251, 0.75) 75%,
          #2563eb
        )
        border-box;

      -webkit-mask:
        linear-gradient(#fff 0 0) content-box,
        linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;

      pointer-events: none;
      animation: rotateBorder 2s linear infinite;
    }
    &:focus-within {
      border-color: transparent;
    }
  }
  &:focus-within {
    border-color: #3b82f6;
  }
  .prompt-input-area {
    width: 100%;
    textarea {
      width: 100%;
      // min-height: 5rem; /* Minimum height */
      max-height: 30vh; /* Maximum height */
      resize: none; /* Prevent manual resizing */
      overflow-y: auto; /* Scroll if content exceeds max-height */
      color: #4b5563;
      font-size: 1rem;
      font-style: normal;
      font-weight: 400;
      line-height: normal;
      caret-color: #4b5563;
      outline: none;
      border: none;
      background: transparent;
      &:focus {
        outline: none;
      }
      &::placeholder {
        color: var(--gray-300, #ababab);
      }
    }
  }
  .prompt-box-actions {
    width: 100%;
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: center;
    transition: all 1s ease;
    border-bottom: 1px solid transparent;
    &.dropdown-visible {
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 1rem;
      margin-bottom: 1rem;
    }
    .left-actions {
      .action-btn {
        display: flex;
        height: 2rem;
        padding: 0.25rem 0.5rem;
        justify-content: center;
        align-items: center;
        gap: 0.25rem;
        border-radius: 6.25rem;
        background: var(--gray-50, #f9fafb);
        cursor: pointer;
        transition: all 0.25s ease-in;
        &:hover {
          background: #e5e7eb;
        }
      }
    }
    .right-actions {
      .primary-action-btn {
        display: flex;
        padding: 0.5rem;
        align-items: center;
        justify-content: center;
        // gap: 0.25rem;
        border-radius: 6.25rem;
        background: var(--blue-500, #3b82f6);
        transition: all 0.25s ease-in;
        cursor: pointer;
        &.pause {
          padding: 0.75rem;
          border-radius: 100%;
        }
        &.disabled {
          opacity: 0.5;
          pointer-events: none;
          cursor: not-allowed;
        }
        &:hover {
          background: #2563eb;
        }
        img {
          width: 1rem;
          height: 1rem;
          flex-shrink: 0;
        }
        .primary-action-btn-text {
          color: var(--blue-100, #dbeafe);
          text-align: center;
          font-size: 1rem;
          font-style: normal;
          font-weight: 500;
          line-height: normal;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.35s ease;
          .pause-square {
            width: 0.75rem;
            height: 0.75rem;
            flex-shrink: 0;
            border-radius: 0.125rem;
            background: var(--white, #fff);
            transition: all 0.35s ease;
          }
        }
      }
    }
  }
  .dropdown-suggestions-wrapper {
    width: 100%;
    backdrop-filter: blur(50px);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    align-self: stretch;
    max-height: 8rem;
    overflow: auto;
    .suggestion-item-wrapper {
      width: 100%;
      .suggestion-item {
        width: 100%;
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem;
        transition: all 0.25s ease;
        &:hover {
          background: #dbeafe;
          .main-suggestion-text {
            img {
              filter: brightness(0);
            }
            .text-wrapper {
              color: var(--blue-600, #2563eb);
            }
          }
        }
        &.highlighted {
          background: #dbeafe;
          .main-suggestion-text {
            img {
              filter: brightness(0);
            }
            .text-wrapper {
              color: var(--blue-600, #2563eb);
            }
          }
        }
        .enter-btn {
          display: flex;
          height: 1.3125rem;
          padding: 0 0.5rem;
          justify-content: center;
          align-items: center;
          gap: 0.625rem;
          border-radius: 0.25rem;
          background: var(--blue-50, #eff6ff);
          color: var(--blue-600, #2563eb);
          text-align: center;
          font-size: 0.75rem;
          font-style: normal;
          font-weight: 500;
          line-height: 0.75rem; /* 100% */
        }

        .main-suggestion-text {
          display: flex;
          flex-flow: row nowrap;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          img {
            transition: all 0.25s ease;
          }
          .text-wrapper {
            color: var(--gray-400, #9ca3af);
            text-align: center;
            font-size: 1rem;
            font-style: normal;
            font-weight: 400;
            line-height: normal;
            display: flex;
            flex-flow: row nowrap;
            align-items: center;
            justify-content: center;
            gap: 1px;
            transition: all 0.25s ease;
            .fake-caret {
              color: var(--blue-600, #2563eb);
              text-align: center;
              font-size: 1rem;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              margin-top: -2px;
            }
          }
        }
        &.text-input {
          .main-suggestion-text {
            .text-wrapper {
              color: #2563eb;
            }
          }
        }
      }
    }
  }
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    height 0.5s ease,
    opacity 0.5s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  height: 0;
  opacity: 0;
}

.dropdown-enter-to,
.dropdown-leave-from {
  height: 8rem; // your expanded size
  opacity: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.heightFade-enter-active,
.heightFade-leave-active {
  transition: height 0.3s ease, opacity 0.3s ease;
}

.heightFade-enter-from,
.heightFade-leave-to {
  opacity: 0;
  height: 0;
}

.ask-reference-area {
  border-radius: 0.5rem;
  border: 1px solid var(--gray-200, #e5e7eb);
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  width: 100%;
  padding: 0.375rem 0.75rem;
  margin-bottom: 1rem;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 1rem;
  .reference-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 0.125rem;
  }
  .remove-btn {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 0.125rem;
    transition: all 0.25s ease;
    &:hover {
      opacity: 0.7;
    }
  }
  .reference-text {
    flex: 1;
    color: var(--gray-600, #4b5563);
    font-family: Nunito;
    font-size: 0.875rem;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    display: flex;
    align-items: center;
    word-break: break-word;
  }
}
</style>
