import { marked } from 'marked'
import DOMPurify from 'dompurify'

// 全局 marked 配置
marked.setOptions({
  breaks: true,    // 单换行转 <br>
  gfm: true,       // 启用 GitHub 风味 Markdown（表格、任务列表等）
})

/**
 * 将 Markdown 文本渲染为安全的 HTML
 * 自动处理中文引号、破折号等特殊字符对解析的潜在影响
 */
export function renderMarkdown(text: string): string {
  if (!text) return ''

  // 微小预处理：将中文弯引号“”转换为软引号，避免被 marked 当作单词边界
  // 如果需要保留原样，可注释下面两行
  let processed = text
    .replace(/\u201c/g, '&ldquo;')  // “
    .replace(/\u201d/g, '&rdquo;')  // ”

  try {
    const rawHtml = marked.parse(processed) as string
    return DOMPurify.sanitize(rawHtml)
  } catch (e) {
    console.error('Markdown render error:', e)
    // 回退：纯文本转义
    return DOMPurify.sanitize(processed.replace(/</g, '&lt;'))
  }
}