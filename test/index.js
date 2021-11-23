import test from 'tape'
import { rehype } from 'rehype'
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import rehypeTabularCode from '../dist/index.js'

const processHtml = (html) =>
  rehype().data('settings', { fragment: true }).use(rehypeTabularCode).processSync(html).toString()

const processMarkdown = async (md) =>
  (
    await unified().use(remarkParse).use(remarkRehype).use(rehypeTabularCode).use(rehypeStringify).process(md)
  ).toString()

const codeBlock = '<pre><code class="language-typescript"></code></pre>'
const tabBlock =
  '<div class="tabular-code"><ul class="tabular-code-tabs"><div class="code-tab active-tab"></div><div class="code-tab"></div></ul><div class="tabular-code-content"><div><pre><code class="language-ts">console.log(\'hello\')\n</code></pre></div><div class="hidden"><pre><code class="language-ts">console.log(\'hello\')\n</code></pre></div></div></div>\n'

test('rehype-tabular-code', async (t) => {
  t.plan(3)

  const singleBlock = processHtml(codeBlock)

  t.equal(singleBlock, codeBlock, 'given a solo code block, should not change anything')

  const doubleBlock = processHtml(codeBlock + codeBlock)

  t.equal(
    doubleBlock,
    codeBlock + codeBlock,
    'given two code blocks, when no label is set, should not change anything',
  )

  const tabBlockParsed = await processMarkdown(
    "```ts tab='hello'\nconsole.log('hello')\n```\n```ts tab='hello2'\nconsole.log('hello')\n```",
  )

  t.equal(
    tabBlockParsed,
    tabBlock,
    'given markdown with two adjecent codeblocks, should combine them into one tabular block',
  )
})
