import type { ProcessingConfig } from '../types/processingConfig/index.ts'
import type { ProcessingContext } from '@data-fair/lib-common-types/processings.js'
import fs from 'fs-extra'
import { chain } from 'stream-chain'
import { parser } from 'stream-json'
import { pick } from 'stream-json/filters/pick.js'
import { streamArray } from 'stream-json/streamers/stream-array.js'
import { disassembler } from 'stream-json/disassembler.js'
import stringer from 'stream-json/stringer.js'
import { PassThrough, Transform } from 'stream'

import { flattenData } from './convert.ts'

export const upload = async (context: ProcessingContext<ProcessingConfig>, datasetId: string, json: any) => {
  const { log, axios, processingConfig, patchConfig } = context
  try {
    const dataset = (await axios({
      method: 'post',
      url: 'api/v1/datasets/' + datasetId + '/_bulk_lines',
      data: json,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      headers: { 'content-type': 'application/json' }
    })).data
    await log.info(`jeu de donnée ${processingConfig.datasetMode === 'update' ? 'mis à jour' : 'créé'}, id="${dataset.id}", title="${dataset.title}"`)
    if (processingConfig.datasetMode === 'create') {
      await patchConfig({ datasetMode: 'update', dataset: { id: dataset.id, title: dataset.title } })
    }
  } catch (err) {
    console.log(JSON.stringify(err, null, 2))
  }
}

// class Batcher extends Transform {
//   private batch: any[] = []
//   private readonly batchSize: number

//   constructor (batchSize: number) {
//     super({ objectMode: true })
//     this.batchSize = batchSize
//   }

//   _transform (item: any, encoding: string, callback: () => void) {
//     this.batch.push(item)
//     if (this.batch.length >= this.batchSize) {
//       this.push(JSON.stringify(this.batch))
//       this.batch = []
//     }
//     callback()
//   }

//   _flush (callback: () => void) {
//     if (this.batch.length > 0) {
//       this.push(JSON.stringify(this.batch))
//     }
//     console.log('envoie donnee')
//     callback()
//   }
// }

// export const sendFlattenData = async (readFilePath: string, datasetId: string, context: ProcessingContext<ProcessingConfig>) => {
//   const count = await compterMarches(readFilePath, 'marches.marche')
//   const { log, axios, processingConfig, patchConfig } = context
//   const passThrough = new PassThrough()
//   let increment = 0

//   const sendPromise = axios({
//     method: 'post',
//     url: 'api/v1/datasets/' + datasetId + '/_bulk_lines',
//     data: passThrough,
//     maxContentLength: Infinity,
//     maxBodyLength: Infinity,
//     headers: { 'content-type': 'application/json', 'content-length': count },
//   })

//   await new Promise<void>((resolve, reject) => {
//     const pipeline = chain([
//       fs.createReadStream(readFilePath),
//       parser(),
//       pick({ filter: 'marches.marche' }),
//       streamArray(),

//       (data: any) => {
//         try {
//           increment++
//           const result = flattenData(data.value, increment, log)
//           return result ?? undefined
//         } catch (err: any) {
//           log.error(`Erreur sur un objet : ${err.message}`)
//           return undefined
//         }
//       },

//       disassembler(),
//       stringer({ makeArray: true }),
//       passThrough
//     ])

//     pipeline.on('error', reject)
//     passThrough.on('finish', resolve)
//   })

//   let dataset
//   try {
//     dataset = (await sendPromise).data
//     if (processingConfig.datasetMode === 'create') {
//       await patchConfig({ datasetMode: 'update', dataset: { id: dataset.id, title: dataset.title } })
//     }
//   } catch (err: any) {
//     console.log('status:', err?.response?.status)
//     console.log('message:', err?.response?.data)
//   }

//   return dataset
// }

export const sendFlattenData = async (readFilePath: string, datasetId: string, context: ProcessingContext<ProcessingConfig>) => {
  const { log, axios, processingConfig, patchConfig } = context
  const batchSize = 250
  let increment = 0
  let batchIndex = 0
  let currentBatch: any[] = []
  let dataset

  const sendBatch = async (batch: any[]) => {
    batchIndex++
    log.info(`Envoi batch ${batchIndex} (${batch.length} objets)`)
    try {
      const response = await axios({
        method: 'post',
        url: 'api/v1/datasets/' + datasetId + '/_bulk_lines',
        data: JSON.stringify(batch),
        headers: { 'content-type': 'application/json' },
        maxBodyLength: Infinity,
      })
      dataset = response.data
      // Pause pour respecter la limite API
      await new Promise(resolve => setTimeout(resolve, 200))
    } catch (err: any) {
      log.error(`Erreur batch ${batchIndex} : ${err?.response?.data ?? err.message}`)
      throw err
    }
  }

  await new Promise<void>((resolve, reject) => {
    const pipeline = chain([
      fs.createReadStream(readFilePath),
      parser(),
      pick({ filter: 'marches.marche' }),
      streamArray(),
      (data: any) => {
        try {
          increment++
          return flattenData(data.value, increment, log) ?? undefined
        } catch (err: any) {
          log.error(`Erreur sur un objet : ${err.message}`)
          return undefined
        }
      },
    ])

    pipeline.on('data', async (item) => {
      currentBatch.push(item)
      if (currentBatch.length >= batchSize) {
        // On pause le stream le temps d'envoyer
        pipeline.pause()
        const batch = currentBatch
        currentBatch = []
        try {
          await sendBatch(batch)
          pipeline.resume()
        } catch (err) {
          reject(err)
        }
      }
    })

    pipeline.on('end', async () => {
      // Envoyer le dernier batch incomplet
      if (currentBatch.length > 0) {
        try {
          await sendBatch(currentBatch)
        } catch (err) {
          reject(err)
          return
        }
      }
      resolve()
    })

    pipeline.on('error', reject)
  })

  if (processingConfig.datasetMode === 'create' && dataset) {
    await patchConfig({ datasetMode: 'update', dataset: { id: dataset.id, title: dataset.title } })
  }

  return dataset
}

const compterMarches = async (cheminFichier: string, filter: string) => {
  let compteur = 0

  return new Promise((resolve, reject) => {
    const pipeline = chain([
      fs.createReadStream(cheminFichier),
      parser(),
      pick({ filter: `${filter}` }),
      streamArray()
    ])
    pipeline.on('data', () => {
      compteur++
    })
    pipeline.on('end', () => resolve(compteur))
    pipeline.on('error', reject)
  })
}
