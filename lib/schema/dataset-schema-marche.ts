export default [
  {
    key: 'id',
    title: 'ID',
    type: 'string',
    description: '',
    label: 'ID'
  },
  {
    key: 'montant',
    type: 'number',
    title: 'Montant',
    description: '',
    label: 'Montant'
  },
  {
    key: 'nature',
    type: 'string',
    title: 'Nature',
    description: '',
    label: 'Nature'
  },
  {
    key: 'procedure',
    type: 'string',
    title: 'Procédure',
    description: '',
    label: 'Procédure'
  },
  {
    key: 'objet',
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
    key: 'datenotification',
    type: 'string',
    title: 'Date de notification',
    format: 'date',
    description: '',
    'x-refersTo': 'http://schema.org/Date',
    'x-concept': {
      id: 'date',
      title: "Date d'évènement",
      primary: true
    },
    label: 'Date de notification'
  },
  {
    key: 'formeprix',
    type: 'string',
    title: 'Forme du prix',
    description: '',
    label: 'Forme du prix'
  },
  {
    key: 'lieuexecutiontypecode',
    type: 'string',
    title: 'Type de code lieu exécution',
    description: '',
    label: 'Type de code lieu exécution'
  },
  {
    key: 'lieuexecutioncode',
    type: 'string',
    title: 'Code lieu exécution',
    description: '',
    label: 'Code lieu exécution'
  },
  {
    key: 'acheteurid',
    type: 'string',
    title: 'ID Acheteur',
    description: '',
    'x-refersTo': 'http://www.datatourisme.fr/ontology/core/1.0/#siret',
    'x-concept': {
      id: 'siret',
      title: 'SIRET',
      primary: true
    },
    label: 'ID Acheteur'
  },
  {
    key: 'dureemois',
    type: 'integer',
    title: 'Durée (mois)',
    description: '',
    label: 'Durée (mois)'
  },
  {
    key: 'codecpv',
    type: 'string',
    title: 'Code CPV',
    description: '',
    label: 'Code CPV'
  },
  {
    key: 'datepublicationdonnees',
    type: 'string',
    title: 'Date de publication des données',
    format: 'date',
    description: '',
    label: 'Date de publication des données'
  },
  {
    key: 'offresrecues',
    type: 'number',
    title: 'Offres reçues',
    description: '',
    label: 'Offres reçues'
  },
  {
    key: 'ccag',
    type: 'string',
    title: 'CCAG',
    description: '',
    label: 'CCAG'
  },
  {
    key: 'typegroupementoperateurs',
    type: 'string',
    title: 'Type de groupement opérateurs',
    description: '',
    label: 'Type de groupement opérateurs'
  },
  {
    key: 'titulairesiret',
    type: 'string',
    title: 'SIRET Titulaire',
    separator: ';',
    description: '',
    label: 'SIRET Titulaire'
  },
  {
    key: 'considerationssociales',
    type: 'string',
    title: 'Considérations sociales',
    separator: ';',
    description: '',
    label: 'Considérations sociales'
  },
  {
    key: 'considerationsenvironnementales',
    type: 'string',
    title: 'Considérations environnementales',
    separator: ';',
    description: '',
    label: 'Considérations environnementales'
  },
  {
    key: 'modalitesexecution',
    type: 'string',
    title: "Modalités d'exécution",
    separator: ';',
    description: '',
    label: "Modalités d'exécution"
  },
  {
    key: 'techniques',
    type: 'string',
    title: 'Techniques',
    description: '',
    label: 'Techniques'
  },
  {
    key: 'typesprix',
    type: 'string',
    title: 'Types de prix',
    description: '',
    label: 'Types de prix'
  },
  {
    key: 'modificationid',
    type: 'string',
    title: 'ID Modification',
    separator: ';',
    description: '',
    label: 'ID Modification'
  },
  {
    key: 'modificationdatenotification',
    type: 'string',
    title: 'Date notification modification',
    separator: ';',
    description: '',
    label: 'Date notification modification'
  },
  {
    key: 'modificationdatepublicationdonnees',
    type: 'string',
    title: 'Date publication modification',
    separator: ';',
    description: '',
    label: 'Date publication modification'
  },
  {
    key: 'modificationmontant',
    type: 'string',
    title: 'Montant modification',
    separator: ';',
    description: '',
    label: 'Montant modification'
  },
  {
    key: 'source',
    type: 'string',
    title: 'Source',
    description: '',
    label: 'Source'
  },
  {
    key: 'origineue',
    type: 'number',
    title: 'Origine UE',
    description: '',
    label: 'Origine UE'
  },
  {
    key: 'originefrance',
    type: 'number',
    title: 'Origine France',
    description: '',
    label: 'Origine France'
  },
  {
    key: 'tauxavance',
    type: 'number',
    title: 'Taux avance',
    description: '',
    label: 'Taux avance'
  },
  {
    key: 'attributionavance',
    type: 'boolean',
    title: 'Attribution avance',
    description: '',
    label: 'Attribution avance'
  },
  {
    key: 'soustraitancedeclaree',
    type: 'boolean',
    title: 'Sous-traitance déclarée',
    description: '',
    label: 'Sous-traitance déclarée'
  },
  {
    key: 'idaccordcadre',
    type: 'string',
    title: 'ID Accord-cadre',
    description: '',
    label: 'ID Accord-cadre'
  },
  {
    key: 'marcheinnovant',
    type: 'boolean',
    title: 'Marché innovant',
    description: '',
    label: 'Marché innovant'
  },
  {
    key: 'soustraitantssiret',
    type: 'string',
    title: 'SIRET Sous-traitants',
    separator: ';',
    description: '',
    label: 'SIRET Sous-traitants'
  },
  {
    key: 'actesoustraitancedureemois',
    type: 'number',
    title: 'Durée acte sous-traitance (mois)',
    description: '',
    label: 'Durée acte sous-traitance (mois)'
  },
  {
    key: 'actesoustraitancemontant',
    type: 'string',
    title: 'Montant acte sous-traitance',
    separator: ';',
    description: '',
    label: 'Montant acte sous-traitance'
  },
  {
    key: 'actesoustraitancevariationprix',
    type: 'string',
    title: 'Variation prix acte sous-traitance',
    separator: ';',
    description: '',
    label: 'Variation prix acte sous-traitance'
  },
  {
    key: 'actesoustraitancedatenotification',
    type: 'string',
    title: 'Date notification acte sous-traitance',
    separator: ';',
    description: '',
    label: 'Date notification acte sous-traitance'
  },
  {
    key: 'actesoustraitancedatepublicationdonnees',
    type: 'string',
    title: 'Date publication acte sous-traitance',
    separator: ';',
    description: '',
    label: 'Date publication acte sous-traitance'
  },
  {
    key: 'modificationactesoustraitanceid',
    type: 'string',
    title: 'ID modification acte sous-traitance',
    separator: ';',
    description: '',
    label: 'ID modification acte sous-traitance'
  },
  {
    key: 'datenotificationmodificationsoustraitance',
    type: 'string',
    title: 'Date notification modif sous-traitance',
    separator: ';',
    description: '',
    label: 'Date notification modif sous-traitance'
  },
  {
    key: 'modificationactesoustraitancedatepublicationdonnees',
    type: 'string',
    title: 'Date publication modif sous-traitance',
    separator: ';',
    description: '',
    label: 'Date publication modif sous-traitance'
  },
  {
    key: 'modificationactesoustraitancemontant',
    type: 'string',
    title: 'Montant modif acte sous-traitance',
    separator: ';',
    description: '',
    label: 'Montant modif acte sous-traitance'
  }
] as const
