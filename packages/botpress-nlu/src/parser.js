import _ from 'lodash'
import Markdown from 'markdown-it'

export default class Parser {
  constructor() {
    this.md = new Markdown()
  }

  parse(content) {
    const tokens = this.md.parse(content, {})

    const utterances = []
    let current = []
    let append = false

    for (var i of tokens) {
      if (i.type === 'list_item_open') {
        current = []
        append = true
      } else if (i.type === 'list_item_close') {
        append = false
        if (current.length) {
          utterances.push(current)
        }
      } else if (i.type === 'inline' && append) {
        let entityCnt = 0

        const re = /]\[(.*?)]/g
        const labels = []

        let match

        do {
          match = re.exec(i.content)
          if (match) {
            labels.push(match[1])
          }
        } while (match)

        const count = (i.children && i.children.length) || 0

        for (var index = 0; index < count; index++) {
          const c = i.children[index]
          const next = _.get(i.children, index + 1)

          if (c.type === 'text') {
            current.push(c.content)
          } else if (c.type === 'link_open') {
            index++

            const label = i.content.includes(`[${next.content}][`) ? _.get(labels, entityCnt++) : null

            current.push({
              text: next.content,
              label: label,
              entity: c.attrs[0][1]
            })
          }
        }
      }
    }

    return utterances
  }
}
