import type { ProcessingConfig } from './types/processingConfig/index.ts'
import type { ProcessingContext } from '@data-fair/lib-common-types/processings.js'
import { initializeWithAnnualDecp, dailyDecp } from './lib/execute.ts'

import datasetSchema from './lib/dataset-schema.ts'
import dayjs from 'dayjs'

// List of mapping available
import mapping from './lib/mapping/mapping_decp.json' with { type: 'json' }

export const run = async (context: ProcessingContext<ProcessingConfig>) => {
  // TODO écouter condition si initialisé et comment
  const { processingConfig, log, axios, processingId } = context
  const create = processingConfig.datasetMode === 'create'
  const update = processingConfig.datasetMode === 'update'
  const initialize = processingConfig.initializeDataset
  const filters = ['marches.marche', 'marches.contrat-concession', 'marches']

  if (create) {
    const title = processingConfig.datasetTitle as string
    // const title = 'decp test'
    await log.step(`Creating dataset "${title}"`)
    const dataset = (await axios.post('api/v1/datasets', {
      title,
      isRest: true,
      schema: datasetSchema,
      extras: { processingId }
    })).data
    await log.info(`Dataset created, id="${dataset.id}", title="${dataset.title}"`)
    context.processingId = dataset.id
  }

  if (update) {
    const date = processingConfig._overrideDate as string ?? dayjs().format('YYYY-MM-DD')
    await dailyDecp(mapping, filters, date, context)
  }

  if (initialize) {
    // TODO envoyer les données avec la méthode adéquante
    await initializeWithAnnualDecp(mapping, filters, context)
  } else {
    log.info('Aucune initialisation requise')
  }
}
