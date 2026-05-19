import type { ProcessingConfig } from '../types/processingConfig/index.ts'
import type { ProcessingContext } from '@data-fair/lib-common-types/processings.js'
import { getAttachement, listAttachements, getDailyAttachement } from './fetch.ts'
import fs from 'fs-extra'
import dayjs from 'dayjs'
import { sendFlattenData } from './upload.ts'

// Importe decp global
export const initializeWithGlobalDecp = async (mapping: any[], filters: string[], pathDECP: string, datasetId: string, context: ProcessingContext<ProcessingConfig>) => {
  const { log, processingConfig } = context
  const patternGlobal = /^decp-global\.json$/
  const list: any[] = await listAttachements(context, patternGlobal)
  const lastUpdate = list[0].date
  log.info(`Dernière mise à jour du decp global : ${lastUpdate}`)
  const dates = getDatesFrom(lastUpdate, processingConfig._overrideDate as string)

  for (const filter of filters) {
    await sendFlattenData('DECP global', mapping, filter, pathDECP, datasetId, context)
  }
  for (const date of dates) {
    await dailyDecp(mapping, filters, date, datasetId, context)
  }
}

// export const initializeWithAnnualDecp = async (mapping: any[], filters: string[], context: ProcessingContext<ProcessingConfig>) => {
//   const { log, tmpDir, axios } = context
//   const patternYear = /^decp-\d{4}.json$/

//   // récupérer tous les decp
//   const list: any[] = await listAttachements(context, patternYear)
//   // faire une boucle pour chaque decp
//   for (const e of list) {
//     log.step(`Traitement de ${e.title}`)
//     log.info('Lancement du téléchargement')
//     const path = await getAttachement(e.url, tmpDir, axios)
//     log.info('Envoie de la donnée')
//     // Téléchargement de tous les decp annuel
//     for (const filter of filters) {
//       log.info(`envoie des données du filtre ${filter}`)
//       await sendFlattenData(mapping, filter, path, context.processingId, context)
//     }

//     log.info(`Supprimer ${e.title} du dossier local`)
//     await fs.promises.unlink(path)
//   }

//   log.step('fin de l\'initialisation')
// }

export const dailyDecp = async (mapping: any[], filters: string[], date: string, datasetId: string, context: ProcessingContext<ProcessingConfig>) => {
  const { log, tmpDir, axios } = context
  const url = await getDailyAttachement(date, context)
  if (!url.length) {
    log.info(`Aucun decp publié le ${date}`)
    return
  }
  const path = await getAttachement(url.toString(), tmpDir, `${date}.json`, axios)
  for (const filter of filters) {
    await sendFlattenData(date, mapping, filter, path, datasetId, context)
  }
  await fs.promises.unlink(path)
}

const getDatesFrom = (from: string, to?: string): string[] => {
  const start = dayjs(from).startOf('day')
  const today = to ? dayjs(to) : dayjs().startOf('day')
  const dates: string[] = []

  let current = start
  while (current.isBefore(today) || current.isSame(today)) {
    dates.push(current.format('YYYY-MM-DD'))
    current = current.add(1, 'day')
  }

  return dates
}
