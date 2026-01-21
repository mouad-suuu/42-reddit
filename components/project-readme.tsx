"use client"

import ReactMarkdown from "react-markdown"

interface ProjectReadmeProps {
  content: string
}

/**
 * Displays GitHub README content as rendered markdown.
 * Provides styling consistent with the manga/drafting theme.
 */
export function ProjectReadme({ content }: ProjectReadmeProps) {
  return (
    <div className="prose prose-manga max-w-none">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-display font-bold text-foreground mb-4 mt-6 first:mt-0 border-b-2 border-border pb-2">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-display font-bold text-foreground mb-3 mt-5">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-display font-bold text-foreground mb-2 mt-4">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="text-muted-foreground leading-relaxed mb-4">{children}</p>
          ),
          code: ({ children, className }) => {
            const isInline = !className
            return isInline ? (
              <code className="bg-secondary border-2 border-border px-1.5 py-0.5 text-sm font-mono text-foreground">
                {children}
              </code>
            ) : (
              <code className="block bg-secondary border-2 border-border p-4 overflow-x-auto text-sm font-mono text-foreground">
                {children}
              </code>
            )
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
          ul: ({ children }) => (
            <ul className="space-y-2 mb-4 text-muted-foreground">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-2 mb-4 text-muted-foreground">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="flex items-start">
              <span className="text-foreground mr-2 font-bold">▸</span>
              <span>{children}</span>
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-border pl-4 italic text-muted-foreground my-4 bg-secondary py-2">
              {children}
            </blockquote>
          ),
          hr: () => (
            <hr className="border-2 border-border my-6" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
