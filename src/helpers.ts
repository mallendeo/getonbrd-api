import type { AnyNode, Cheerio } from 'cheerio'

export interface PropMapRules {
  [key: string]: [
    RegExp,
    (match: string) => string | number | (string | number)[],
  ]
}

export function txt(el: Cheerio<AnyNode>): string {
  return el.text().trim()
}

export const extractFromArr = (items: string[], propMap: PropMapRules) => {
  return items.reduce((obj, curr) => {
    for (const prop in propMap) {
      const value = propMap[prop]
      const isArr = Array.isArray(value)
      const reg = isArr ? value[0] : value
      const [, match] = curr.match(reg) || []
      if (match) return { ...obj, [prop]: isArr ? value[1](match) : match }
    }

    return obj
  }, {})
}

export const getUnit = (str: string) => {
  const units = ['minute', 'hour', 'day', 'week']
  return units.find((unit) => str.includes(unit))
}
