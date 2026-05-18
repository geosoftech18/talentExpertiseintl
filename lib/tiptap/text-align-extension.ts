import { Extension } from '@tiptap/core'

export type TextAlignment = 'left' | 'center' | 'right' | 'justify'

export interface TextAlignOptions {
  types: string[]
  alignments: TextAlignment[]
  defaultAlignment: TextAlignment
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    textAlign: {
      setTextAlign: (alignment: TextAlignment) => ReturnType
      unsetTextAlign: () => ReturnType
    }
  }
}

export const TextAlign = Extension.create<TextAlignOptions>({
  name: 'textAlign',

  addOptions() {
    return {
      types: ['heading', 'paragraph'],
      alignments: ['left', 'center', 'right', 'justify'],
      defaultAlignment: 'left',
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          textAlign: {
            default: this.options.defaultAlignment,
            parseHTML: (element) =>
              (element.style.textAlign as TextAlignment) || this.options.defaultAlignment,
            renderHTML: (attributes) => {
              if (
                !attributes.textAlign ||
                attributes.textAlign === this.options.defaultAlignment
              ) {
                return {}
              }
              return { style: `text-align: ${attributes.textAlign}` }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setTextAlign:
        (alignment: TextAlignment) =>
        ({ commands }) => {
          if (!this.options.alignments.includes(alignment)) {
            return false
          }
          return this.options.types
            .map((type) => commands.updateAttributes(type, { textAlign: alignment }))
            .every((response) => response)
        },
      unsetTextAlign:
        () =>
        ({ commands }) => {
          return this.options.types
            .map((type) =>
              commands.updateAttributes(type, { textAlign: this.options.defaultAlignment })
            )
            .every((response) => response)
        },
    }
  },
})
