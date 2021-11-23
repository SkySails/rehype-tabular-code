import { Node } from 'unist'
import { visit } from 'unist-util-visit'

type TabularCodeParts = {
  /** The wrapping container that wraps all tabs and content */
  container: string
  /** The wrapping container that wraps all tabs */
  tabContainer: string
  /** The element containing the tab title */
  tab: string
  /** The wrapping container that wraps all content */
  contentContainer: string
  /** The element that wraps each codeblock */
  content: string
}

export interface TabularCodeOptions {
  /** Used to modify the classname of each part of the tabular codeblock */
  classNames: {
    /** The classname(s) used for the wrapping container that wraps all tabs and content
     * @default "tabular-code"
     */
    container?: string | string[]
    /** The classname(s) used for the wrapping container that wraps all tabs
     * @default "tabular-code-tabs"
     */
    tabContainer?: string | string[]
    /** The classname(s) used for the element containing the tab title
     * @default "tabular-code-tab"
     */
    tab?: string | string[]
    /** The classname(s) used for the element containing the FIRST tab title
     * @default "active-tab"
     */
    activeTab?: string
    /** The classname(s) used for the container that wraps all content
     * @default "tabular-code-content"
     */
    contentContainer?: string | string[]
    /** The classname(s) used for the element that wraps each codeblock
     * @default undefined
     */
    content?: string | string[]
  }
  /** Used to define the HTML elements to be used by each part of the tabular codeblock */
  tagNames: {
    /** The tagname used for the wrapping container that wraps all tabs and content
     * @default "div"
     */
    container?: string
    /** The tagname used for the wrapping container that wraps all tabs
     * @default "ul"
     */
    tabContainer?: string
    /** The tagname used for the element containing the tab title
     * @default "li"
     */
    tab?: string
    /** The tagname used for the container that wraps all content
     * @default "div"
     */
    contentContainer?: string
    /** The tagname used for the element that wraps each codeblock
     * @default "div"
     */
    content?: string
  }
}

function getCNList(cn?: string | string[]): string[] | undefined {
  if (!cn) return
  return Array.isArray(cn) ? cn : [cn]
}

function rehypeTabularCode(opts: TabularCodeOptions) {
  const CONTAINER_TAG = opts?.tagNames?.container || 'div'
  const TAB_CONTAINER_TAG = opts?.tagNames?.tabContainer || 'ul'
  const TAB_TAG = opts?.tagNames?.tab || 'li'
  const CONTENT_CONTAINER_TAG = opts?.tagNames?.contentContainer || 'div'
  const CONTENT_TAG = opts?.tagNames?.content || 'div'

  const CONTAINER_CLASS = getCNList(opts?.classNames?.container) || ['tabular-code']
  const TAB_CONTAINER_CLASS = getCNList(opts?.classNames?.tabContainer) || ['tabular-code-tabs']
  const TAB_CLASS = getCNList(opts?.classNames?.tab) || ['tabular-code-tab']
  const TAB__ACTIVE_CLASS = opts?.classNames?.activeTab || 'active-tab'
  const CONTENT_CONTAINER_CLASS = getCNList(opts?.classNames?.contentContainer) || ['tabular-code-content']
  const CONTENT_CLASS = getCNList(opts?.classNames?.content) || []

  return (tree: Node) => {
    visit(tree, 'element', (node, index, parent) => {
      if (!parent || node.tagName !== 'pre' || index === null) {
        return
      }

      const prevNode =
        parent.children?.[index - 1]?.type === 'pre' ? parent.children[index - 1] : parent.children[index - 2]

      const pre = node
      const code = Array.isArray(pre.children) ? pre.children[0] : pre.children

      if (code.data?.meta?.includes('tab=')) {
        const meta: string = code.data.meta
        const tabTitle = meta.match(/tab=["']([^"']+)/)?.[1]

        const tabChild = {
          type: 'element',
          tagName: TAB_TAG,
          properties: { className: [...TAB_CLASS] },
          children: [{ type: 'text', value: tabTitle || '' }],
        }

        if (prevNode?.data?.isTabBlock) {
          if (Array.isArray(prevNode.children)) {
            prevNode.children[0].children.push(tabChild)
            prevNode.children[1].children.push({
              type: 'element',
              tagName: CONTENT_TAG,
              properties: { className: [...CONTENT_CLASS, 'hidden'] },
              children: [pre],
            })
            parent.children.splice(index, 1)
          }
        } else {
          tabChild.properties.className.push(TAB__ACTIVE_CLASS)

          parent.children.splice(index, 1, {
            type: 'element',
            tagName: CONTAINER_TAG,
            properties: { className: [...CONTAINER_CLASS] },
            data: {
              isTabBlock: true,
            },
            children: [
              {
                type: 'element',
                tagName: TAB_CONTAINER_TAG,
                properties: { className: [...TAB_CONTAINER_CLASS] },
                children: [tabChild],
              },
              {
                type: 'element',
                tagName: CONTENT_CONTAINER_TAG,
                properties: { className: [...CONTENT_CONTAINER_CLASS] },
                children: [
                  {
                    type: 'element',
                    tagName: 'div',
                    children: [pre],
                  },
                ],
              },
            ],
          })
        }
      }
    })
  }
}

export default rehypeTabularCode
