import type { ProcessingConfig } from '../types/processingConfig/index.ts'
import type { ProcessingContext } from '@data-fair/lib-common-types/processings.js'
import { getAttachement } from './fetch.ts'
import fs from 'fs-extra'
import { sendFlattenData } from './upload.ts'

// Importe decp global
export const initialize = async (mapping: any[], filters: string[], urlGlobal: string, context: ProcessingContext<ProcessingConfig>) => {
  const { log, tmpDir, axios } = context
  log.info('Envoi du contenu decp global')
  const path = await getAttachement(urlGlobal, tmpDir, axios)
  log.info('Envoie de la donnée')
  for (const filter of filters) {
    log.info(`envoie des données du filtre ${filter}`)
    await sendFlattenData(mapping, filter, path, context.processingId, context)
  }
  log.info('Supprimer du dossier local')
  await fs.promises.unlink(path)
  log.step('fin de l\'initialisation')
}

// importer tous les fichier annuelle de decp
// export const initialize = async (mapping: any[], filters: string[], context: ProcessingContext<ProcessingConfig>) => {
//   const { log, tmpDir, axios } = context
//   // récupérer tous les decp
//   const list: any[] = await listAttachements(context)
//   // faire une boucle pour chaque decp
//   for (const e of list) {
//     log.step(`Traitement de ${e.title}`)
//     log.info('Lancement du téléchargement')
//     const path = await getAttachement(e.url, tmpDir, axios)
//     log.info('Envoie de la donnée')
//     for (const filter of filters) {
//       log.info(`envoie des données du filtre ${filter}`)
//       await sendFlattenData(mapping, filter, path, context.processingId, context)
//     }

//     log.info(`Supprimer ${e.title} du dossier local`)
//     await fs.promises.unlink(path)
//   }

//   log.step('fin de l\'initialisation')
// }
