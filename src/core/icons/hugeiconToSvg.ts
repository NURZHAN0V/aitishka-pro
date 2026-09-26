/** Convert Hugeicons free-icon arrays into inline SVG for BaseIcon. */

type HugeIconAttrs = Record<string, string | number | undefined>
type HugeIconNode = [string, HugeIconAttrs, ...HugeIconNode[]]

function camelToKebab(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

function attrsToString(attrs: HugeIconAttrs): string {
  return Object.entries(attrs)
    .filter(([key, value]) => key !== 'key' && value != null)
    .map(([key, value]) => `${camelToKebab(key)}="${String(value)}"`)
    .join(' ')
}

function nodeToSvg(node: HugeIconNode): string {
  const [tag, attrs, ...children] = node
  const attrStr = attrsToString(attrs ?? {})
  const inner = children.map(child => nodeToSvg(child as HugeIconNode)).join('')
  if (inner) {
    return `<${tag}${attrStr ? ` ${attrStr}` : ''}>${inner}</${tag}>`
  }
  return `<${tag}${attrStr ? ` ${attrStr}` : ''}/>`
}

export function hugeiconToSvg(icon: HugeIconNode[]): string {
  const body = icon.map(node => nodeToSvg(node)).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`
}
