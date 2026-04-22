import config from '#config'
import assert from 'node:assert'
import { it, describe, afterEach } from 'node:test'
import nock from 'nock'
import fs from 'fs-extra'
import path from 'node:path'

import { chain } from 'stream-chain'
import { parser } from 'stream-json'
import { pick } from 'stream-json/filters/pick.js'
import { streamArray } from 'stream-json/streamers/stream-array.js'

import testUtils from '@data-fair/lib-processing-dev/tests-utils.js'
import * as decpPlugin from '../index.ts'

import pluginConfigSchema from '../plugin-config-schema.json' with { type: 'json' }
import processingConfigSchema from '../processing-config-schema.json' with { type: 'json' }

import { countContrat } from '../lib/utils.ts'
import mapping from '../lib/mapping/mapping_decp.json' with { type: 'json' }
import mappingConcession from '../lib/mapping/mapping_decp_concession.json' with { type: 'json' }
import mappingMarche from '../lib/mapping/mapping_decp_marche.json' with { type: 'json' }

describe('DECP processing', () => {
  afterEach(() => {
    nock.cleanAll()
  })
  // it('should expose a plugin config schema for super admins', async () => {
  //   assert.ok(pluginConfigSchema)
  // })
  // it('should expose a processing config schema for users', async () => {
  //   assert.equal(processingConfigSchema.type, 'object')
  // })

  // it('should get url', async function () {
  //   const context = testUtils.context({
  //     processingConfig: {
  //       datasetMode: 'create',
  //       dataset: { title: 'decp' },
  //       url: 'https://www.data.gouv.fr/api/1/datasets/donnees-essentielles-de-la-commande-publique-fichiers-consolides/'
  //     }
  //   }, config, false)

  //   assert.equal(context.processingConfig.url, 'https://www.data.gouv.fr/api/1/datasets/donnees-essentielles-de-la-commande-publique-fichiers-consolides/')
  // })

  // it('no url', async function () {
  //   const context = testUtils.context({
  //     processingConfig: {
  //       datasetMode: 'create',
  //       dataset: { title: 'decp' },
  //     }
  //   }, config, false)
  //   const { listAttachements } = await import('../lib/fetch.ts')
  //   await assert.rejects(
  //     listAttachements(context),
  //     {
  //       name: 'Error',
  //       message: 'URL is missing in processingConfig'
  //     }
  //   )
  // })

  // it('get list decp available', async function () {
  //   const context = testUtils.context({
  //     processingConfig: {
  //       datasetMode: 'create',
  //       dataset: { title: 'decp' },
  //       url: 'https://www.data.gouv.fr/api/1/datasets/donnees-essentielles-de-la-commande-publique-fichiers-consolides/'
  //     }
  //   }, config, false)

  //   const mockData = JSON.parse(
  //     fs.readFileSync(path.join(import.meta.dirname, 'resources/dataset_decp.json'), 'utf8')
  //   )
  //   nock('https://www.data.gouv.fr')
  //     .persist()
  //     .get('/api/1/datasets/donnees-essentielles-de-la-commande-publique-fichiers-consolides/')
  //     .reply(200, mockData)

  //   const { listAttachements } = await import('../lib/fetch.ts')
  //   const attachements = await listAttachements(context)
  //   assert.equal(attachements.length, 5)
  // })

  // it('Get one decp', async function () {
  //   const context = testUtils.context({
  //     tmpDir: 'data',
  //     pluginConfig: {},
  //     processingConfig: {
  //       datasetMode: 'create',
  //       url: 'https://www.data.gouv.fr/api/1/datasets/r/2551ad40-584a-42fd-b3cc-e8906183287e'
  //     },
  //   }, config, false)

  //   const { axios, tmpDir, processingConfig } = context

  //   const mockData = JSON.parse(
  //     fs.readFileSync(path.join(import.meta.dirname, 'resources/decp-2026.json'), 'utf8')
  //   )

  //   nock('https://www.data.gouv.fr')
  //     .get('/api/1/datasets/r/2551ad40-584a-42fd-b3cc-e8906183287e')
  //     .reply(200, mockData)

  //   const { getAttachement } = await import('../lib/fetch.ts')
  //   const jsonDecp = await getAttachement(processingConfig.url, tmpDir, axios)
  //   const count = await countContract(jsonDecp, 'marches.marche')
  //   assert.equal(count, 82227)
  // })

  // it('flatten a contract component', async function () {
  //   const context = testUtils.context({
  //     processingConfig: {
  //       datasetMode: 'create',
  //       dataset: { title: 'decp' },
  //     }
  //   }, config, false)
  //   const { log } = context
  //   const mockData = JSON.parse(
  //     fs.readFileSync(path.join(import.meta.dirname, 'resources/marche.json'), 'utf8')
  //   )
  //   const { flattenData } = await import('../lib/convert.ts')
  //   assert.equal(mockData.dureeMois, 48)
  //   const res = flattenData(mockData, 1, log)
  //   assert.equal(res.nature, 'Marché')
  //   assert.equal(res.considerationsEnvironnementales, 'Clause environnementale ; Critère environnemental')
  //   assert.equal(res.considerationsSociales, 'Pas de considération sociale')
  // })

  // it('write a list of flatten component', async function () {
  //   const context = testUtils.context({
  //     processingConfig: {
  //       datasetMode: 'create',
  //       dataset: { title: 'decp' },
  //     }
  //   }, config, false)
  //   const { log } = context
  //   const pathDir = (path.join(import.meta.dirname, 'result'))
  //   const mockData = (path.join(import.meta.dirname, 'resources/mini-decp.json'))

  //   const { writeFlattenData } = await import('../lib/convert.ts')
  //   const resPath = await writeFlattenData(mockData, pathDir, 'mini-decp_flatten.json', log)
  //   const count = await countContract(resPath, '')
  //   assert.equal(count, 9)
  // })

  // it('flatten  all of a decp', async function () {
  //   const context = testUtils.context({
  //     processingConfig: {
  //       datasetMode: 'create',
  //       dataset: { title: 'decp' },
  //     }
  //   }, config, false)
  //   const { log } = context
  //   const pathDir = (path.join(import.meta.dirname, 'result'))
  //   const mockData = (path.join(import.meta.dirname, 'resources/decp-2026.json'))

  //   const { writeFlattenData } = await import('../lib/convert.ts')
  //   const resPath = await writeFlattenData(mockData, mapping, '/^marches\.(marche|contrat-concession)$/', pathDir, 'decp_flatten.json', log)
  //   // const countDECP = await countContract(mockData, '')
  //   console.log('nombre délément dans le decp : ' + countDECP)
  //   const count = await countContract(resPath, '')
  //   console.log('nombre dans le json : ' + count)
  //   assert.equal(count, 82227)
  // })

  // it('send flatten data to data fair (mapping)', async function () {
  //   // TODO paramétrer pour envoyer sur data fair avec les bons identifiants
  //   const context = testUtils.context({
  //     processingConfig: {
  //       datasetMode: 'create',
  //       dataset: { title: 'decp' },
  //     },
  //     tmpDir: 'data',
  //     processingId: 'b1w5di5y95wj9j-o1s1m2lrw'
  //   }, config, false)
  //   const mockData = (path.join(import.meta.dirname, 'resources/decp-2025.json'))
  //   // const countDECP = await countContract(mockData, 'marches.marche')
  //   // console.log('total marche : ' + countDECP)
  //   const { sendFlattenData } = await import('../lib/upload.ts')
  //   await sendFlattenData(mapping, 'marches.marche', mockData, 'b1w5di5y95wj9j-o1s1m2lrw', context)
  // })

  // it('send flatten data to data fair (contrat-concession)', async function () {
  //   // TODO paramétrer pour envoyer sur data fair avec les bons identifiants
  //   const context = testUtils.context({
  //     processingConfig: {
  //       datasetMode: 'create',
  //       dataset: { title: 'decp' },
  //     },
  //     tmpDir: 'data',
  //     processingId: '4z69j2br8fruagna1hjzoqmi'
  //   }, config, false)
  //   const mockData = (path.join(import.meta.dirname, 'resources/decp-2026.json'))
  //   const { sendFlattenData } = await import('../lib/upload.ts')
  //   await sendFlattenData(mappingConcession, 'marches.contrat-concession', mockData, '4z69j2br8fruagna1hjzoqmi', context)
  // })

  it('send flatten data to data fair (marché)', async function () {
    // TODO paramétrer pour envoyer sur data fair avec les bons identifiants
    const context = testUtils.context({
      processingConfig: {
        datasetMode: 'create',
        dataset: { title: 'decp' },
      },
      tmpDir: 'data',
      processingId: 'vv5hlmbnqhs1eqk1ttgbpxe9/'
    }, config, false)
    const mockData = (path.join(import.meta.dirname, 'resources/decp-2026.json'))
    const { sendFlattenData } = await import('../lib/upload.ts')
    await sendFlattenData(mappingMarche, 'marches.marche', mockData, 'vv5hlmbnqhs1eqk1ttgbpxe9', context)
  })

  // it('send flatten dataDoublon to data fair', async function () {
  //   // TODO paramétrer pour envoyer sur data fair avec les bons identifiants
  //   const context = testUtils.context({
  //     processingConfig: {
  //       datasetMode: 'create',
  //       dataset: { title: 'decp' },
  //     },
  //     tmpDir: 'data',
  //     processingId: 'b1w5di5y95wj9j-o1s1m2lrw'
  //   }, config, false)
  //   const mockData = (path.join(import.meta.dirname, 'resources/mini-decp-doublon.json'))
  //   const { sendFlattenData } = await import('../lib/upload.ts')
  //   await sendFlattenData(mockData, 'b1w5di5y95wj9j-o1s1m2lrw', context)
  // })

  // it('count duplicate', async function () {
  //   const context = testUtils.context({
  //     processingConfig: {
  //       datasetMode: 'create',
  //       dataset: { title: 'decp' },
  //     },
  //   }, config, false)
  //   const { log } = context
  //   const mockData = (path.join(import.meta.dirname, 'resources/decp-2026.json'))
  //   const { findDuplicateMultiKey } = await import('../lib/clean.ts')
  //   await findDuplicateMultiKey(mockData, log)
  // })
  // it('count duplicate on flatten data', async function () {
  //   const context = testUtils.context({
  //     processingConfig: {
  //       datasetMode: 'create',
  //       dataset: { title: 'decp' },
  //     },
  //   }, config, false)
  //   const { log } = context
  //   const mockData = (path.join(import.meta.dirname, 'result/decp_flatten.json'))
  //   const { findInFlattenDuplicateMultiKey } = await import('../lib/clean.ts')
  //   await findInFlattenDuplicateMultiKey(mockData, log)
  // })

  // it('No stream : send flatten data to data fair', async function () {
  //   // TODO paramétrer pour envoyer sur data fair avec les bons identifiants
  //   const context = testUtils.context({
  //     processingConfig: {
  //       datasetMode: 'create',
  //       dataset: { title: 'decp' },
  //     },
  //     tmpDir: 'data',
  //     processingId: 'b1w5di5y95wj9j-o1s1m2lrw'
  //   }, config, false)
  //   const mockData = (path.join(import.meta.dirname, 'result/mini-decp-doublon_flatten.json'))
  //   const fileContent = JSON.parse(fs.readFileSync(mockData, 'utf-8'))
  //   const json = JSON.stringify(fileContent)
  //   const { upload } = await import('../lib/upload.ts')
  //   await upload(context, 'b1w5di5y95wj9j-o1s1m2lrw', json)
  // })
})
