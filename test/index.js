import test from 'tape'
import { rehype } from 'rehype'
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import rehypeTabularCode from '../dist/index.js'

const processHtml = (html) =>
  rehype().data('settings', { fragment: true }).use(rehypeTabularCode).processSync(html).toString()

const processMarkdown = async (md, custom) =>
  (
    await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeTabularCode, custom)
      .use(rehypeStringify)
      .process(md)
  ).toString()

const codeBlock = '<pre><code class="language-typescript"></code></pre>'
const tabBlock =
  '<div class="tabular-code"><ul class="tabular-code-tabs"><li class="tabular-code-tab active-tab">hello</li><li class="tabular-code-tab">hello2</li></ul><div class="tabular-code-content"><div><pre><code class="language-ts">console.log(\'hello\')\n</code></pre></div><div class="hidden"><pre><code class="language-ts">console.log(\'hello\')\n</code></pre></div></div></div>\n'
const tabBlockCN =
  '<div class="test"><ul class="tabular-code-tabs"><li class="tabular-code-tab active-tab">hello</li><li class="tabular-code-tab">hello2</li></ul><div class="tabular-code-content"><div><pre><code class="language-ts">console.log(\'hello\')\n</code></pre></div><div class="hidden"><pre><code class="language-ts">console.log(\'hello\')\n</code></pre></div></div></div>\n'
const tabBlockTN =
  '<main class="tabular-code"><ul class="tabular-code-tabs"><li class="tabular-code-tab active-tab">hello</li><li class="tabular-code-tab">hello2</li></ul><div class="tabular-code-content"><div><pre><code class="language-ts">console.log(\'hello\')\n</code></pre></div><div class="hidden"><pre><code class="language-ts">console.log(\'hello\')\n</code></pre></div></div></main>\n'

test('rehype-tabular-code', async (t) => {
  t.plan(5)

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
    'given markdown with two adjecent codeblocks, should combine them into one tabular block with tab titles',
  )

  const tabBlockParsedCN = await processMarkdown(
    "```ts tab='hello'\nconsole.log('hello')\n```\n```ts tab='hello2'\nconsole.log('hello')\n```",
    { classnames: { container: 'test' } },
  )

  t.equal(
    tabBlockParsedCN,
    tabBlockCN,
    'given a custom option for container classname, when parsing, should use custom classname',
  )

  const tabBlockParsedTN = await processMarkdown(
    "```ts tab='hello'\nconsole.log('hello')\n```\n```ts tab='hello2'\nconsole.log('hello')\n```",
    { tagnames: { container: 'main' } },
  )

  t.equal(
    tabBlockParsedTN,
    tabBlockTN,
    'given a custom option for container tagname, when parsing, should use custom tagname',
  )
})
