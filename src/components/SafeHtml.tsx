import DOMPurify from 'dompurify';

interface SafeHtmlProps {
  html: string;
  className?: string;
  allowedTags?: string[];
  allowedAttributes?: string[];
}

/**
 * SafeHtml component to prevent XSS attacks by sanitizing HTML content
 * Uses DOMPurify to clean potentially malicious HTML/JavaScript
 */
export default function SafeHtml({ 
  html, 
  className = '', 
  allowedTags,
  allowedAttributes 
}: SafeHtmlProps) {
  const sanitizedHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: allowedTags || ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'span'],
    ALLOWED_ATTR: allowedAttributes || ['href', 'title', 'class'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  });

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
