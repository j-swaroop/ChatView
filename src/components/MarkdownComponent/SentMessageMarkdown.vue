<!-- SentMessageMarkdown.vue -->
<template>
  <div class="sent-message-markdown" v-html="compiledMarkdown"></div>
</template>

<script setup>
import { computed } from "vue";
import MarkdownIt from "markdown-it";
import DOMPurify from "dompurify";

const props = defineProps({
  content: {
    type: String,
    required: true,
  },
});

const md = new MarkdownIt({
  breaks: true,
  linkify: true,
});

// ----------------- Ordered List -----------------
md.renderer.rules.ordered_list_open = function (tokens, idx) {
  const token = tokens[idx];
  const start = parseInt(token.attrGet("start") || "1", 10);
  token.attrSet("data-start", start);
  token.meta = { counter: start }; // store state
  return `<div class="custom-ol" data-start="${start}">`;
};

md.renderer.rules.ordered_list_close = function () {
  return "</div>";
};

md.renderer.rules.list_item_open = function (tokens, idx) {
  // check parent is ordered or unordered
  let count = null;
  let isOrdered = false;

  for (let i = idx; i >= 0; i--) {
    if (tokens[i].type === "ordered_list_open") {
      const start = parseInt(tokens[i].attrGet("data-start") || "1", 10);
      const pos = tokens[i].meta?.counter ?? start;
      count = pos;
      tokens[i].meta = { counter: pos + 1 }; // increment counter
      isOrdered = true;
      break;
    }
    if (tokens[i].type === "bullet_list_open") {
      isOrdered = false;
      break;
    }
  }

  if (isOrdered) {
    return `<div class="custom-li"><span class="custom-li-number">${count}.</span><div class="custom-li-content">`;
  } else {
    return `<div class="custom-li"><span class="custom-li-bullet">•</span><div class="custom-li-content">`;
  }
};

md.renderer.rules.list_item_close = function () {
  return "</div></div>";
};

// ----------------- Unordered List -----------------
md.renderer.rules.bullet_list_open = function () {
  return `<div class="custom-ul">`;
};

md.renderer.rules.bullet_list_close = function () {
  return "</div>";
};

const compiledMarkdown = computed(() => {
  const rawHtml = md.render(props.content || "");
  return DOMPurify.sanitize(rawHtml);
});
</script>

<style lang="scss" scoped>
.sent-message-markdown {
  font-size: 0.95rem;
  line-height: 1.5;
  & * {
    color: var(--gray-600, #4b5563);
    font-family: Nunito;
    font-size: 1rem;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
  }

  :deep(.custom-ol),
  :deep(.custom-ul) {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    margin: 0.5rem 0;
  }

  :deep(.custom-li) {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
  }

  :deep(.custom-li-number),
  :deep(.custom-li-bullet) {
    font-weight: 600;
    min-width: 1.5rem;
    text-align: right;
    user-select: text; /* ✅ selectable */
  }

  :deep(.custom-li-content) {
    flex: 1;
  }
}
</style>
