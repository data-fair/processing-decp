import type { ProcessingContext } from '@data-fair/lib-common-types/processings.js'
import fs from 'fs'
import { chain } from 'stream-chain'
import { parser } from 'stream-json'
import { streamArray } from 'stream-json/streamers/stream-array.js'
import { pick } from 'stream-json/filters/pick.js'

export const findDuplicate = async (readFilePath: string, log: ProcessingContext['log']) => {
  log.step('Lancement processus')
  return new Promise<void>((resolve, reject) => {
    const pipeline = chain([
      fs.createReadStream(readFilePath),
      parser(),
      pick({ filter: 'marches.marche' }),
      streamArray(),
      (data: any) => {
        const id = data.value.id // L'identifiant de l'item
        log.info(id)
        // On récupère le compteur actuel ou 0 si c'est la première fois
        const currentCount = stats.get(id) || 0
        stats.set(id, currentCount + 1)
      },
    ])

    const stats = new Map<string, number>()

    pipeline.on('data', ({ value }) => {
      const id = value.id // L'identifiant de l'item
      log.info(value)
      // On récupère le compteur actuel ou 0 si c'est la première fois
      const currentCount = stats.get(id) || 0
      stats.set(id, currentCount + 1)
    })

    pipeline.on('end', () => {
    // On transforme la Map en tableau et on ne garde que les doublons
      const resultats = Array.from(stats.entries())
        .filter(([_, count]) => count > 1)
        .map(([id, count]) => ({
          id,
          nombreApparitions: count
        }))

      if (resultats.length > 0) {
        console.table(resultats)
        log.info(`Analyse terminée. ${resultats.length} IDs distincts ont des doublons.`)
      } else {
        log.info('Analyse terminée. Aucun doublon détecté.')
      }
      resolve()
    })

    pipeline.on('error', (err: Error) => {
      log.error(`Erreur : ${err.message}`)
      reject(err)
    })
  })
}

export const findDuplicateMultiKey = async (readFilePath: string, log: ProcessingContext['log']) => {
  log.step('Lancement processus de détection multi-critères')

  return new Promise<void>((resolve, reject) => {
    const stats = new Map<string, { count: number; details: any }>()

    const pipeline = chain([
      fs.createReadStream(readFilePath),
      parser(),
      pick({ filter: 'marches.marche' }),
      streamArray()
    ])

    pipeline.on('data', ({ value }) => {
      // 1. On choisit les clés qui définissent un doublon
      // On peut ajouter .trim() ou .toLowerCase() pour plus de souplesse
      const criteres = [
        value.id,
        value.montant,
        // value.objet
        // value.datePublicationDonnees,
        // value.dateNotification,
        value.acheteur['id'],
        value.titulaires[0].titulaire.id
      ]

      // 2. On génère une clé unique combinée (ex: "ID123|75001|5000")
      // Le séparateur "|" évite que "12" + "3" soit confondu avec "1" + "23"
      const compositeKey = criteres.join('|')

      const existing = stats.get(compositeKey)
      if (existing) {
        existing.count += 1
      } else {
        stats.set(compositeKey, {
          count: 1,
          details: { id: value.id, montant: value.montant, dateNotification: value.dateNotification, datePublication: value.datePublicationDonnees, idAcheteur: value.acheteur['id'], titulaire: value.titulaires[0].titulaire.id }
        })
      }
    })

    pipeline.on('end', () => {
      const resultats = Array.from(stats.entries())
        .filter(([_, data]) => data.count > 1)
        .map(([_, data]) => ({
          ...data.details,
          nombreApparitions: data.count
        }))

      if (resultats.length > 0) {
        console.table(resultats)
        log.info(`${resultats.length} groupes de doublons trouvés sur les critères choisis.`)
      } else {
        log.info('Aucun doublon trouvé avec cette combinaison de critères.')
      }

      resolve()
    })

    pipeline.on('error', (err) => reject(err))
  })
}
export const findInFlattenDuplicateMultiKey = async (readFilePath: string, log: ProcessingContext['log']) => {
  log.step('Analyse de l\'impact de la clé composée')

  return new Promise<void>((resolve, reject) => {
    const stats = new Map<string, { count: number; details: any }>()

    const pipeline = chain([
      fs.createReadStream(readFilePath),
      parser(),
      streamArray()
    ])

    pipeline.on('data', ({ value }) => {
      const criteres = [
        String(value.id || 'no-id').trim(),
        String(value.montant || '0').trim(),
        String(value.offresrecues || '0').trim(),
        String(value.titulairesiret || 'no-siret').trim(),
        String(value.acheteurid || 'no-acheteurid').trim()
      ]
      const compositeKey = criteres.join('|')

      const existing = stats.get(compositeKey)
      if (existing) {
        existing.count += 1
      } else {
        stats.set(compositeKey, {
          count: 1,
          details: { id: value.id, montant: value.montant, siret: value.titulairesiret }
        })
      }
    })

    pipeline.on('end', () => {
      let totalElementsTraites = 0
      let totalDoublonsAEcraser = 0
      const listeDoublons = []

      for (const [key, data] of stats.entries()) {
        totalElementsTraites += data.count

        if (data.count > 1) {
          // Si on a 3 occurrences, on en écrase 2 (count - 1)
          totalDoublonsAEcraser += (data.count - 1)

          listeDoublons.push({
            cle: key,
            occurrences: data.count,
            perte: data.count - 1,
            ...data.details
          })
        }
      }

      // --- RAPPORT D'IMPACT ---
      if (listeDoublons.length > 0) {
        console.table(listeDoublons)
      }
      const tauxPerte = ((totalDoublonsAEcraser / totalElementsTraites) * 100).toFixed(2)

      log.info('--- BILAN DE L\'IMPACT ---')
      log.info(`Éléments totaux analysés : ${totalElementsTraites}`)
      log.info(`Éléments uniques conservés : ${stats.size}`)
      log.warning(`Éléments qui seront ÉCRASÉS : ${totalDoublonsAEcraser} (${tauxPerte}%)`)

      if (listeDoublons.length > 0) {
        // On trie par importance de perte pour voir les plus gros doublons en premier
        const topDoublons = listeDoublons
          .sort((a, b) => b.occurrences - a.occurrences)
          .filter(d => d.occurrences > 2) // On se concentre sur les plus de 2

        if (topDoublons.length > 0) {
          log.warning('Focus sur les éléments apparaissant plus de 2 fois :')
          console.table(topDoublons)
        }
      }

      resolve()
    })

    pipeline.on('error', (err) => reject(err))
  })
}
