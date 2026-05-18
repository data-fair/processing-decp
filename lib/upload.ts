import type { ProcessingConfig } from '../types/processingConfig/index.ts'
import type { ProcessingContext } from '@data-fair/lib-common-types/processings.js'
import fs from 'fs-extra'
import { chain } from 'stream-chain'
import { parser } from 'stream-json'
import { pick } from 'stream-json/filters/pick.js'
import { streamArray } from 'stream-json/streamers/stream-array.js'
import { countContract } from './utils.ts'
import { Writable, Transform } from 'stream'
import { flattenData } from './convert.ts'

export const sendFlattenData = async (mapping: any[], filtre: any, readFilePath: string, datasetId: string, context: ProcessingContext<ProcessingConfig>) => {
  const { log, axios } = context
  log.step('Début : Envoie des données')
  const count: number = await countContract(readFilePath, filtre)
  if (count === 0) return
  log.info('total : ' + count)
  const divisor = count / 100
  const MAX_BATCH_BYTES = 5 * 1024 * 1024 // 5 MB par exemple
  const sender = new WritableSender(axios, datasetId, log, divisor)
  const batcher = new Batcher(MAX_BATCH_BYTES)
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

  constructor (mapping: any[], log: ProcessingContext['log']) {
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

  constructor (maxBytes: number) {
    super({ objectMode: true })
    this.maxBytes = maxBytes
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
  private readonly delayBetweenBatches: number
  private readonly startFromBatch: number
  public increment: number = 0
  public dataset: any
  private abortController: AbortController | null = null

  constructor (
    axios: any,
    datasetId: string,
    log: ProcessingContext['log'],
    divisor: number,
    options: { delayMs?: number; startFromBatch?: number } = {}
  ) {
    super({ objectMode: true })
    this.axios = axios
    this.datasetId = datasetId
    this.log = log
    this.divisor = divisor
    this.delayBetweenBatches = options.delayMs ?? 0
    this.startFromBatch = options.startFromBatch ?? 0
  }

  /** Annule la requête en cours et stoppe le stream */
  abort () {
    this.log.warning(`Annulation demandée au batch ${this.batchIndex}`)
    this.abortController?.abort()
    this.destroy(new Error(`ABORTED_AT_BATCH:${this.batchIndex}`))
  }

  /** Index du dernier batch envoyé avec succès — à persister si besoin de reprise */
  get lastSuccessfulBatch () {
    return this.batchIndex - 1
  }

  private delay (ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private async sendWithRetry (batch: any[]): Promise<any> {
    for (let attempt = 1; attempt <= 2; attempt++) {
      this.abortController = new AbortController()

      // Timeout de 10 minutes
      const timeoutId = setTimeout(() => this.abortController!.abort(), 10 * 60 * 1000)

      try {
        this.log.info(`Batch ${this.batchIndex} — tentative ${attempt}/2`)

        const response = await this.axios({
          method: 'post',
          url: 'api/v1/datasets/' + this.datasetId + '/_bulk_lines',
          data: JSON.stringify(batch),
          headers: { 'content-type': 'application/json' },
          maxBodyLength: Infinity,
          signal: this.abortController.signal
        })

        clearTimeout(timeoutId)
        return response.data
      } catch (err: any) {
        clearTimeout(timeoutId)

        const isTimeout = err.code === 'ECONNABORTED' ||
          err.code === 'ERR_CANCELED' ||
          err.name === 'AbortError' ||
          err.name === 'CanceledError'

        // Annulation explicite (via abort()) — on remonte sans retry
        if (err.message?.startsWith('ABORTED_AT_BATCH:')) throw err

        if (isTimeout && attempt === 1) {
          this.log.warning(`Batch ${this.batchIndex} — pas de réponse après 10min, nouvelle tentative...`)
          continue
        }

        if (isTimeout && attempt === 2) {
          const message = `Batch ${this.batchIndex} — serveur non disponible après 20min, arrêt du processus`
          this.log.error(message)
          throw new Error(message)
        }

        this.log.error(`Batch ${this.batchIndex} — erreur inattendue : ${err.message}`)
        throw err
      }
    }
  }

  async _write (batch: any[], _encoding: string, callback: Function) {
    this.batchIndex++

    // Reprise : on saute les batchs déjà envoyés
    if (this.batchIndex <= this.startFromBatch) {
      this.log.info(`Batch ${this.batchIndex} — ignoré (reprise depuis ${this.startFromBatch})`)
      this.increment += batch.length
      return callback()
    }

    this.log.info(`Envoi batch ${this.batchIndex} (${batch.length} objets)`)
    this.increment += batch.length

    try {
      this.dataset = await this.sendWithRetry(batch)
      this.log.info(Math.round(this.increment / this.divisor) + '% des fichiers chargés')
      this.log.info(`Batch ${this.batchIndex} — ok: ${this.dataset.nbOk}, erreurs: ${this.dataset.nbErrors}`)

      if (this.delayBetweenBatches > 0) {
        await this.delay(this.delayBetweenBatches)
      }

      callback()
    } catch (err) {
      callback(err)
    }
  }
}
