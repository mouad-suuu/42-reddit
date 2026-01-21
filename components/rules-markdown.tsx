"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface RulesMarkdownProps {
  content: string;
}

/**
 * Renders markdown content for rules sections with custom styling
 * that matches the Praxis manga/drafting theme.
 */
export function RulesMarkdown({ content }: RulesMarkdownProps) {
  return (
    <div className="prose prose-manga max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-display font-bold uppercase tracking-wider text-foreground mb-6 mt-0 border-b-2 border-border pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-display font-bold text-foreground mb-3 mt-8 uppercase tracking-wider">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-display font-bold text-foreground mb-2 mt-6 uppercase tracking-wider">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-bold text-muted-foreground mb-2 mt-4">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-muted-foreground leading-relaxed mb-4">{children}</p>
          ),
          ul: ({ children }) => <ul className="space-y-2 mb-4">{children}</ul>,
          ol: ({ children }) => (
            <ol className="space-y-2 ml-6 mb-4 list-decimal">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="flex items-start text-muted-foreground">
              <span className="text-foreground mr-2 font-bold">▸</span>
              <span>{children}</span>
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-foreground">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-muted-foreground-light">{children}</em>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            return isInline ? (
              <code className="bg-secondary border-2 border-border px-1.5 py-0.5 text-sm font-mono text-foreground">
                {children}
              </code>
            ) : (
              <code className="block bg-secondary border-2 border-border p-4 overflow-x-auto text-sm font-mono text-foreground">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-secondary border-2 border-border p-4 overflow-x-auto mb-4 manga-shadow-sm">
              {children}
            </pre>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground font-bold underline hover:no-underline"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-border pl-4 italic text-muted-foreground my-4 bg-secondary py-2">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="border-2 border-border my-6" />,
          table: ({ children }) => (
            <div className="overflow-x-auto my-6">
              <table className="w-full border-collapse border-2 border-border bg-background manga-shadow">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-manga-ink text-manga-paper border-b-2 border-border">
              {children}
            </thead>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => (
            <tr className="border-b-2 border-border hover:bg-secondary transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 text-left font-display font-bold uppercase tracking-wider text-manga-paper text-sm border-r-2 border-manga-paper/20 last:border-r-0">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-muted-foreground text-sm border-r-2 border-border/20 last:border-r-0">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
