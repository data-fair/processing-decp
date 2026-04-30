import type { ProcessingContext } from '@data-fair/lib-common-types/processings.js'
import type { ProcessingConfig } from '../types/processingConfig/index.ts'

import fs from 'fs-extra'
import { pipeline } from 'node:stream/promises'
import path from 'node:path'
import dayjs from 'dayjs'
import { urlDecp } from './url.ts'

class FileNotFoundError extends Error {
  constructor (message: string) {
    super(message)
    this.name = 'FileNotFoundError'
  }
}

export const listAttachements = async (context: ProcessingContext<ProcessingConfig>) => {
  const { axios, log } = context
  const url = urlDecp.DATASET_DECP_CONSOLIDES
  log.step('Search available files')

  try {
    const { data } = await axios.get(url)
    const patternYear = /^decp-\d{4}.json$/

    const res = data.resources.filter((r: any) => r.title.match(patternYear)).map((r: any) => {
      return {
        title: r.title,
        url: r.latest || r.url
      }
    })
    return res
  } catch (err: any) {
    if (err.response?.status === 404) throw new FileNotFoundError(`File not found: ${url}`)
    throw err
  }
}

export const getAttachement = async (url: string, tmpDir: string, axios: ProcessingContext['axios']) => {
  const opts: any = { responseType: 'stream', maxRedirects: 4 }
  const tmpPath = path.join(tmpDir, 'tmp_decp.json')

  await fs.ensureDir(tmpDir)
  console.log(`url reçu ${url}`)
  let res
  try {
    res = await axios.get(url, opts)
  } catch (err: any) {
    if (err.response?.status === 404) throw new FileNotFoundError(`File not found: ${url}`)
    throw err
  }
  try {
    const writer = fs.createWriteStream(tmpPath)
    await pipeline(res.data, writer)
    return tmpPath
  } catch (err: any) {
    throw new Error(`Échec de l'écriture sur le disque : ${err.message}`)
  }
}

// ============ Source API DECP ==============

export const getDailyAttachement = async (date:string, context: ProcessingContext<ProcessingConfig>) => {
  const { axios, } = context
  const url = urlDecp.DATASET_API_DECP
  try {
    const { data } = await axios.get(url)

    const res = data.resources.filter((r: any) => dayjs(r.last_modified).format('YYYY-MM-DD') === date).map((r: any) => {
      return r.latest
    })
    return res
  } catch (err: any) {
    if (err.response?.status === 404) throw new FileNotFoundError(`File not found: ${url}`)
    throw err
  }
}
