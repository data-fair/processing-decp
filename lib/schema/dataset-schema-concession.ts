export default [
  {
    key: 'id',
    'x-originalName': 'id',
    type: 'string',
    title: 'ID',
    description: '',
    label: 'ID'
  },
  {
    key: 'nature',
    'x-originalName': 'nature',
    type: 'string',
    title: 'Nature',
    description: '',
    label: 'Nature'
  },
  {
    key: 'procedure',
    'x-originalName': 'procedure',
    type: 'string',
    title: 'Procédure',
    description: '',
    label: 'Procédure'
  },
  {
    key: 'objet',
    'x-originalName': 'objet',
    type: 'string',
    title: 'Objet',
    description: '',
    label: 'Objet',
    'x-refersTo': 'http://schema.org/description',
    'x-concept': {
      id: 'description',
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
    description: '',
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
    description: '',
    label: 'Date Début Exécution'
  },
  {
    key: 'datepublicationdonnees',
    'x-originalName': 'datepublicationdonnees',
    type: 'string',
    format: 'date',
    title: 'Date Publication',
    description: '',
    label: 'Date Publication'
  },
  {
    key: 'dureemois',
    'x-originalName': 'dureemois',
    type: 'integer',
    title: 'Durée Mois',
    description: '',
    label: 'Durée Mois'
  },
  {
    key: 'autoriteconcedanteid',
    'x-originalName': 'autoriteconcedanteid',
    type: 'string',
    title: 'Autorité Concédante ID',
    description: '',
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
    description: '',
    'x-display': 'textarea',
    label: 'Concessionnaires SIRET'
  },
  {
    key: 'titulaires',
    'x-originalName': 'titulaires',
    type: 'string',
    title: 'Titulaires',
    separator: '; ',
    description: '',
    label: 'Titulaires'
  },
  {
    key: 'considerationssociales',
    'x-originalName': 'considerationssociales',
    type: 'string',
    title: 'Considérations Sociales',
    separator: '; ',
    description: '',
    label: 'Considérations Sociales'
  },
  {
    key: 'considerationsenvironnementales',
    'x-originalName': 'considerationsenvironnementales',
    type: 'string',
    title: 'Considérations Environnementales',
    separator: '; ',
    description: '',
    label: 'Considérations Environnementales'
  },
  {
    key: 'valeurglobale',
    'x-originalName': 'valeurglobale',
    type: 'number',
    title: 'Valeur Globale',
    description: '',
    label: 'Valeur Globale'
  },
  {
    key: 'montantsubventionpublique',
    'x-originalName': 'montantsubventionpublique',
    type: 'number',
    title: 'Montant Subvention Publique',
    description: '',
    label: 'Montant Subvention Publique'
  },
  {
    key: 'origineue',
    'x-originalName': 'origineue',
    type: 'number',
    title: 'Origine UE',
    description: '',
    label: 'Origine UE'
  },
  {
    key: 'originefrance',
    'x-originalName': 'originefrance',
    type: 'number',
    title: 'Origine France',
    description: '',
    label: 'Origine France'
  },
  {
    key: 'tauxavance',
    'x-originalName': 'tauxavance',
    type: 'number',
    title: 'Taux Avance',
    description: '',
    label: 'Taux Avance'
  },
  {
    key: 'modificationsid',
    'x-originalName': 'modificationsid',
    type: 'string',
    title: 'Modif : ID',
    separator: '; ',
    description: '',
    label: 'Modif : ID'
  },
  {
    key: 'modificationsdureemois',
    'x-originalName': 'modificationsdureemois',
    type: 'string',
    title: 'Modif : Durée Mois',
    separator: '; ',
    description: '',
    label: 'Modif : Durée Mois'
  },
  {
    key: 'modificationsvaleurglobale',
    'x-originalName': 'modificationsvaleurglobale',
    type: 'string',
    title: 'Modif : Valeur Globale',
    separator: '; ',
    description: '',
    label: 'Modif : Valeur Globale'
  },
  {
    key: 'objetmodification',
    'x-originalName': 'objetmodification',
    type: 'string',
    title: 'Modif : Objet',
    separator: '; ',
    description: '',
    label: 'Modif : Objet'
  },
  {
    key: 'datesignaturemodification',
    'x-originalName': 'datesignaturemodification',
    type: 'string',
    format: 'date',
    title: 'Modif : Date Signature',
    separator: '; ',
    description: '',
    label: 'Modif : Date Signature'
  },
  {
    key: 'datepublicationdonneesmodification',
    'x-originalName': 'datepublicationdonneesmodification',
    type: 'string',
    format: 'date',
    title: 'Modif : Date Publication',
    separator: '; ',
    description: '',
    label: 'Modif : Date Publication'
  },
  {
    key: 'datepublicationdonneesexecution',
    'x-originalName': 'datepublicationdonneesexecution',
    type: 'string',
    format: 'date',
    title: 'Exécution : Date Publication',
    separator: '; ',
    description: '',
    label: 'Exécution : Date Publication'
  },
  {
    key: 'depensesinvestissement',
    'x-originalName': 'depensesinvestissement',
    type: 'string',
    title: 'Exécution : Dépenses Investissement',
    separator: '; ',
    description: '',
    label: 'Exécution : Dépenses Investissement'
  },
  {
    key: 'intituletarif',
    'x-originalName': 'intituletarif',
    type: 'string',
    title: 'Exécution : Intitulé Tarif',
    separator: '; ',
    description: '',
    label: 'Exécution : Intitulé Tarif'
  },
  {
    key: 'montanttarif',
    'x-originalName': 'montanttarif',
    type: 'string',
    title: 'Exécution : Montant Tarif',
    separator: '; ',
    description: '',
    label: 'Exécution : Montant Tarif'
  },
  {
    key: 'source',
    'x-originalName': 'source',
    type: 'string',
    title: 'Source',
    description: '',
    label: 'Source'
  }
] as const
