import DOMPurify from 'dompurify';

const purifyConfig = {
  ALLOWED_TAGS: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'hr',
    'strong', 'em', 'u', 's', 'del', 'ins',
    'blockquote', 'pre', 'code',
    'ul', 'ol', 'li',
    'a', 'img',
    'figure', 'figcaption',
    'div', 'span',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
  ],
  ALLOWED_ATTR: [
    'href', 'target', 'rel',
    'src', 'alt', 'title', 'width', 'height',
    'class', 'style',
    'id',
    'colspan', 'rowspan',
  ],
  ALLOW_DATA_ATTR: false,
};

export function sanitizeHTML(html) {
  return DOMPurify.sanitize(html, purifyConfig);
}

export function renderTipTapContent(html) {
  return sanitizeHTML(html);
}
