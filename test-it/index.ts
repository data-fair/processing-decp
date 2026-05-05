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
import mapping from '../lib/mapping/mapping_decp.json' with { type: 'json' }

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
    const attachements = await listAttachements(context)
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
  })

  it('initialize : upload all year decp', async function () {
    console.log('nock interceptors:', nock.pendingMocks())
    // TODO paramétrer pour envoyer sur data fair avec les bons identifiants
    const context = testUtils.context({
      processingConfig: {
        datasetMode: 'create',
        dataset: { title: 'decp' },
        url: 'https://www.data.gouv.fr/api/1/datasets/donnees-essentielles-de-la-commande-publique-fichiers-consolides/',
      },
      tmpDir: 'data',
      processingId: 'id-dataset'
    }, config, false)

    const mockData = JSON.parse(
      fs.readFileSync(path.join(import.meta.dirname, 'resources/initialize/dataset_decp.json'), 'utf8')
    )
    const mockDecp2026 = JSON.parse(
      fs.readFileSync(path.join(import.meta.dirname, 'resources/initialize/mini_decp_2026.json'), 'utf8')
    )
    const mockDecp2025 = JSON.parse(
      fs.readFileSync(path.join(import.meta.dirname, 'resources/initialize/mini_decp_2025.json'), 'utf8')
    )
    const mockDecp2022 = JSON.parse(
      fs.readFileSync(path.join(import.meta.dirname, 'resources/initialize/mini_decp_2022.json'), 'utf8')
    )

    nock('https://www.data.gouv.fr')
      .persist()
      .get('/api/1/datasets/donnees-essentielles-de-la-commande-publique-fichiers-consolides/')
      .reply(200, mockData)
    nock('https://www.data.gouv.fr')
      .persist()
      .get('/api/1/datasets/r/2551ad40-584a-42fd-b3cc-e8906183287e')
      .reply(200, mockDecp2026)
    nock('https://www.data.gouv.fr')
      .persist()
      .get('/api/1/datasets/r/d00a6a5a-beef-442e-8aee-5867f47a87d0')
      .reply(200, mockDecp2025)
    nock('https://www.data.gouv.fr')
      .persist()
      .get('/api/1/datasets/r/59ba0edb-cf94-4bf1-a546-61f561553917')
      .reply(200, mockDecp2022)

    nock('https://staging-koumoul.com')
      .persist()
      .post('/data-fair/api/v1/datasets/id-dataset/_bulk_lines', () => true)
      .reply(200, { nbOk: 100, nbErrors: 0 })

    const { initializeWithAnnualDecp } = await import('../lib/execute.ts')
    const filters = ['marches.marche', 'marches.contrat-concession', 'marches']
    await initializeWithAnnualDecp(mapping, filters, context)
  })

  // ====== LANCER INDEX =====
  it('run with initialize (decp global)', async function () {
    console.log('nock interceptors:', nock.pendingMocks())
    // TODO paramétrer pour envoyer sur data fair avec les bons identifiants
    const context = testUtils.context({
      processingConfig: {
        datasetMode: 'create',
        datasetTitle: 'decp test global',
        initializeDataset: true,
        datasetFilterCreate: 'all'
      },
      tmpDir: 'data',
      processingId: 'id-dataset'
    }, config, false)

    const mockData = JSON.parse(
      fs.readFileSync(path.join(import.meta.dirname, 'resources/initialize/dataset_decp.json'), 'utf8')
    )
    const mockDecpGlobal = JSON.parse(
      fs.readFileSync(path.join(import.meta.dirname, 'resources/mini-decp-global.json'), 'utf8')
    )

    nock('https://www.data.gouv.fr')
      .persist()
      .get('/api/1/datasets/donnees-essentielles-de-la-commande-publique-fichiers-consolides/')
      .reply(200, mockData)
    nock('https://www.data.gouv.fr')
      .persist()
      .get('/api/1/datasets/r/bd33e98f-f8e3-49ba-9f26-51c95fe57234')
      .reply(200, mockDecpGlobal)

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
  // it('run with initialize', async function () {
  //   console.log('nock interceptors:', nock.pendingMocks())
  //   // TODO paramétrer pour envoyer sur data fair avec les bons identifiants
  //   const context = testUtils.context({
  //     processingConfig: {
  //       datasetMode: 'create',
  //       datasetTitle: 'decp test title',
  //       initializeDataset: true,
  //       datasetFilterCreate: 'all'
  //     },
  //     tmpDir: 'data',
  //     processingId: 'id-dataset'
  //   }, config, false)

  //   const mockData = JSON.parse(
  //     fs.readFileSync(path.join(import.meta.dirname, 'resources/initialize/dataset_decp.json'), 'utf8')
  //   )
  //   const mockDecp2026 = JSON.parse(
  //     fs.readFileSync(path.join(import.meta.dirname, 'resources/initialize/mini_decp_2026.json'), 'utf8')
  //   )
  //   const mockDecp2025 = JSON.parse(
  //     fs.readFileSync(path.join(import.meta.dirname, 'resources/initialize/mini_decp_2025.json'), 'utf8')
  //   )
  //   const mockDecp2022 = JSON.parse(
  //     fs.readFileSync(path.join(import.meta.dirname, 'resources/initialize/mini_decp_2022.json'), 'utf8')
  //   )

  //   nock('https://www.data.gouv.fr')
  //     .persist()
  //     .get('/api/1/datasets/donnees-essentielles-de-la-commande-publique-fichiers-consolides/')
  //     .reply(200, mockData)
  //   nock('https://www.data.gouv.fr')
  //     .persist()
  //     .get('/api/1/datasets/r/2551ad40-584a-42fd-b3cc-e8906183287e')
  //     .reply(200, mockDecp2026)
  //   nock('https://www.data.gouv.fr')
  //     .persist()
  //     .get('/api/1/datasets/r/d00a6a5a-beef-442e-8aee-5867f47a87d0')
  //     .reply(200, mockDecp2025)
  //   nock('https://www.data.gouv.fr')
  //     .persist()
  //     .get('/api/1/datasets/r/59ba0edb-cf94-4bf1-a546-61f561553917')
  //     .reply(200, mockDecp2022)

  //   nock('https://staging-koumoul.com')
  //     .persist()
  //     .post('/data-fair/api/v1/datasets', () => true)
  //     .reply(200, { id: 'id-dataset', title: 'decp test title' })

  //   let bulkCallCount = 0
  //   const sentLines: any[] = []
  //   nock('https://staging-koumoul.com')
  //     .persist()
  //     .post('/data-fair/api/v1/datasets/id-dataset/_bulk_lines', (body) => {
  //       bulkCallCount++
  //       sentLines.push(...body)
  //       return true
  //     })
  //     .reply(200, { nbOk: 100, nbErrors: 0 })

  //   await decpPlugin.run(context)
  //   assert.ok(bulkCallCount > 0, 'Devrait avoir appelé bulk_lines au moins une fois')
  //   assert.ok(sentLines.length > 0, 'Devrait avoir envoyé des lignes')
  // })

  it('run udapte dataset', async function () {
    console.log('nock interceptors:', nock.pendingMocks())
    const context = testUtils.context({
      processingConfig: {
        datasetMode: 'update',
        datasetTitle: 'decp test title',
        initializeDataset: false,
        _overrideDate: '2026-04-27',
        datasetFilterUpdate: 'marche'
      },
      tmpDir: 'data',
      processingId: 'id-dataset'
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

  // =========== TEST ENVOIE VÉRITABLE =============
  // it('run with initialize (real send + mocked init)', async function () {
  //   nock.cleanAll()

  //   // bloque tout sauf staging-koumoul.com
  //   nock.disableNetConnect()
  //   nock.enableNetConnect((host) => host.includes('staging-koumoul.com'))

  //   const context = testUtils.context({
  //     processingConfig: {
  //       datasetMode: 'create',
  //       datasetTitle: 'decp depuis global',
  //       datasetFilterCreate: 'marche',
  //       initializeDataset: true
  //     },
  //     tmpDir: 'data',
  //     processingId: 'id-dataset'
  //   }, config, false)

  //   const mockData = JSON.parse(
  //     fs.readFileSync(path.join(import.meta.dirname, 'resources/initialize/dataset_decp.json'), 'utf8')
  //   )
  //   const mockDecpGlobal = JSON.parse(
  //     fs.readFileSync(path.join(import.meta.dirname, 'resources/mini-decp-global.json'), 'utf8')
  //   )

  //   nock('https://www.data.gouv.fr')
  //     .persist()
  //     .get('/api/1/datasets/donnees-essentielles-de-la-commande-publique-fichiers-consolides/')
  //     .reply(200, mockData)
  //   nock('https://www.data.gouv.fr')
  //     .persist()
  //     .get('/api/1/datasets/r/bd33e98f-f8e3-49ba-9f26-51c95fe57234')
  //     .reply(200, mockDecpGlobal)

  //   // ---- vrai envoi ----
  //   await decpPlugin.run(context)

  //   assert.ok(true, 'Run terminé avec envoi réel')
  // })
})
