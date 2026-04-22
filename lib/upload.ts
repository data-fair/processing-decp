import type { ProcessingConfig } from '../types/processingConfig/index.ts'
import type { ProcessingContext } from '@data-fair/lib-common-types/processings.js'
import fs from 'fs-extra'
import { chain } from 'stream-chain'
import { parser } from 'stream-json'
import { pick } from 'stream-json/filters/pick.js'
import { streamArray } from 'stream-json/streamers/stream-array.js'
import { Batcher, SenderHttp } from './utils.ts'

import { flattenData } from './convert.ts'

// Sert pour envoyer un fichier court et déjà formater, permet des test simple mais n'est pas là pour rester
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

export const sendFlattenData = async (mapping: any[], filtre: any, readFilePath: string, datasetId: string, context: ProcessingContext<ProcessingConfig>) => {
  const { log, axios } = context
  log.step('Début : Envoie des données')
  const count: number = await compterMarches(readFilePath, filtre)
  log.warning('total : ' + count)
  const divisor = count / 100
  // const batchSize = 700
  let increment = 0
  // let batchIndex = 0
  // let currentBatch: any[] = []
  // let dataset
  const MAX_BATCH_BYTES = 5 * 1024 * 1024 // 5 MB par exemple
  // let currentBatchBytes = 0

  // const sendBatch = async (batch: any[]) => {
  //   // await new Promise(resolve => setTimeout(resolve, 11000))
  //   batchIndex++
  //   log.info(`Envoi batch ${batchIndex} (${batch.length} objets)`)
  //   try {
  //     const response = await axios({
  //       method: 'post',
  //       url: 'api/v1/datasets/' + datasetId + '/_bulk_lines',
  //       data: JSON.stringify(batch),
  //       headers: { 'content-type': 'application/json' },
  //       maxBodyLength: Infinity,
  //     })
  //     dataset = response.data

  //     // Résumé du batch
  //     log.info(Math.round(increment / divisor) + '% des fichiers chargés')
  //     log.info(`Batch ${batchIndex} — ok: ${dataset.nbOk}, erreurs: ${dataset.nbErrors}, non modifiés: ${dataset.nbNotModified}`)

  //     // Détail des erreurs ligne par ligne
  //     if (dataset.nbErrors > 0) {
  //       dataset.errors.forEach((e: any) => {
  //         // On reformate les erreurs de propriétés additionnelles pour plus de lisibilité
  //         const props = [...e.error.matchAll(/\((\w+)\)/g)].map(m => m[1]).join(', ')
  //         const message = props ? `propriétés non autorisées : ${props}` : e.error
  //         log.info(`  ⚠️ Ligne ${e.line} : ${message}`)
  //       })
  //     }
  //   } catch (err: any) {
  //     console.log(JSON.stringify(err, null, 2))
  //     throw err
  //   }
  // }

  await new Promise<void>((resolve, reject) => {
    const sender = new SenderHttp(axios, datasetId, log, divisor)
    const batchSender = new Batcher(
      MAX_BATCH_BYTES,
      (batch) => sender.send(batch, increment)
    )
    const pipeline = chain([
      fs.createReadStream(readFilePath),
      parser(),
      pick({ filter: filtre }),
      streamArray(),
      (data: any) => {
        try {
          increment++
          return flattenData(data.value, mapping, increment, log) ?? undefined
        } catch (err: any) {
          log.error(`Erreur sur un objet : ${err.message}`)
          return undefined
        }
      },

    ])
    pipeline.pipe(batchSender)
    batchSender.on('error', reject)
    batchSender.on('finish', resolve)
  })
}

const compterMarches = async (cheminFichier: string, filter: string) => {
  let compteur: number = 0

  return new Promise<number>((resolve, reject) => {
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
