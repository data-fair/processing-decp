import type { ProcessingConfig } from '../types/processingConfig/index.ts'
import type { ProcessingContext } from '@data-fair/lib-common-types/processings.js'
import { listAttachements, getAttachement } from './fetch.ts'
import fs from 'fs-extra'
import { sendFlattenData, getAndSendAttachment } from './upload.ts'

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// importer tous les fichier annuelle de decp
// export const initialize = async (mapping: any[], context: ProcessingContext<ProcessingConfig>) => {
//   const { log } = context
//   log.info('Envoi du contenu decp global')

//   log.task('envoi du contenu de marches.marche')
//   await getAndSendAttachment('https://www.data.gouv.fr/api/1/datasets/r/2551ad40-584a-42fd-b3cc-e8906183287e',
//     mapping, 'marches.marche',
//     context.processingId,
//     context
//   )
//   log.task('envoie du marches.contrat-concession')
//   await getAndSendAttachment('https://www.data.gouv.fr/api/1/datasets/r/2551ad40-584a-42fd-b3cc-e8906183287e',
//     mapping, 'marches.contrat-concession',
//     context.processingId,
//     context
//   )

//   log.step('fin de l\'initialisation')
// }
export const initialize = async (mapping: any[], filters:string[], context: ProcessingContext<ProcessingConfig>) => {
  const { log, tmpDir, axios } = context
  // récupérer tous les decp
  const list: any[] = await listAttachements(context)
  // faire une boucle pour chaque decp
  for (const e of list) {
    log.step(`Traitement de ${e.title}`)
    log.info('Lancement du téléchargement')
    const path = await getAttachement(e.url, tmpDir, axios)
    log.info('Envoie de la donnée')
    for (const filter of filters) {
      log.info(`envoie des données du filtre ${filter}`)
      await sendFlattenData(mapping, filter, path, context.processingId, context)
    }

    log.info(`Supprimer ${e.title} du dossier local`)
    await fs.promises.unlink(path)
  }

  log.step('fin de l\'initialisation')
}
