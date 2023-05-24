export interface Option<T extends object = any> extends Record<string, any> {
  label: string
  key: keyof T
  value: T[keyof T]
}

export type Options<T extends object = any> = Option<T>[]

export interface Description {
  label: string
  [key: string]: string
}

export function describeEnum<T extends object>(
  enumObject: T,
  descriptions: Partial<Record<keyof T, string | Description>>
): Options<T> {
  return Object.entries(enumObject).reduce<Options<T>>((options, item) => {
    const key = item[0] as keyof T
    const value = item[1]
    const description = descriptions[key]
    if (!description) return options
    if (typeof description === 'string') {
      options.push({
        label: description,
        key,
        value
      })
      return options
    } else {
      options.push({
        ...description,
        key,
        value
      })
    }

    return options
  }, [])
}
