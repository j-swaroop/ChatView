<template>
  <div class="markdown-content" @click="handleMarkdownContentClicked" v-html="compiledMarkdown"></div>
</template>

<script setup>
import { computed, defineProps } from 'vue';
import MarkdownIt from 'markdown-it';

// ✅ Define props for markdown text
const props = defineProps({
  content: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['image:clicked']);

// ✅ Create MarkdownIt instance
const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
});

function handleMarkdownContentClicked(e) {
  const target = e.target;
  if (target.tagName === 'IMG') {
    console.log("image clicked")
    emit('image:clicked', target.src);
  }
}

// ✅ Hex color rendering plugin
const hexColorPlugin = (md) => {
  const hexRegex = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\b/;

  function tokenize(state, silent) {
    const pos = state.pos;
    const tail = state.src.slice(pos);

    const match = hexRegex.exec(tail);
    if (!match || match.index !== 0) return false;

    if (!silent) {
      const token = state.push('hex_color', '', 0);
      token.content = match[0];
    }

    state.pos += match[0].length;
    return true;
  }

  md.inline.ruler.before('emphasis', 'hex_color', tokenize);

  md.renderer.rules.hex_color = (tokens, idx) => {
    const hex = tokens[idx].content;
    return `
      <span class="hex-wrapper">
        <span class="color-box">
          <span class="color-dot" style="background:${hex};"></span>
          <span class="tooltip">${hex}</span>
        </span>
      </span>
    `;
  };
};

// ✅ Apply the plugin
md.use(hexColorPlugin);

// ✅ Force all links to open in new tab
md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const token = tokens[idx];

  if (token.attrIndex('target') < 0) {
    token.attrPush(['target', '_blank']);
  } else {
    token.attrs[token.attrIndex('target')][1] = '_blank';
  }

  if (token.attrIndex('rel') < 0) {
    token.attrPush(['rel', 'noopener noreferrer']);
  } else {
    token.attrs[token.attrIndex('rel')][1] = 'noopener noreferrer';
  }

  return self.renderToken(tokens, idx, options);
};

// ✅ Computed Markdown rendering
const compiledMarkdown = computed(() => {
  return md.render(props.content);
});
</script>

<style lang="scss" scoped>
.markdown-content {
  line-height: 1.6;
  color: #333;
  font-family: system-ui, sans-serif;

  a {
    color: #007acc;
    text-decoration: underline;
  }
  :deep(img) {
    max-width: 100%;
    height: auto;
    margin: 1rem 0;
    display: block !important;
    border-radius: 8px;
    box-shadow: 0 4px 4px rgba(0, 0, 0, 0.1);
    cursor: zoom-in;
  }
}

/* ✅ Tooltip styling with :deep() */
:deep(.hex-wrapper) {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  position: relative;
}

:deep(.color-box) {
  position: relative;
  display: inline-block;
  transform: translateY(0.125rem);
}

:deep(.color-dot) {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

:deep(.tooltip) {
  visibility: hidden;
  opacity: 0;
  width: max-content;
  background-color: #fff;
  color: #000;
  text-align: center;
  border-radius: 4px;
  padding: 2px 6px;
  position: absolute;
  z-index: 1;
  bottom: 120%;
  left: 50%;
  transform: translateX(-50%);
  transition: opacity 0.2s;
  white-space: nowrap;
  font-size: 12px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

:deep(.color-box:hover .tooltip) {
  visibility: visible;
  opacity: 1;
}
</style>

<style lang="scss">
.markdown-content {
  p {
    margin: 0;
  }
}
</style>
