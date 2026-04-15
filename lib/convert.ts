import mapping from './mapping_decp.json' with { type: 'json' }
import type { ProcessingContext } from '@data-fair/lib-common-types/processings.js'

import fs from 'fs-extra'
import path from 'node:path'
import { chain } from 'stream-chain'
import { parser } from 'stream-json'
import { pick } from 'stream-json/filters/pick.js'
import { streamArray } from 'stream-json/streamers/stream-array.js'
import { disassembler } from 'stream-json/disassembler.js'
import stringer from 'stream-json/stringer.js'

export const writeCsv = async (jsonPath: string, destDir: string) => {
  const csvPath = path.join(destDir, 'result_flatten.csv')
  const data: any[] = await fs.readJson(jsonPath)

  const headers = Object.keys(data[0])
  const rows = data.map(obj =>
    headers.map(h => {
      const val = obj[h] !== null && obj[h] !== undefined ? obj[h] : ''
      return typeof val === 'string' && (val.includes(';') || val.includes('"'))
        ? `"${val.replace(/"/g, '""')}"`
        : val
    }).join(';')
  )

  await fs.writeFile(csvPath, '\uFEFF' + [headers.join(';'), ...rows].join('\n'), 'utf-8')
  return csvPath
}

export const writeFlattenData = async (readFilePath: string, destDir: string, desFile: string, log: ProcessingContext['log']) => {
  const tmpPath = path.join(destDir, desFile)
  let increment = 0
  await fs.ensureDir(destDir)
  // TODO découper des brique dans mon data
  return new Promise<string>((resolve, reject) => {
    const writeStream = fs.createWriteStream(tmpPath)
    const pipeline = chain([
      fs.createReadStream(readFilePath),
      parser(),
      pick({ filter: 'marches.marche' }),
      streamArray(),

      (data: any) => {
        try {
          increment++
          const result = flattenData(data.value, increment, log)
          return result ?? undefined // undefined = ignoré par stream-chain
        } catch (err : any) {
          log.error(`Erreur sur un objet : ${err.message}`)
          return undefined
        }
      },
      disassembler(),
      stringer({ makeArray: true }),
      writeStream

    ])

    writeStream.on('close', () => resolve(tmpPath))

    pipeline.on('error', (err) => {
      reject(new Error(`Échec de la lecture/traitement : ${err.message}`))
    })
  })
}

export const flattenData = (data: any, increment: number, log: ProcessingContext['log']) => {
  log.info('flatten data : ' + increment)
  if (!data) return {}
  const newData: any = buildEmptyRecord()
  newData['idcontrat'] = increment

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

const buildEmptyRecord = (): any => {
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
