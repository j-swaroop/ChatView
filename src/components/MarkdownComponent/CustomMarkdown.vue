<!-- <template>
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
</style> -->


<template>
  <div
    class="markdown-content"
    v-html="compiledMarkdown"
    @click="handleImageClick"
  ></div>

  <!-- Fullscreen Image Preview -->
  <div
    v-if="showPreview"
    class="image-preview-modal"
    @click.self="closePreview"
  >
    <img :src="previewSrc" alt="Preview Image" class="preview-img" />
  </div>
</template>

<script setup>
import { computed, defineProps, ref, onMounted } from "vue";
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";

// ✅ Props
const props = defineProps({
  content: { type: String, required: true },
});

// ✅ State for preview
const showPreview = ref(false);
const previewSrc = ref("");

const handleImageClick = (e) => {
  const target = e.target;
  if (target.tagName === "IMG") {
    previewSrc.value = target.src;
    showPreview.value = true;
  }
};

const closePreview = () => {
  showPreview.value = false;
};

// ✅ Markdown instance
const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${
          hljs.highlight(str, { language: lang }).value
        }</code></pre>`;
      } catch (__) {}
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
  },
});

// ✅ Hex color plugin
const hexColorPlugin = (md) => {
  const hexRegex = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\b/;

  function tokenize(state, silent) {
    const pos = state.pos;
    const tail = state.src.slice(pos);

    const match = hexRegex.exec(tail);
    if (!match) return false; // ✅ allow hex inside text

    if (!silent) {
      const token = state.push("hex_color", "", 0);
      token.content = match[0];
    }

    state.pos += match.index + match[0].length; // ✅ move past the hex
    return true;
  }

  md.inline.ruler.before("text", "hex_color", tokenize);

  md.renderer.rules.hex_color = (tokens, idx) => {
    const hex = tokens[idx].content;
    return `
    <span class="hex-wrapper">
      <span 
        class="color-box" 
        onclick="navigator.clipboard.writeText('${hex}')"
      >
        <span class="color-dot" style="background:${hex};"></span>
        <span class="tooltip">${hex}</span>
      </span>
    </span>
  `;
  };
};

md.use(hexColorPlugin);

// ✅ Force all links open in new tab
md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const token = tokens[idx];

  if (token.attrIndex("target") < 0) {
    token.attrPush(["target", "_blank"]);
  } else {
    token.attrs[token.attrIndex("target")][1] = "_blank";
  }

  if (token.attrIndex("rel") < 0) {
    token.attrPush(["rel", "noopener noreferrer"]);
  } else {
    token.attrs[token.attrIndex("rel")][1] = "noopener noreferrer";
  }

  return self.renderToken(tokens, idx, options);
};

// ✅ Custom code block renderer
// ✅ Custom code block renderer
// fence renderer: add <span class="copy-text">
md.renderer.rules.fence = (tokens, idx) => {
  const token = tokens[idx];
  const rawCode = token.content;
  const lang = token.info.trim() || "text";

  // highlight.js highlighting
  let highlighted = "";
  if (lang && hljs.getLanguage(lang)) {
    try {
      highlighted = hljs.highlight(rawCode, { language: lang }).value;
    } catch (__) {
      highlighted = md.utils.escapeHtml(rawCode);
    }
  } else {
    highlighted = md.utils.escapeHtml(rawCode);
  }

  return `
    <div class="code-block">
      <span class="lang-label">${lang}</span>

      <button class="copy-btn" data-code="${encodeURIComponent(rawCode)}">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M5.55 11.375H3.45C1.495 11.375 0.625 10.505 0.625 8.55V6.45C0.625 4.495 1.495 3.625 3.45 3.625H5.55C7.505 3.625 8.375 4.495 8.375 6.45V8.55C8.375 10.505 7.505 11.375 5.55 11.375ZM3.45 4.375C1.9 4.375 1.375 4.9 1.375 6.45V8.55C1.375 10.1 1.9 10.625 3.45 10.625H5.55C7.1 10.625 7.625 10.1 7.625 8.55V6.45C7.625 4.9 7.1 4.375 5.55 4.375H3.45V4.375Z" fill="#9CA3AF"/>
          <path d="M8.55 8.375H8C7.795 8.375 7.625 8.205 7.625 8V6.45C7.625 4.9 7.1 4.375 5.55 4.375H4C3.795 4.375 3.625 4.205 3.625 4V3.45C3.625 1.495 4.495 0.625 6.45 0.625H8.55C10.505 0.625 11.375 1.495 11.375 3.45V5.55C11.375 7.505 10.505 8.375 8.55 8.375ZM8.375 7.625H8.55C10.1 7.625 10.625 7.1 10.625 5.55V3.45C10.625 1.9 10.1 1.375 8.55 1.375H6.45C4.9 1.375 4.375 1.9 4.375 3.45V3.625H5.55C7.505 3.625 8.375 4.495 8.375 6.45V7.625Z" fill="#9CA3AF"/>
        </svg>
        <span class="copy-text">Copy</span>
      </button>

      <pre class="hljs"><code class="language-${lang}">${highlighted}</code></pre>
    </div>
  `;
};

// ✅ Final computed markdown
const compiledMarkdown = computed(() => md.render(props.content));

function handleClickOutside(e) {
  const selection = window.getSelection();
  if (!selection) return;

  const target = e.target;

  // Ignore clicks inside .text-message
  if (target.closest(".text-message")) return;

  // Ignore clicks in editable fields
  if (target.closest("textarea, input, [contenteditable='true']")) return;

  // ✅ Only clear if it's truly outside
  selection.removeAllRanges();
}

onMounted(() => {
  document.addEventListener("click", (e) => {
    // ✅ Color swatch copy
    const box = e.target.closest(".color-box");
    if (box) {
      const tooltip = box.querySelector(".tooltip");
      const hex = tooltip.textContent;
      navigator.clipboard.writeText(hex).then(() => {
        tooltip.textContent = "Copied!";
        setTimeout(() => (tooltip.textContent = hex), 1200);
      });
    }

    // ✅ Code block copy
    const btn = e.target.closest(".copy-btn"); // works even if clicking SVG/text
    if (btn) {
      const code = decodeURIComponent(btn.dataset.code);
      const textEl = btn.querySelector(".copy-text");
      navigator.clipboard.writeText(code).then(() => {
        textEl.textContent = "Copied!";
        setTimeout(() => (textEl.textContent = "Copy"), 1200);
      });
    }
    handleClickOutside(e);
  });
});
</script>

<style lang="scss" scoped>
.markdown-content {
  line-height: 1.6;
  color: #374151; // gray-700
  width: 100%;
  max-width: 95%;

  :deep(p) {
    // margin: 0 0 1em;
    line-height: 125%;
  }
  :deep(*) {
    user-select: text;
    font-family: Nunito;
  }
  :deep(li::marker) {
    user-select: all;
  }

  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4),
  :deep(strong) {
    line-height: 200%;
  }
  :deep(hr) {
    margin: 2rem 0;
    border: 1px solid #f3f4f6;
  }

  :deep(img) {
    max-width: 100%;
    height: auto;
    margin: 1rem 0;
    display: block !important;
    border-radius: 0.5rem;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
    cursor: zoom-in;
  }

  :deep(a) {
    color: #000; // blue-600
    font-weight: 500;
    text-decoration: none;
    transition: color 0.25s ease;
    background: #f7f1f2;
    padding: 0.25rem 0.5rem;
    border-radius: 1rem;
    text-align: center;
    font-size: 0.75rem;
    max-width: 5rem;
    text-overflow: ellipsis;
    overflow: hidden;
    text-wrap: nowrap;
    transition: all 0.25s ease;
  }

  :deep(a:hover) {
    filter: brightness(1.02); // blue-800
  }

  /* ✅ Modern Table Styling */
  :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 1.5rem 0;
    font-size: 0.95rem;
    border: 1px solid #e5e7eb; /* gray-200 */
    border-radius: 0.75rem;
    overflow: hidden; /* ensures rounded corners apply */
    background: #ffffff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04); /* subtle elevation */
  }

  /* Header cells */
  :deep(th) {
    padding: 0.85rem 1.25rem;
    text-align: left;
    background: #f9fafb; /* gray-50 */
    font-weight: 600;
    font-size: 0.9rem;
    color: #374151; /* gray-700 */
    border-bottom: 1px solid #e5e7eb;
    white-space: nowrap;
  }

  /* Body cells */
  :deep(td) {
    padding: 0.85rem 1.25rem;
    text-align: left;
    color: #374151; /* gray-700 */
    border-bottom: 1px solid #f1f5f9; /* light gray divider */
  }

  /* Row striping */
  :deep(tr:nth-child(even) td) {
    background-color: #f9fafb;
  }

  :deep(tr:nth-child(odd) td) {
    background-color: #ffffff;
  }

  /* Last row cleanup */
  :deep(tr:last-child td) {
    border-bottom: none;
  }

  :deep(caption) {
    caption-side: top;
    font-size: 0.9rem;
    font-style: italic;
    margin-bottom: 0.75rem;
    color: #6b7280; // gray-500
  }
}

:deep(thead) {
  width: 100%;
}

/* ✅ Tooltip */
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
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid #ccc;
  display: block;
}

:deep(.tooltip) {
  visibility: hidden;
  opacity: 0;
  background-color: #fff;
  color: #000;
  border-radius: 4px;
  padding: 2px 6px;
  position: absolute;
  bottom: 120%;
  left: 50%;
  transform: translateX(-50%);
  transition: opacity 0.2s;
  font-size: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
}

:deep(.color-box:hover .tooltip) {
  visibility: visible;
  opacity: 1;
}

/* ✅ Image Modal */
.image-preview-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fadeIn 0.25s ease;

  .preview-img {
    max-width: 90vw;
    max-height: 90vh;
    min-width: min(40rem, 90vw);
    min-height: min(40rem, 90vh);
    border-radius: 8px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    cursor: zoom-out;
    object-fit: contain !important;
    animation: scaleIn 0.3s ease-in-out;
  }
}

:deep(.code-block) {
  position: relative;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  margin: 1.25rem 0;
  padding: 1rem;
  font-family: "Geist Mono", monospace !important;
  overflow: hidden;
  max-width: 70%;
  & * {
    font-family: "Geist Mono", monospace !important;
  }

  pre {
    margin-top: 2rem;
    background: transparent !important;
    overflow-x: auto;
    white-space: pre;
    font-family: "Geist Mono", monospace !important;
  }

  code {
    font-size: 0.875rem;
    line-height: 1.5rem;
    font-weight: 400;
    display: block;
    color: #1f2937;

    & * {
      font-family: "Geist Mono", monospace !important;
    }

    :deep(.hljs-keyword) {
      color: #2563eb;
      font-weight: 500;
    } /* blue */
    :deep(.hljs-string) {
      color: #059669;
    } /* green */
    :deep(.hljs-number) {
      color: #d97706;
    } /* amber */
    :deep(.hljs-literal) {
      color: #b91c1c;
      font-weight: 500;
    } /* red */
    :deep(.hljs-function) {
      color: #9333ea;
    } /* purple */
    :deep(.hljs-comment) {
      color: #6b7280;
      font-style: italic;
    } /* gray */
  }
}

/* ✅ Language label */
:deep(.lang-label) {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  color: var(--gray-400, #9ca3af);
  font-family: Nunito;
  font-size: 0.75rem;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  pointer-events: none; // label is not clickable
}

:deep(.copy-btn) {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  color: var(--gray-400, #9ca3af);
  font-family: Nunito;
  font-size: 0.75rem;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;

  // &:hover {
  //   background: #d1d5db; // gray-300
  // }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scaleIn {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}
</style>

<style lang="scss">
.markdown-content {
  p {
    margin: 0;
  }
}
</style>