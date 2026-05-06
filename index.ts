import type { ProcessingConfig } from './types/processingConfig/index.ts'
import type { ProcessingContext } from '@data-fair/lib-common-types/processings.js'
import { initializeWithAnnualDecp, initializeWithGlobalDecp, dailyDecp } from './lib/execute.ts'

import datasetSchema from './lib/schema/dataset-schema.ts'
import datasetSchemaMarche from './lib/schema/dataset-schema-marche.ts'
import datasetSchemaConcession from './lib/schema/dataset-schema-concession.ts'
import dayjs from 'dayjs'
import { urlDecp } from './lib/url.ts'

// List of mapping available
import mapping from './lib/mapping/mapping_decp.json' with { type: 'json' }
import mappingMarche from './lib/mapping/mapping_decp_marche.json' with { type: 'json' }
import mappingConcession from './lib/mapping/mapping_decp_concession.json' with { type: 'json' }

export const run = async (context: ProcessingContext<ProcessingConfig>) => {
  const { processingConfig, log, axios, processingId } = context
  const create = processingConfig.datasetMode === 'create'
  const update = processingConfig.datasetMode === 'update'
  const initialize = processingConfig.initializeDataset
  const filtersConcession = ['marches.contrat-concession']
  const filtersMarche = ['marches.marche']
  const primaryKeyConcession = ['id', 'valeurglobal', 'autoriteconcedanteid', 'concessionnairessiret', 'objet']
  const primaryKeyMarche = ['id', 'montant', 'acheteurid', 'titulairesiret', 'objet']
  const extensions = [
    {
      active: true,
      type: 'remoteService',
      remoteService: 'koumoul-com-dataset-sirene',
      action: 'masterData_bulkSearch_siret-infos',
      select: [
        'denominationUniteLegale',
        '_siret_coords.y_latitude',
        '_siret_coords.x_longitude',
        '_infos_commune.code_departement',
        '_infos_commune.code_region'
      ],
      overwrite: {},
      propertyPrefix: '_siret_infos'
    }
  ]

  if (create) {
    const titleBase = processingConfig.datasetTitle as string
    await log.step(`Creating dataset "${titleBase}"`)
    // -- Récupération des condition de filtrage pour savoir combien de tableau créer
    const marcheFilter = processingConfig.datasetFilterCreate === 'all' || processingConfig.datasetFilterCreate === 'marche'
    const marcheConcession = processingConfig.datasetFilterCreate === 'all' || processingConfig.datasetFilterCreate === 'concession'
    await log.info(`Filtre marché : "${marcheFilter}"`)
    await log.info(`Filtre concession : "${marcheConcession}"`)

    // Filtrer la concessions
    if (marcheConcession) {
      const title = titleBase + ' (concession)'

      const dataset = (await axios.post('api/v1/datasets', {
        title,
        isRest: true,
        schema: datasetSchemaConcession,
        primaryKey: primaryKeyConcession,
        extensions,
        extras: { processingId }
      })).data
      await log.info(`Dataset created, id="${dataset.id}", title="${dataset.title}"`)
      await log.info('Dataset créé/récupéré avec extensions:', dataset.extensions)
      context.processingId = dataset.id
      if (initialize) {
        // await initializeWithAnnualDecp(mappingConcession, filtersConcession, context)
        await initializeWithGlobalDecp(mappingConcession, filtersConcession, urlDecp.DECP_GLOBAL, context)
      } else {
        log.info('Aucune initialisation requise')
      }
    }

    if (marcheFilter) {
      const title = titleBase + ' (marché)'

      const dataset = (await axios.post('api/v1/datasets', {
        title,
        isRest: true,
        schema: datasetSchemaMarche,
        primaryKey: primaryKeyMarche,
        extensions,
        extras: { processingId }
      })).data
      await log.info(`Dataset created, id="${dataset.id}", title="${dataset.title}"`)
      context.processingId = dataset.id
      if (initialize) {
        // await initializeWithAnnualDecp(mapping, filtersMarche, context)
        await initializeWithGlobalDecp(mappingMarche, filtersMarche, urlDecp.DECP_GLOBAL, context)
      } else {
        log.info('Aucune initialisation requise')
      }
    }
  }

  if (update) {
    const marcheFilter = processingConfig.datasetFilterUpdate === 'marche'
    const marcheConcession = processingConfig.datasetFilterUpdate === 'concession'
    const date = processingConfig._overrideDate as string ?? dayjs().format('YYYY-MM-DD')
    if (marcheFilter) {
      await dailyDecp(mappingMarche, filtersMarche, date, context)
    }
    if (marcheConcession) {
      await dailyDecp(mappingConcession, filtersConcession, date, context)
    }
  }
}
