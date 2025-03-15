<template>
  <div class="markdown-body" v-html="renderedMarkdown"></div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'

export default {
  name: 'MarkdownRenderer',
  props: {
    markdown: {
      type: String,
      required: true,
      default: ''
    }
  },
  setup(props) {
    const md = new MarkdownIt({
      html: false,        // 禁用 HTML 标签
      breaks: true,       // 转换换行符为 <br>
      linkify: true,      // 自动转换 URL 为链接
      typographer: true   // 启用一些语言中立的替换和引号
    })
    
    // 渲染并净化输出的 HTML
    const renderedMarkdown = computed(() => {
      if (!props.markdown) return ''
      const rawHtml = md.render(props.markdown)
      return DOMPurify.sanitize(rawHtml)
    })
    
    return {
      renderedMarkdown
    }
  }
}
</script>

<style>
.markdown-body {
  /* 基本样式 */
  color: #24292e;
  line-height: 1.5;
  word-wrap: break-word;
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  margin-top: 1.5em;
  margin-bottom: 0.75em;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-body h1 { font-size: 1.5em; }
.markdown-body h2 { font-size: 1.25em; }
.markdown-body h3 { font-size: 1.125em; }
.markdown-body h4 { font-size: 1em; }

.markdown-body p {
  margin-top: 0;
  margin-bottom: 1em;
}

.markdown-body ul,
.markdown-body ol {
  margin-top: 0;
  margin-bottom: 1em;
  padding-left: 1.5em;
}

.markdown-body li {
  margin-bottom: 0.25em;
}

.markdown-body code {
  padding: 0.2em 0.4em;
  background-color: rgba(27, 31, 35, 0.05);
  border-radius: 3px;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
}

.markdown-body pre {
  padding: 1em;
  overflow: auto;
  background-color: #f6f8fa;
  border-radius: 3px;
  margin-bottom: 1em;
}

.markdown-body blockquote {
  margin: 0;
  padding: 0 1em;
  color: #6a737d;
  border-left: 0.25em solid #dfe2e5;
}
</style> 