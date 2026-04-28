import type { ProcessingContext } from '@data-fair/lib-common-types/processings.js'
import * as fs from 'fs'
import { createReadStream } from 'fs'
import { chain } from 'stream-chain'
import { parser } from 'stream-json'
import { streamArray } from 'stream-json/streamers/stream-array.js'
import { pick } from 'stream-json/filters/pick.js'

// ─── 1. Normaliser une valeur pour la clé ─────────────────────────────────
// On normalise pour éviter les faux-positifs (espaces, casse, etc.)
function normaliser (valeur: unknown): string {
  if (valeur === null || valeur === undefined) return ''
  return String(valeur).trim().toLowerCase()
}

// ─── 2. Construire la clé composite d'un marché ───────────────────────────
function construireCle (marche: Record<string, unknown>): string | null {
  // Adapte les noms de champs exacts à ton JSON
  const id = normaliser(marche.id)
  const titulaire = normaliser(marche.titulaires?.[0]?.titulaire?.id)
  const acheteur = normaliser(marche.acheteur?.id)
  const montant = normaliser(marche.montant)
  const source = normaliser(marche.source)

  // Si tous les champs sont vides, on ne peut pas identifier ce marché
  if (!id && !titulaire && !acheteur && !montant && !source) return null

  return `${id}||${titulaire}||${acheteur}||${montant}||${source}`
}

// ─── 3. Extraire les clés d'un fichier JSON volumineux ────────────────────
// stream-json va "naviguer" dans le JSON sans tout charger en mémoire.
// On cible le chemin marches.marche qui est un tableau.
async function extraireCles (cheminFichier: string): Promise<Set<string>> {
  return new Promise((resolve, reject) => {
    const cles = new Set<string>()

    const pipeline = chain([
      createReadStream(cheminFichier),
      parser(),                            // parse le JSON en streaming
      pick({ filter: 'marches.marche' }),  // navigue jusqu'au tableau cible
      streamArray(),                       // émet chaque élément du tableau un par un
    ])

    // Cet événement se déclenche pour CHAQUE marché, un à la fois
    pipeline.on('data', ({ value: marche }) => {
      const cle = construireCle(marche)
      if (cle) cles.add(cle)
    })

    pipeline.on('end', () => resolve(cles))
    pipeline.on('error', (err) => reject(err))
  })
}

// ─── 4. Comparer deux Sets de clés ────────────────────────────────────────
function comparerCles (
  clesAnnuel: Set<string>,
  clesMensuel: Set<string>
) {
  const pertes: string[] = [] // présents dans mensuel, absents de l'annuel
  const surplus: string[] = [] // présents dans l'annuel, absents du mensuel

  for (const cle of clesMensuel) {
    if (!clesAnnuel.has(cle)) pertes.push(cle)
  }
  for (const cle of clesAnnuel) {
    if (!clesMensuel.has(cle)) surplus.push(cle)
  }

  return {
    communs: clesAnnuel.size - surplus.length,
    pertes,
    surplus,
  }
}

// ─── 5. Programme principal ────────────────────────────────────────────────
export const allFileEraze = async (bigPath: string, smallPath: string, log: ProcessingContext['log']) => {
  log.info('Lancement comparaison :')
  log.step('Extraction clé de :' + bigPath)
  const clesAnnuel = await extraireCles(bigPath)
  console.log(`   → ${clesAnnuel.size} marchés trouvés`)

  log.step('Extraction clé de :' + smallPath)
  const clesMensuel = await extraireCles(smallPath)
  console.log(`   → ${clesMensuel.size} marchés trouvés`)

  log.step('Comparaison des clés :')
  const { communs, pertes, surplus } = comparerCles(clesAnnuel, clesMensuel)
  if (pertes.length > 0) {
    const pertesTableau = pertes.map(cle => {
      const [id, titulaire, acheteur, montant, source] = cle.split('||')
      return { id, titulaire, acheteur, montant, source }
    })
    console.log('\n❌ Détail des pertes :')
    console.table(pertesTableau)
  }

  log.info('\n📊 Bilan :')
  log.info(`   Identiques dans les deux  : ${communs}`)
  log.warning(`   ❌ Pertes (absent annuel)  : ${pertes.length}`)
  log.warning(`   ➕ Surplus (absent mensuel): ${surplus.length}`)

  // Sauvegarde des pertes dans un fichier lisible
//   if (pertes.length > 0) {
//     const entete  = "id||titulaire||acheteur||montant\n"
//     const contenu = entete + pertes.join("\n")
//     fs.writeFileSync("./pertes.txt", contenu, "utf-8")
//     console.log(`\n💾 Détail des pertes → pertes.txt`)
//   }
}

// ─── Type pour un marché décomposé ────────────────────────────────────────
interface MarcheDecompose {
  id: string
  titulaire: string
  acheteur: string
  montant: string
  source: string,
  cle: string  // la clé composite complète (les 4 champs)
}

// ─── 1. Modifier extraireCles pour retourner aussi les objets ──────────────
async function extraireMarches (cheminFichier: string): Promise<Map<string, MarcheDecompose>> {
  return new Promise((resolve, reject) => {
    // Map<cle, objet> au lieu de Set<cle>
    const marches = new Map<string, MarcheDecompose>()

    const pipeline = chain([
      createReadStream(cheminFichier),
      parser(),
      pick({ filter: 'marches.marche' }),
      streamArray(),
    ])

    pipeline.on('data', ({ value: marche }) => {
      const id = normaliser(marche.id)
      const titulaire = normaliser(marche.titulaires?.[0]?.titulaire?.id)
      const acheteur = normaliser(marche.acheteur?.id)
      const montant = normaliser(marche.montant)
      const source = normaliser(marche.source)
      const cle = `${id}||${titulaire}||${acheteur}||${montant}||${source}`

      if (id || titulaire || acheteur || montant || source) {
        marches.set(cle, { id, titulaire, acheteur, montant, cle, source })
      }
    })

    pipeline.on('end', () => resolve(marches))
    pipeline.on('error', (err) => reject(err))
  })
}

// ─── 2. Analyser les similarités ──────────────────────────────────────────
interface ResultatSimilarite {
  mensuel: MarcheDecompose       // le marché perdu (côté mensuel)
  annuel: MarcheDecompose       // le candidat trouvé (côté annuel)
  type: 'id_different' | 'titulaire_different' | 'montant_different'
  detail: string
}
interface IndexAnnuel {
  parSanId: Map<string, MarcheDecompose>  // acheteur||titulaire||montant
  parSanTitulaire: Map<string, MarcheDecompose>  // acheteur||id||montant
  parSanMontant: Map<string, MarcheDecompose>  // acheteur||id||titulaire
}

function construireIndex (marchesAnnuel: Map<string, MarcheDecompose>): IndexAnnuel {
  const parSanId = new Map<string, MarcheDecompose>()
  const parSanTitulaire = new Map<string, MarcheDecompose>()
  const parSanMontant = new Map<string, MarcheDecompose>()

  for (const marche of marchesAnnuel.values()) {
    parSanId.set(`${marche.acheteur}||${marche.titulaire}||${marche.montant}`, marche)
    parSanTitulaire.set(`${marche.acheteur}||${marche.id}||${marche.montant}`, marche)
    parSanMontant.set(`${marche.acheteur}||${marche.id}||${marche.titulaire}`, marche)
  }

  return { parSanId, parSanTitulaire, parSanMontant }
}

interface ResultatAnalyse {
  similaires: ResultatSimilarite[]
  sansCorrespondance: MarcheDecompose[]  // aucun des 3 cas ne matche
}

function analyserSimilarites (
  pertes: MarcheDecompose[],
  marchesAnnuel: Map<string, MarcheDecompose>
): ResultatAnalyse {
  const similaires: ResultatSimilarite[] = []
  const sansCorrespondance: MarcheDecompose[] = []

  const index = construireIndex(marchesAnnuel)

  for (const perte of pertes) {
    let trouve = false

    // Cas 1 : id différent
    const candidatSanId = index.parSanId.get(
      `${perte.acheteur}||${perte.titulaire}||${perte.montant}`
    )
    if (candidatSanId && candidatSanId.id !== perte.id) {
      similaires.push({
        mensuel: perte,
        annuel: candidatSanId,
        type: 'id_different',
        detail: `mensuel: ${perte.id} → annuel: ${candidatSanId.id}`
      })
      trouve = true
    }

    // Cas 2 : titulaire différent
    if (!trouve) {
      const candidatSanTitulaire = index.parSanTitulaire.get(
        `${perte.acheteur}||${perte.id}||${perte.montant}`
      )
      if (candidatSanTitulaire && candidatSanTitulaire.titulaire !== perte.titulaire) {
        similaires.push({
          mensuel: perte,
          annuel: candidatSanTitulaire,
          type: 'titulaire_different',
          detail: `mensuel: ${perte.titulaire} → annuel: ${candidatSanTitulaire.titulaire}`
        })
        trouve = true
      }
    }

    // Cas 3 : montant différent
    if (!trouve) {
      const candidatSanMontant = index.parSanMontant.get(
        `${perte.acheteur}||${perte.id}||${perte.titulaire}`
      )
      if (candidatSanMontant && candidatSanMontant.montant !== perte.montant) {
        similaires.push({
          mensuel: perte,
          annuel: candidatSanMontant,
          type: 'montant_different',
          detail: `mensuel: ${perte.montant} → annuel: ${candidatSanMontant.montant}`
        })
        trouve = true
      }
    }

    // Aucun cas ne matche → perte sèche
    if (!trouve) {
      sansCorrespondance.push(perte)
    }
  }

  return { similaires, sansCorrespondance }
}
// ─── 3. Affichage ──────────────────────────────────────────────────────────
function afficherBilanSimilarites (resultats: ResultatSimilarite[]) {
  if (resultats.length === 0) {
    console.log('Aucune similarité trouvée parmi les pertes.')
    return
  }

  // Grouper par type pour afficher 3 tableaux séparés
  const parType = {
    id_different: resultats.filter(r => r.type === 'id_different'),
    titulaire_different: resultats.filter(r => r.type === 'titulaire_different'),
    montant_different: resultats.filter(r => r.type === 'montant_different'),
  }

  if (parType.id_different.length > 0) {
    console.log(`\n🔀 IDs différents (${parType.id_different.length} cas) :`)
    console.table(parType.id_different.map(r => ({
      acheteur: r.mensuel.acheteur,
      titulaire: r.mensuel.titulaire,
      montant: r.mensuel.montant,
      id_mensuel: r.mensuel.id,
      id_annuel: r.annuel.id,
      source_mensuel: r.mensuel.source,
      source_annuel: r.annuel.source
    })))
  }

  if (parType.titulaire_different.length > 0) {
    console.log(`\n👤 Titulaires différents (${parType.titulaire_different.length} cas) :`)
    console.table(parType.titulaire_different.map(r => ({
      acheteur: r.mensuel.acheteur,
      id: r.mensuel.id,
      montant: r.mensuel.montant,
      titulaire_mensuel: r.mensuel.titulaire,
      titulaire_annuel: r.annuel.titulaire,
      source_mensuel: r.mensuel.source,
      source_annuel: r.annuel.source
    })))
  }

  if (parType.montant_different.length > 0) {
    console.log(`\n💰 Montants différents (${parType.montant_different.length} cas) :`)
    console.table(parType.montant_different.map(r => ({
      acheteur: r.mensuel.acheteur,
      id: r.mensuel.id,
      titulaire: r.mensuel.titulaire,
      montant_mensuel: r.mensuel.montant,
      montant_annuel: r.annuel.montant,
      ecart: (parseFloat(r.mensuel.montant) - parseFloat(r.annuel.montant)).toFixed(2),
      source: r.mensuel.source
    })))
  }
}

export const dataAlike = async (bigPath: string, smallPath: string, log: ProcessingContext['log']) => {
  log.info('Lancement comparaison :')

  log.step('Extraction marchés de :' + bigPath)
  const marchesAnnuel = await extraireMarches(bigPath)
  console.log(`   → ${marchesAnnuel.size} marchés trouvés`)

  log.step('Extraction marchés de :' + smallPath)
  const marchesMensuel = await extraireMarches(smallPath)
  console.log(`   → ${marchesMensuel.size} marchés trouvés`)

  log.step('Comparaison des clés :')
  // Comparaison exacte comme avant (sur les clés de la Map)
  const clesAnnuel = new Set(marchesAnnuel.keys())
  const clesMensuel = new Set(marchesMensuel.keys())
  const { pertes } = comparerCles(clesAnnuel, clesMensuel)

  // Analyse de similarité sur les pertes uniquement
  log.step('Analyse des similarités sur les pertes...')
  const pertesObjets = pertes.map(cle => marchesMensuel.get(cle)!)
  const { similaires, sansCorrespondance } = analyserSimilarites(pertesObjets, marchesAnnuel)

  console.log(`\n🔍 Parmi les ${pertesObjets.length} pertes :`)
  console.log(`   ≈ Avec similarité    : ${similaires.length}`)
  console.log(`   ✖ Sans correspondance: ${sansCorrespondance.length}`)

  afficherBilanSimilarites(similaires)

  if (sansCorrespondance.length > 0) {
    console.log(`\n✖ Pertes sèches — aucune similarité (${sansCorrespondance.length} cas) :`)
    console.table(sansCorrespondance.map(m => ({
      id: m.id,
      titulaire: m.titulaire,
      acheteur: m.acheteur,
      montant: m.montant,
      source: m.source
    })))
  }
}
