import type { ProcessingContext } from '@data-fair/lib-common-types/processings.js'

export const flattenData = (data: any, mapping: any[], log: ProcessingContext['log']) => {
  if (!data) return {}
  const newData: any = buildEmptyRecord(mapping)

  mapping.forEach(item => {
    const value = getValueByPath(data, item.path)

    if (item.subFields) {
      extractSubFields(item.subFields, value, newData)
    } else if (Array.isArray(value)) {
      newData[item.key] = value.join(' ; ')
    } else {
      newData[item.key] = value ?? null
      if (item.key === 'offresrecues' && newData[item.key] === 'NC') newData[item.key] = null
    }
  })
  Object.entries(newData).forEach(([key, value]) => {
    const type = typeof value
    if (type === 'object' && value !== null) {
      log.warning(`${key} a un type objet`)
    }
  })
  return newData
}

const extractSubFields = (subFields: any[], parentValue: any, target: any) => {
  if (!Array.isArray(parentValue)) return

  subFields.forEach(sub => {
    if (sub.subFields) {
      const nestedArrays = parentValue.flatMap(entry => {
        const nested = getValueByPath(entry, sub.in)
        return Array.isArray(nested) ? nested : []
      })
      extractSubFields(sub.subFields, nestedArrays, target)
    } else {
      const values = parentValue.map(entry => {
        const val = getValueByPath(entry, sub.in)
        return val !== undefined && val !== null ? val : 'NC'
      })
      target[sub.out] = values.join(' ; ')
    }
  })
}

const buildEmptyRecord = (mapping: any[]): any => {
  const empty: any = {}

  const collectKeys = (subFields: any[]) => {
    subFields.forEach(sub => {
      if (sub.subFields) {
        collectKeys(sub.subFields)
      } else {
        empty[sub.out] = null
      }
    })
  }

  mapping.forEach(item => {
    if (item.subFields) {
      collectKeys(item.subFields)
    } else {
      empty[item.key] = null
    }
  })

  return empty
}

const getValueByPath = (obj: any, path: string): any => {
  if (!path || !obj) return null
  const keys = path.split('.')
  let current = obj
  for (const key of keys) {
    if (current && Object.prototype.hasOwnProperty.call(current, key)) {
      current = current[key]
    } else {
      return null
    }
  }
  return current
}
