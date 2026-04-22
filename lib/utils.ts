import { Writable } from 'stream'

export class Batcher extends Writable {
  private batch: any[] = []
  private batchBytes: number = 0
  private readonly maxBytes: number
  private readonly onBatch: (batch: any[]) => Promise<void>

  constructor (maxBytes: number, onBatch: (batch: any[]) => Promise<void>) {
    super({ objectMode: true })

    this.maxBytes = maxBytes
    this.onBatch = onBatch
  }

  _write (item: any, _encoding: string, callback: (err?: Error) => void) {
    const itemBytes = Buffer.byteLength(JSON.stringify(item), 'utf8')

    this.batch.push(item)
    this.batchBytes += itemBytes

    if (this.batchBytes >= this.maxBytes) {
      const toSend = this.batch
      this.batch = []
      this.batchBytes = 0
      this.onBatch(toSend)
        .then(() => callback())
        .catch(callback)
    } else {
      callback()
    }
  }

  _final (callback: (err?: Error) => void) {
    if (this.batch.length > 0) {
      this.onBatch(this.batch)
        .then(() => callback())
        .catch(callback)
    } else {
      callback()
    }
  }
}

export class SenderHttp {
  private batchIndex: number = 0
  private readonly axios: any
  private readonly datasetId: string
  private readonly log: any
  private readonly divisor: number

  constructor (axios: any, datasetId: string, log: any, divisor: number) {
    this.axios = axios
    this.datasetId = datasetId
    this.log = log
    this.divisor = divisor
  }

  async send (batch: any[], increment: number) {
    this.batchIndex++
    this.log.info(`Envoi batch ${this.batchIndex} (${batch.length} objets)`)

    const response = await this.axios({
      method: 'post',
      url: 'api/v1/datasets/' + this.datasetId + '/_bulk_lines',
      data: JSON.stringify(batch),
      headers: { 'content-type': 'application/json' },
      maxBodyLength: Infinity,
    })

    const dataset = response.data
    this.log.info(Math.round(increment / this.divisor) + '% des fichiers chargés')
    this.log.info(`Batch ${this.batchIndex} — ok: ${dataset.nbOk}, erreurs: ${dataset.nbErrors}, non modifiés: ${dataset.nbNotModified}`)

    if (dataset.nbErrors > 0) {
      dataset.errors.forEach((e: any) => {
        const props = [...e.error.matchAll(/\((\w+)\)/g)].map(m => m[1]).join(', ')
        const message = props ? `propriétés non autorisées : ${props}` : e.error
        this.log.info(`  ⚠️ Ligne ${e.line} : ${message}`)
      })
    }

    return dataset
  }
}
