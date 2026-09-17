import { compileMDX } from "@content-collections/mdx"
import { defineCollection, defineConfig } from "@content-collections/core"
import rehypePrettyCode from "rehype-pretty-code"
import remarkGfm from "remark-gfm"
import { z } from "zod-cc"

// Highlighted at build time, matching the shadcn/ui docs (apps/v4/source.config.ts).
// Both themes are emitted as CSS variables and switched by the `pre` component
// in mdx-components.tsx.
const mdxOptions = {
  remarkPlugins: [remarkGfm],
  rehypePlugins: [
    [
      rehypePrettyCode,
      {
        theme: { dark: "vesper", light: "github-light-default" },
        defaultLang: { block: "plaintext" },
        keepBackground: false,
      },
    ],
  ],
} satisfies Parameters<typeof compileMDX>[2]

const changelogSchema = z.object({
  date: z.string(),
  title: z.string(),
  description: z.string().optional(),
  content: z.string(),
})

const changelog = defineCollection({
  name: "changelog",
  directory: "content/changelog",
  include: "**/*.mdx",
  parser: "frontmatter",
  schema: changelogSchema,
  transform: async (document, ctx) => {
    const body = await compileMDX(ctx, document, mdxOptions)
    const { content: _content, ...rest } = document
    return {
      ...rest,
      body,
    }
  },
})

const learnSchema = z.object({
  date: z.string(),
  updated: z.string().optional(),
  title: z.string(),
  description: z.string(),
  content: z.string(),
})

const learn = defineCollection({
  name: "learn",
  directory: "content/learn",
  include: "**/*.mdx",
  parser: "frontmatter",
  schema: learnSchema,
  transform: async (document, ctx) => {
    const body = await compileMDX(ctx, document, mdxOptions)
    const { content: _content, ...rest } = document
    return {
      ...rest,
      // The filename is the URL: content/learn/what-is-a-shadcn-preset.mdx -> /learn/what-is-a-shadcn-preset
      slug: document._meta.path,
      body,
    }
  },
})

export default defineConfig({
  content: [changelog, learn],
})
