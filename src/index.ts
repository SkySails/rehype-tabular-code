import { Node } from 'unist'
import { visit } from 'unist-util-visit'

function rehypeCodeTitles() {
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
        const tabTitle = meta.match(/tab="([^"]+)"/)?.[1]

        const tabChild = {
          type: 'element',
          tagName: 'div',
          properties: { className: ['code-tab'] },
          children: [{ type: 'text', value: tabTitle || '' }],
        }

        if (prevNode?.data?.isTabBlock) {
          if (Array.isArray(prevNode.children)) {
            prevNode.children[0].children.push(tabChild)
            prevNode.children[1].children.push({
              type: 'element',
              tagName: 'div',
              properties: { className: ['hidden'] },
              children: [pre],
            })
            parent.children.splice(index, 1)
          }
        } else {
          tabChild.properties.className.push('active-tab')

          parent.children.splice(index, 1, {
            type: 'element',
            tagName: 'div',
            properties: { className: ['tabular-code'] },
            data: {
              isTabBlock: true,
            },
            children: [
              {
                type: 'element',
                tagName: 'ul',
                properties: { className: 'tabular-code-tabs' },
                children: [tabChild],
              },
              {
                type: 'element',
                properties: { className: 'tabular-code-content' },
                tagName: 'div',
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

export default rehypeCodeTitles
