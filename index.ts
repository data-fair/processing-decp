import type { ProcessingConfig } from './types/processingConfig/index.ts'
import type { ProcessingContext } from '@data-fair/lib-common-types/processings.js'
import fs from 'fs-extra'
import util from 'util'
import { listAttachements, getAttachement } from './lib/fetch.ts'
import { writeFlattenData } from './lib/convert.ts'

export const run = async (context: ProcessingContext<ProcessingConfig>) => {
  // lancement de la recherche du fichier,récupération d'une url
  const attachements = await listAttachements(context)
  // Récupérer decp brute et le traiter
  const { log, axios, tmpDir, processingConfig, patchConfig } = context
  const filename = await getAttachement(attachements[0].url, tmpDir, axios) // récupère le path du fichier télécharger
  // TODO applatir les données
  const filnameTransform = await writeFlattenData(filename, tmpDir, 'decp_flatten.json', log)
  // TODO adapter avec le schemas les données

  // TODO envoyé données


  // TODO voir pour supprimer les fichiers de référence pour le traitement
}
