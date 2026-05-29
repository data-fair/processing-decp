import { chain } from 'stream-chain'
import { parser } from 'stream-json'
import { pick } from 'stream-json/filters/pick.js'
import { streamArray } from 'stream-json/streamers/stream-array.js'
import fs from 'fs-extra'

export const countContract = async (pathFile: string, filter: string) => {
  let compteur: number = 0

  return new Promise<number>((resolve, reject) => {
    const pipeline = chain([
      fs.createReadStream(pathFile),
      parser(),
      pick({ filter: `${filter}` }),
      streamArray()
    ])
    pipeline.on('data', () => {
      compteur++
    })
    pipeline.on('end', () => resolve(compteur))
    pipeline.on('error', (err) => {
      if (err.message === 'Top-level object should be an array.') {
        resolve(0)
      } else {
        reject(err)
      }
    })
  })
}
