import type { ProcessingConfig } from './types/processingConfig/index.ts'
import type { ProcessingContext } from '@data-fair/lib-common-types/processings.js'

// import datasetSchema from './lib/schema/dataset-schema.ts'
import datasetSchemaMarche from './lib/schema/dataset-schema-marche.ts'
import datasetSchemaConcession from './lib/schema/dataset-schema-concession.ts'
import dayjs from 'dayjs'
import fs from 'fs-extra'
import { urlDecp } from './lib/url.ts'
import { getAttachement } from './lib/fetch.ts'
import { initializeWithGlobalDecp, dailyDecp } from './lib/execute.ts'

// List of mapping available
// import mapping from './lib/mapping/mapping_decp.json' with { type: 'json' }
import mappingMarche from './lib/mapping/mapping_decp_marche.json' with { type: 'json' }
import mappingConcession from './lib/mapping/mapping_decp_concession.json' with { type: 'json' }

export const run = async (context: ProcessingContext<ProcessingConfig>) => {
  const { processingConfig, log, axios, processingId, tmpDir, patchConfig } = context
  const create = processingConfig.datasetMode === 'create'
  const update = processingConfig.datasetMode === 'update'
  const filtersConcession = ['marches.contrat-concession']
  const filtersMarche = ['marches.marche']

  if (create) {
    const titleBase = processingConfig.datasetTitle as string
    const initialize = processingConfig.initializeDataset
    const extensions = [
      {
        active: true,
        type: 'remoteService',
        remoteService: 'dataset:geolocalisation-des-etablissements-du-repertoire-sirene',
        action: 'masterData_bulkSearch_siret-coords',
        select: [
          'x_longitude',
          'y_latitude'
        ],
        overwrite: {},
        propertyPrefix: '_siret_coords'
      },
      {
        active: true,
        type: 'remoteService',
        remoteService: 'dataset:sirene',
        action: 'masterData_bulkSearch_siret-infos',
        select: [
          '_infos_commune.code_departement',
          '_infos_commune.code_region',
          'denominationUniteLegale'
        ],
        overwrite: {},
        propertyPrefix: '_siret_infos'
      }
    ]
    // const extensions = [
    //   {
    //     active: true,
    //     type: 'remoteService',
    //     remoteService: 'koumoul-com-dataset-sirene',
    //     action: 'masterData_bulkSearch_siret-infos',
    //     select: [
    //       'denominationUniteLegale',
    //       '_siret_coords.y_latitude',
    //       '_siret_coords.x_longitude',
    //       '_infos_commune.code_departement',
    //       '_infos_commune.code_region'
    //     ],
    //     overwrite: {},
    //     propertyPrefix: '_siret_infos'
    //   }
    // ]

    const all = processingConfig.datasetFilterCreate === 'all'
    const marcheFilter = all || processingConfig.datasetFilterCreate === 'marche'
    const marcheConcession = all || processingConfig.datasetFilterCreate === 'concession'
    let pathDECP
    log.step(all ? 'Debut de la création des jeux de données' : 'Début de la création du jeu de donnée')
    if (initialize) {
      log.info('Récupération des données d\'initialisation sur data.gouv')
      pathDECP = await getAttachement(urlDecp.DECP_GLOBAL, tmpDir, 'global.json', axios)
    }

    // Filtrer la concessions
    if (marcheConcession) {
      const primaryKeyConcession = ['id', 'valeurglobale', 'autoriteconcedanteid', 'concessionnairesid', 'objet']
      const title = titleBase + ' (concession)'

      const dataset = (await axios.post('api/v1/datasets', {
        title,
        isRest: true,
        schema: datasetSchemaConcession,
        primaryKey: primaryKeyConcession,
        extensions,
        extras: { processingId }
      })).data
      await log.step(`Création du nouveau jeu de donnée : "${dataset.title}"`)
      if (initialize && pathDECP) {
        // await initializeWithAnnualDecp(mappingConcession, filtersConcession, context)
        await initializeWithGlobalDecp(mappingConcession, filtersConcession, pathDECP, dataset.id, context)
      }
      if (!marcheFilter) {
        await patchConfig({ datasetMode: 'update', dataset, datasets: undefined } as any)
      }
    }
    if (marcheFilter) {
      const primaryKeyMarche = ['id', 'montant', 'acheteurid', 'idtitulaire', 'objet']
      const extensionCPV = {
        active: true,
        type: 'remoteService',
        remoteService: 'dataset:a5u3jsc115-84-1c2591opar',
        action: 'masterData_bulkSearch_nomenclature-des-secteurs-dachat-code-cpv',
        select: [
          'secteurs',
          'soussecteurs',
          'intitule_officiel_par_code_cpv'
        ],
        overwrite: {},
        propertyPrefix: '_nomenclature_des-secteurs-dachat-code-cpv'
      }
      extensions.push(extensionCPV)
      const title = titleBase + ' (marché)'

      const dataset = (await axios.post('api/v1/datasets', {
        title,
        isRest: true,
        schema: datasetSchemaMarche,
        primaryKey: primaryKeyMarche,
        extensions,
        extras: { processingId }
      })).data
      await log.info(`Création du nouveau jeu de donnée : "${dataset.title}"`)

      if (initialize && pathDECP) {
        // await initializeWithAnnualDecp(mapping, filtersMarche, context)
        await initializeWithGlobalDecp(mappingMarche, filtersMarche, pathDECP, dataset.id, context)
      }
      await patchConfig({ datasetMode: 'update', dataset, datasets: undefined } as any)
    }
    if (pathDECP) await fs.promises.unlink(pathDECP)
    log.step('fin de l\'initialisation')
  }

  if (update) {
    log.step('Lancement de la mise à jour')
    const marcheFilter = processingConfig.datasetFilterUpdate === 'marche'
    const marcheConcession = processingConfig.datasetFilterUpdate === 'concession'
    const date = processingConfig._overrideDate as string ?? dayjs().format('YYYY-MM-DD')
    // récupération de l'id du jeu de donnée
    const ref = processingConfig.dataset
    log.info(`Récupération du dataset "${ref.title || ref.id}"`)

    const datasetId = processingConfig.dataset.id as string
    log.step('Récupérarion du decp du jour')
    if (marcheFilter) {
      await dailyDecp(mappingMarche, filtersMarche, date, datasetId, context)
    }
    if (marcheConcession) {
      await dailyDecp(mappingConcession, filtersConcession, date, datasetId, context)
    }
    log.step('fin de l\'update')
  }
}
