export default [
  {
    key: 'id',
    'x-originalName': 'id',
    type: 'string',
    title: 'ID',
    description: 'Identifiant technique attribué par l\'autorité concédante à un contrat',
    label: 'ID'
  },
  {
    key: 'nature',
    'x-originalName': 'nature',
    type: 'string',
    title: 'Nature',
    description: 'Correspond à l\'une des mentions suivantes : "concession de travaux", "concession de service", "concession de service public" ou "délégation de service public"',
    label: 'Nature'
  },
  {
    key: 'procedure',
    'x-originalName': 'procedure',
    type: 'string',
    title: 'Procédure',
    description: 'Désigne la méthode utilisée par l\'acheteur pour attribuer un contrat. La valeur correspond à l\'une des catégories suivantes : "procédure négociée ouverte", "procédure non-négociée ouverte", "procédure négociée restreinte" ou "procédure non-négociée restreinte".',
    label: 'Procédure'
  },
  {
    key: 'objet',
    'x-originalName': 'objet',
    type: 'string',
    title: 'Objet',
    description: 'Description succincte du contrat résumant la nature des services ou des travaux concédés (ex: exploitation d\'un réseau de chauffage, gestion d\'un camping).',
    label: 'Objet',
    'x-refersTo': 'http://schema.org/description',
    'x-concept': {
      title: 'Description',
      primary: true
    }
  },
  {
    key: 'datesignature',
    'x-originalName': 'datesignature',
    type: 'string',
    format: 'date',
    title: 'Date Signature',
    description: 'Date de signature officielle du contrat de concession par l\'ensemble des parties prenantes.',
    label: 'Date Signature',
    'x-refersTo': 'http://schema.org/Date',
    'x-concept': {
      id: 'date',
      title: 'Date d\'évènement',
      primary: true
    }
  },
  {
    key: 'datedebutexecution',
    'x-originalName': 'datedebutexecution',
    type: 'string',
    format: 'date',
    title: 'Date Début Exécution',
    description: 'Date correspondant à la notification du contrat ou fixée contractuellement pour le démarrage effectif des prestations ou de l\'exploitation.',
    label: 'Date Début Exécution'
  },
  {
    key: 'datepublicationdonnees',
    'x-originalName': 'datepublicationdonnees',
    type: 'string',
    format: 'date',
    title: 'Date Publication',
    description: 'Date à laquelle les données initiales du contrat de concession ont été publiées sur la plateforme nationale Open Data.',
    label: 'Date Publication'
  },
  {
    key: 'dureemois',
    'x-originalName': 'dureemois',
    type: 'integer',
    title: 'Durée Mois',
    description: 'Durée totale prévisionnelle d\'exécution de la concession, exprimée en mois (arrondie au nombre supérieur).',
    label: 'Durée Mois'
  },
  {
    key: 'autoriteconcedanteid',
    'x-originalName': 'autoriteconcedanteid',
    type: 'string',
    title: 'Autorité Concédante ID',
    description: 'Numéro SIRET officiel de la personne publique ou de l\'organisme qui octroie la concession.',
    label: 'Autorité Concédante ID',
    'x-refersTo': 'http://www.datatourisme.fr/ontology/core/1.0/#siret',
    'x-concept': {
      id: 'siret',
      title: 'SIRET',
      primary: true
    }
  },
  {
    key: 'concessionnairessiret',
    'x-originalName': 'concessionnairessiret',
    type: 'string',
    title: 'Concessionnaires SIRET',
    separator: '; ',
    description: 'Identifiant unique (numéro SIRET ou équivalent pour l\'étranger) de l\'entreprise ou des entreprises attributaires de la concession.',
    'x-display': 'textarea',
    label: 'Concessionnaires SIRET'
  },
  {
    key: 'considerationssociales',
    'x-originalName': 'considerationssociales',
    type: 'string',
    title: 'Considérations Sociales',
    separator: '; ',
    description: 'Indique l\'intégration de critères ou clauses liés à l\'insertion professionnelle ou à l\'égalité. Valeurs possibles : "Clause d\'exécution", "Critère de choix", "Les deux" ou "Aucune".',
    label: 'Considérations Sociales'
  },
  {
    key: 'considerationsenvironnementales',
    'x-originalName': 'considerationsenvironnementales',
    type: 'string',
    title: 'Considérations Environnementales',
    separator: '; ',
    description: 'Indique l\'intégration de critères ou clauses liés à la performance environnementale ou au développement durable. Valeurs possibles : "Clause d\'exécution", "Critère de choix", "Les deux" ou "Aucune".',
    label: 'Considérations Environnementales'
  },
  {
    key: 'valeurglobale',
    'x-originalName': 'valeurglobale',
    type: 'number',
    title: 'Valeur Globale',
    description: 'Estimation du chiffre d\'affaires total hors taxes (HT) que le concessionnaire devrait générer sur toute la durée du contrat',
    label: 'Valeur Globale'
  },
  {
    key: 'montantsubventionpublique',
    'x-originalName': 'montantsubventionpublique',
    type: 'number',
    title: 'Montant Subvention Publique',
    description: 'Montant total hors taxes (HT) des contributions financières, subventions ou aides publiques versées par l\'autorité concédante pour équilibrer l\'exploitation.',
    label: 'Montant Subvention Publique'
  },
  {
    key: 'origineue',
    'x-originalName': 'origineue',
    type: 'number',
    title: 'Origine UE',
    description: 'Part en pourcentage des fournitures ou produits issus de pays de l\'Union Européenne mobilisés dans l\'exécution du contrat.',
    label: 'Origine UE'
  },
  {
    key: 'originefrance',
    'x-originalName': 'originefrance',
    type: 'number',
    title: 'Origine France',
    description: 'Part en pourcentage des fournitures ou produits d\'origine France mobilisés dans l\'exécution du contrat.',
    label: 'Origine France'
  },
  {
    key: 'tauxavance',
    'x-originalName': 'tauxavance',
    type: 'number',
    title: 'Taux Avance',
    description: 'Taux de l\'avance attribuée en pourcentage du montant initial du marché',
    label: 'Taux Avance'
  },
  {
    key: 'modificationsid',
    'x-originalName': 'modificationsid',
    type: 'string',
    title: 'Modif : ID',
    separator: '; ',
    description: 'Identifiant unique de la modification (avenant) apportée au contrat de concession initial.',
    label: 'Modif : ID'
  },
  {
    key: 'modificationsdureemois',
    'x-originalName': 'modificationsdureemois',
    type: 'string',
    title: 'Modif : Durée Mois',
    separator: '; ',
    description: 'Nouvelle durée totale de la concession exprimée en mois suite à l\'application de la modification (avenant de prolongation).',
    label: 'Modif : Durée Mois'
  },
  {
    key: 'modificationsvaleurglobale',
    'x-originalName': 'modificationsvaleurglobale',
    type: 'string',
    title: 'Modif : Valeur Globale',
    separator: '; ',
    description: 'Nouvelle estimation de la valeur globale (CA prévisionnel) du contrat après la prise en compte de la modification.',
    label: 'Modif : Valeur Globale'
  },
  {
    key: 'objetmodification',
    'x-originalName': 'objetmodification',
    type: 'string',
    title: 'Modif : Objet',
    separator: '; ',
    description: 'Motif ou description succincte justifiant la modification du contrat (ex: travaux supplémentaires urgents, modification législative).',
    label: 'Modif : Objet'
  },
  {
    key: 'datesignaturemodification',
    'x-originalName': 'datesignaturemodification',
    type: 'string',
    format: 'date',
    title: 'Modif : Date Signature',
    separator: '; ',
    description: 'Date de signature de l\'avenant modificatif par l\'autorité concédante et le concessionnaire.',
    label: 'Modif : Date Signature'
  },
  {
    key: 'datepublicationdonneesmodification',
    'x-originalName': 'datepublicationdonneesmodification',
    type: 'string',
    format: 'date',
    title: 'Modif : Date Publication',
    separator: '; ',
    description: 'Date de mise en ligne et de publication des données spécifiques de cet avenant modificatif sur la plateforme nationale.',
    label: 'Modif : Date Publication'
  },
  {
    key: 'datepublicationdonneesexecution',
    'x-originalName': 'datepublicationdonneesexecution',
    type: 'string',
    format: 'date',
    title: 'Exécution : Date Publication',
    separator: '; ',
    description: 'Date de publication des données annuelles issues du rapport d\'exécution de la concession (données mises à jour chaque année).',
    label: 'Exécution : Date Publication'
  },
  {
    key: 'depensesinvestissement',
    'x-originalName': 'depensesinvestissement',
    type: 'string',
    title: 'Exécution : Dépenses Investissement',
    separator: '; ',
    description: 'Montant cumulé des dépenses d\'investissement (CAPEX) réalisées par le concessionnaire pour le compte de l\'autorité concédante au cours de l\'année écoulée.',
    label: 'Exécution : Dépenses Investissement'
  },
  {
    key: 'intituletarif',
    'x-originalName': 'intituletarif',
    type: 'string',
    title: 'Exécution : Intitulé Tarif',
    separator: '; ',
    description: 'Nom ou libellé de la grille tarifaire ou de la redevance appliquée aux usagers du service public concédé pour l\'année d\'exécution (ex: Tarif Usagers, Abonnement de base).',
    label: 'Exécution : Intitulé Tarif'
  },
  {
    key: 'montanttarif',
    'x-originalName': 'montanttarif',
    type: 'string',
    title: 'Exécution : Montant Tarif',
    separator: '; ',
    description: 'Valeur numérique ou montant lié à l\'intitulé du tarif appliqué au cours de l\'exercice d\'exécution.',
    label: 'Exécution : Montant Tarif'
  },
  {
    key: 'source',
    'x-originalName': 'source',
    type: 'string',
    title: 'Source',
    description: 'Origine de la plateforme ou de l\'application ayant généré et transmis les données du contrat',
    label: 'Source'
  }
] as const
