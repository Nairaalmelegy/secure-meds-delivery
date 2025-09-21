import DOMPurify from 'dompurify';

/**
 * Safely render HTML using DOMPurify to prevent XSS.
 * Usage: <SafeHtml html={userHtml} />
 */
export function SafeHtml({ html, className }: { html: string, className?: string }) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
    />
  );
}
