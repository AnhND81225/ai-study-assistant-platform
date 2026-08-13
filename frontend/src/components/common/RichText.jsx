import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

export function RichText({ children, className = '' }) {
  if (!children) return null;
  const content = normalizeRichTextContent(children);

  return (
    <div className={`rich-text ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

function normalizeRichTextContent(value) {
  const content = String(value || '')
    .replace(/\r/g, '')
    .replace(/\\n/g, '\n')
    .replace(/\\\\(?=[A-Za-z,;:! ([\]])/g, '\\')
    .replace(/\\_([A-Za-z0-9])/g, '_$1');

  return hasOddDollarCount(content)
    ? content.replace(/\$(?![\s\S]*\$)/, '')
    : content;
}

function hasOddDollarCount(value) {
  return (value.match(/(?<!\\)\$/g) || []).length % 2 === 1;
}
