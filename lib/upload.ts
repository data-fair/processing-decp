import type { ProcessingConfig } from '../types/processingConfig/index.ts'
import type { ProcessingContext } from '@data-fair/lib-common-types/processings.js'
import fs from 'fs-extra'
import { chain } from 'stream-chain'
import { parser } from 'stream-json'
import { pick } from 'stream-json/filters/pick.js'
import { streamArray } from 'stream-json/streamers/stream-array.js'
import { countContrat } from './utils.ts'
import { Writable, Transform } from 'stream'
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
  const count: number = await countContrat(readFilePath, filtre)
  log.warning('total : ' + count)
  const divisor = count / 100
  const MAX_BATCH_BYTES = 5 * 1024 * 1024 // 5 MB par exemple
  const sender = new WritableSender(axios, datasetId, log, divisor)
  const batcher = new Batcher(MAX_BATCH_BYTES, log)
  const flatten = new FlattenTransform(mapping, log)
  await new Promise<void>((resolve, reject) => {
    const pipeline = chain([
      fs.createReadStream(readFilePath),
      parser(),
      pick({ filter: filtre }),
      streamArray(),
      flatten,
      batcher,
    ])
    pipeline.pipe(sender)
    pipeline.on('error', reject)
    sender.on('finish', resolve)
    sender.on('error', reject)
  })
  return sender.dataset
}

class FlattenTransform extends Transform {
  private readonly mapping: any[]
  private log: any

  constructor (mapping: any[], log: any) {
    super({ objectMode: true })
    this.mapping = mapping
    this.log = log
  }

  _transform (data: any, _encoding: string, callback: Function) {
    try {
      const result = flattenData(data.value, this.mapping, this.log)
      if (result) this.push(result)
    } catch (err: any) {
      this.log.error(`Erreur sur un objet : ${err.message}`)
    }
    callback()
  }
}

class Batcher extends Transform {
  private batch: any[] = []
  private batchBytes: number = 0
  private readonly maxBytes: number
  private log: any

  constructor (maxBytes: number, log: any) {
    super({ objectMode: true })
    this.maxBytes = maxBytes
    this.log = log
  }

  _transform (item: any, _encoding: string, callback: Function) {
    const itemBytes = Buffer.byteLength(JSON.stringify(item), 'utf8')
    this.batchBytes += itemBytes
    this.batch.push(item)
    if (this.batchBytes >= this.maxBytes) {
      this.push(this.batch)
      this.batch = []
      this.batchBytes = 0
    }
    callback()
  }

  _flush (callback: any) {
    if (this.batch.length > 0) this.push(this.batch)
    callback()
  }
}

class WritableSender extends Writable {
  private batchIndex: number = 0
  private readonly axios: any
  private readonly datasetId: string
  private readonly log: any
  private readonly divisor: number
  public increment: number = 0
  public dataset: any

  constructor (axios: any, datasetId: string, log: any, divisor: number) {
    super({ objectMode: true })
    this.axios = axios
    this.datasetId = datasetId
    this.log = log
    this.divisor = divisor
  }

  private async sendWithRetry (batch: any[]): Promise<any> {
    const TIMEOUT_MS = 10 * 60 * 1000  // 10 minutes

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        this.log.info(`Batch ${this.batchIndex} — tentative ${attempt}/2`)
        const response = await this.axios({
          method: 'post',
          url: 'api/v1/datasets/' + this.datasetId + '/_bulk_lines',
          data: JSON.stringify(batch),
          headers: { 'content-type': 'application/json' },
          maxBodyLength: Infinity,
          timeout: TIMEOUT_MS
        })
        return response.data
      } catch (err: any) {
        const isTimeout = err.code === 'ECONNABORTED' || err.code === 'ERR_CANCELED'

        if (attempt === 1 && isTimeout) {
          // Premier timeout — on réessaie
          this.log.warning(`Batch ${this.batchIndex} — pas de réponse après 10min, nouvelle tentative...`)
          continue
        }

        if (attempt === 2 && isTimeout) {
          // Deuxième timeout — on coupe
          const message = `Batch ${this.batchIndex} — serveur non disponible après 20min, arrêt du processus`
          this.log.error(message)
          throw new Error(message)
        }

        // Autre erreur (réseau, 500...) — on coupe immédiatement
        this.log.error(`Batch ${this.batchIndex} — erreur inattendue : ${err.message}`)
        throw err
      }
    }
  }

  async _write (batch: any[], _encoding: string, callback: Function) {
    this.batchIndex++
    this.log.info(`Envoi batch ${this.batchIndex} (${batch.length} objets)`)
    this.increment += batch.length
    try {
      this.dataset = await this.sendWithRetry(batch)
      this.log.info(Math.round(this.increment / this.divisor) + '% des fichiers chargés')
      this.log.info(`Batch ${this.batchIndex} — ok: ${this.dataset.nbOk}, erreurs: ${this.dataset.nbErrors}`)
      await new Promise(resolve => setTimeout(resolve, 10000))
      callback()
    } catch (err) {
      callback(err)
    }
  }
}
