import config from '#config'
import assert from 'node:assert'
import { it, describe, afterEach } from 'node:test'
import nock from 'nock'
import fs from 'fs-extra'
import path from 'node:path'

import testUtils from '@data-fair/lib-processing-dev/tests-utils.js'
import * as decpPlugin from '../index.ts'

import pluginConfigSchema from '../plugin-config-schema.json' with { type: 'json' }
import processingConfigSchema from '../processing-config-schema.json' with { type: 'json' }

import { countContract } from '../lib/utils.ts'
import mapping from '../lib/mapping/mapping_decp_marche.json' with { type: 'json' }

describe('DECP processing', () => {
  afterEach(() => {
    nock.cleanAll()
  })
  it('should expose a plugin config schema for super admins', async () => {
    assert.ok(pluginConfigSchema)
  })
  it('should expose a processing config schema for users', async () => {
    assert.equal(processingConfigSchema.type, 'object')
  })

  it('should initialize', async function () {
    const context = testUtils.context({
      processingConfig: {
        datasetMode: 'create',
        datasetTitle: 'decp test',
        initializeDataset: true
      }
    }, config, false)

    assert.equal(context.processingConfig.initializeDataset, true)
  })

  it('get list decp available', async function () {
    const context = testUtils.context({
      processingConfig: {
        datasetMode: 'create',
        dataset: { title: 'decp' },
      }
    }, config, false)

    const mockData = JSON.parse(
      fs.readFileSync(path.join(import.meta.dirname, 'resources/dataset_decp.json'), 'utf8')
    )
    nock('https://www.data.gouv.fr')
      .persist()
      .get('/api/1/datasets/donnees-essentielles-de-la-commande-publique-fichiers-consolides/')
      .reply(200, mockData)
    const { listAttachements } = await import('../lib/fetch.ts')
    const patternYear = /^decp-\d{4}.json$/
    const attachements = await listAttachements(context, patternYear)
    assert.equal(attachements.length, 5)
  })

  it('get url decp api', async function () {
    const context = testUtils.context({
      processingConfig: {
        datasetMode: 'create',
        dataset: { title: 'decp' },
      }
    }, config, false)

    const mockData = JSON.parse(
      fs.readFileSync(path.join(import.meta.dirname, 'resources/dataset_api_decp.json'), 'utf8')
    )
    nock('https://www.data.gouv.fr')
      .persist()
      .get('/api/1/datasets/api-decp/')
      .reply(200, mockData)
    const { getDailyAttachement } = await import('../lib/fetch.ts')
    const attachements = await getDailyAttachement('2020-08-25', context)
    assert.equal(attachements, 'https://www.data.gouv.fr/api/1/datasets/r/34433b07-2929-4724-8d5a-af712cc35dae')
  })

  it('Get one decp', async function () {
    const context = testUtils.context({
      tmpDir: 'data',
      pluginConfig: {},
      processingConfig: {
        datasetMode: 'create',
      },
    }, config, false)

    const { axios, tmpDir } = context

    const mockData = JSON.parse(
      fs.readFileSync(path.join(import.meta.dirname, 'resources/mini-decp-global.json'), 'utf8')
    )

    const url = 'https://www.data.gouv.fr/api/1/datasets/r/2551ad40-584a-42fd-b3cc-e8906183287e'

    nock('https://www.data.gouv.fr')
      .get('/api/1/datasets/r/2551ad40-584a-42fd-b3cc-e8906183287e')
      .reply(200, mockData)

    const { getAttachement } = await import('../lib/fetch.ts')
    const jsonDecp = await getAttachement(url, tmpDir, axios)
    const countMarche = await countContract(jsonDecp, 'marches.marche')
    const countConcession = await countContract(jsonDecp, 'marches.contrat-concession')
    assert.equal((countMarche + countConcession), 3803)
  })

  it('flatten a contract component', async function () {
    const context = testUtils.context({
      processingConfig: {
        datasetMode: 'create',
        dataset: { title: 'decp' },
      }
    }, config, false)
    const { log } = context
    const mockData = JSON.parse(
      fs.readFileSync(path.join(import.meta.dirname, 'resources/marche.json'), 'utf8')
    )
    const { flattenData } = await import('../lib/convert.ts')
    const res = flattenData(mockData, mapping, log)
    assert.equal(res.nature, 'Marché')
    assert.equal(res.considerationsenvironnementales, 'Clause environnementale ; Critère environnemental')
    assert.equal(res.considerationssociales, 'Pas de considération sociale')
    console.log(res.idtitulaire)
    assert.equal(res.idtitulaire, '87280339000030')
  })

  // ====== LANCER INDEX =====
  it('run with initialize (decp global)', async function () {
    console.log('nock interceptors:', nock.pendingMocks())
    // TODO paramétrer pour envoyer sur data fair avec les bons identifiants
    const context = testUtils.context({
      processingConfig: {
        datasetMode: 'create',
        datasetTitle: 'decp initialize',
        initializeDataset: true,
        datasetFilterCreate: 'concession',
        _overrideDate: '2026-04-27',
      },
      tmpDir: 'data',
      processingId: 'id-dataset'
    }, config, false)

    const mockDatasetDecp = JSON.parse(
      fs.readFileSync(path.join(import.meta.dirname, 'resources/initialize/dataset_decp.json'), 'utf8')
    )
    const mockDecpGlobal = JSON.parse(
      fs.readFileSync(path.join(import.meta.dirname, 'resources/mini-decp-global.json'), 'utf8')
    )

    const mockDatasetApiDecp = JSON.parse(
      fs.readFileSync(path.join(import.meta.dirname, 'resources/dataset_api_decp.json'), 'utf8')
    )

    const mockApiDecp = JSON.parse(
      fs.readFileSync(path.join(import.meta.dirname, 'resources/initialize/mini_decp_2026.json'), 'utf8')
    )
    nock('https://www.data.gouv.fr')
      .persist()
      .get('/api/1/datasets/api-decp/')
      .reply(200, mockDatasetApiDecp)

    nock('https://www.data.gouv.fr')
      .persist()
      .get('/api/1/datasets/donnees-essentielles-de-la-commande-publique-fichiers-consolides/')
      .reply(200, mockDatasetDecp)

    nock('https://www.data.gouv.fr')
      .persist()
      .get('/api/1/datasets/r/00245086-fe70-42d0-a15e-ecd2120dc508')
      .reply(200, mockDecpGlobal)

    nock('https://www.data.gouv.fr')
      .persist()
      .get('/api/1/datasets/r/bd33e98f-f8e3-49ba-9f26-51c95fe57234')
      .reply(200, mockApiDecp)
    nock('https://www.data.gouv.fr')
      .persist()
      .get('/api/1/datasets/r/d83e708a-4861-45ea-80a4-31162faca55e')
      .reply(200, mockApiDecp)
    nock('https://www.data.gouv.fr')
      .persist()
      .get('/api/1/datasets/r/311f31e5-a279-4740-b001-ff22392c8446')
      .reply(200, mockApiDecp)
    nock('https://www.data.gouv.fr')
      .persist()
      .get('/api/1/datasets/r/ab45f51a-c0eb-4739-9e78-4cdbaa38c9e9')
      .reply(200, mockApiDecp)
    nock('https://www.data.gouv.fr')
      .persist()
      .get('/api/1/datasets/r/f899fd05-3afd-45fd-88c2-f8f166a1b36d')
      .reply(200, mockApiDecp)
    nock('https://www.data.gouv.fr')
      .persist()
      .get('/api/1/datasets/r/62d01401-ba9e-4d00-86ff-dfd329beb3fc')
      .reply(200, mockApiDecp)
    nock('https://www.data.gouv.fr')
      .persist()
      .get('/api/1/datasets/r/aa311680-1ed1-4a64-b500-261758fdc9d1')
      .reply(200, mockApiDecp)
    nock('https://www.data.gouv.fr')
      .persist()
      .get('/api/1/datasets/r/cc79c825-8022-45d2-b02e-133d972eb2dd')
      .reply(200, mockApiDecp)
    nock('https://www.data.gouv.fr')
      .persist()
      .get('/api/1/datasets/r/519129fa-1729-4e52-80be-e1a0be99397d')
      .reply(200, mockApiDecp)

    nock('https://staging-koumoul.com')
      .persist()
      .post('/data-fair/api/v1/datasets', () => true)
      .reply(200, { id: 'id-dataset', title: 'decp test title' })

    let bulkCallCount = 0
    const sentLines: any[] = []
    nock('https://staging-koumoul.com')
      .persist()
      .post('/data-fair/api/v1/datasets/id-dataset/_bulk_lines', (body) => {
        bulkCallCount++
        sentLines.push(...body)
        return true
      })
      .reply(200, { nbOk: 100, nbErrors: 0 })

    await decpPlugin.run(context)
    assert.ok(bulkCallCount > 0, 'Devrait avoir appelé bulk_lines au moins une fois')
    assert.ok(sentLines.length > 0, 'Devrait avoir envoyé des lignes')
  })

  it('run udapte dataset', async function () {
    console.log('nock interceptors:', nock.pendingMocks())
    const context = testUtils.context({
      processingConfig: {
        datasetMode: 'update',
        datasetTitle: 'decp test title',
        initializeDataset: false,
        datasetFilterUpdate: 'marche',
        _overrideDate: '2026-04-27',
        dataset: {
          id: 'id-dataset',
          title: 'udapte-dataset'
        }
      },
      tmpDir: 'data',
    }, config, false)

    const mockData = JSON.parse(
      fs.readFileSync(path.join(import.meta.dirname, 'resources/dataset_api_decp.json'), 'utf8')
    )
    const mockDecp = JSON.parse(
      fs.readFileSync(path.join(import.meta.dirname, 'resources/initialize/mini_decp_2026.json'), 'utf8')
    )
    nock('https://www.data.gouv.fr')
      .persist()
      .get('/api/1/datasets/api-decp/')
      .reply(200, mockData)
    nock('https://www.data.gouv.fr')
      .persist()
      .get('/api/1/datasets/r/519129fa-1729-4e52-80be-e1a0be99397d')
      .reply(200, mockDecp)

    let bulkCallCount = 0
    const sentLines: any[] = []
    nock('https://staging-koumoul.com')
      .persist()
      .post('/data-fair/api/v1/datasets/id-dataset/_bulk_lines', (body) => {
        bulkCallCount++
        sentLines.push(...body)
        return true
      })
      .reply(200, { nbOk: 100, nbErrors: 0 })

    await decpPlugin.run(context)
    assert.ok(bulkCallCount > 0, 'Devrait avoir appelé bulk_lines au moins une fois')
    assert.ok(sentLines.length > 0, 'Devrait avoir envoyé des lignes')

    await decpPlugin.run(context)
  })

  // ====== Envoi réel =====
  // it('run udapte dataset', async function () {
  //   console.log('nock interceptors:', nock.pendingMocks())
  //   const context = testUtils.context({
  //     processingConfig: {
  //       datasetMode: 'update',
  //       initializeDataset: false,
  //       _overrideDate: '2026-04-27',
  //       datasetFilterUpdate: 'marche'
  //     },
  //     tmpDir: 'data',
  //     processingId: 'kogzgdx6d9bdv7si9ud-yw04'
  //   }, config, false)

  //   const mockData = JSON.parse(
  //     fs.readFileSync(path.join(import.meta.dirname, 'resources/dataset_api_decp.json'), 'utf8')
  //   )
  //   const mockDecp = JSON.parse(
  //     fs.readFileSync(path.join(import.meta.dirname, 'resources/initialize/mini_decp_2026.json'), 'utf8')
  //   )
  //   nock('https://www.data.gouv.fr')
  //     .persist()
  //     .get('/api/1/datasets/api-decp/')
  //     .reply(200, mockData)
  //   nock('https://www.data.gouv.fr')
  //     .persist()
  //     .get('/api/1/datasets/r/519129fa-1729-4e52-80be-e1a0be99397d')
  //     .reply(200, mockDecp)

  // let bulkCallCount = 0
  // const sentLines: any[] = []
  // nock('https://staging-koumoul.com')
  //   .persist()
  //   .post('/data-fair/api/v1/datasets/id-dataset/_bulk_lines', (body) => {
  //     bulkCallCount++
  //     sentLines.push(...body)
  //     return true
  //   })
  //   .reply(200, { nbOk: 100, nbErrors: 0 })

  // await decpPlugin.run(context)
  // assert.ok(bulkCallCount > 0, 'Devrait avoir appelé bulk_lines au moins une fois')
  // assert.ok(sentLines.length > 0, 'Devrait avoir envoyé des lignes')

  //   await decpPlugin.run(context)
  // })
})
