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
    label: 'Procédure',
    'x-refersTo': 'http://schema.org/description',
    'x-concept': {
      id: 'description',
      title: 'Description',
      primary: true
    }
  },
  {
    key: 'objet',
    'x-originalName': 'objet',
    type: 'string',
    title: 'Objet',
    description: '',
    label: 'Objet'
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
    key: '_siret_infos.denominationUniteLegale',
    'x-originalName': '_siret_infos.denominationUniteLegale',
    'x-extension': 'koumoul-com-dataset-sirene/masterData_bulkSearch_siret-infos',
    title: "Dénomination de l'unité légale",
    description: "\nCette variable désigne la raison sociale pour les personnes morales. Il s'agit du nom sous lequel est déclarée l'unité légale.\n\nCette variable est à null pour les personnes physiques.\n\nLa dénomination peut parfois contenir la mention de la forme de la société (SA, SAS, SARL, etc.).\n\nhttps://www.sirene.fr/sirene/public/variable/denominationUniteLegale\n      ",
    type: 'string',
    'x-refersTo': 'http://www.w3.org/2000/01/rdf-schema#label',
    'x-capabilities': {
      textAgg: false,
      textStandard: false
    },
    'x-concept': {
      id: 'label',
      title: 'Libellé',
      primary: true
    },
    label: "Dénomination de l'unité légale"
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
  },
  {
    key: '_siret_infos._error',
    type: 'string',
    'x-originalName': '_error',
    'x-extension': 'koumoul-com-dataset-sirene/masterData_bulkSearch_siret-infos',
    title: 'Erreur de récupération de données de référence',
    description: 'Une erreur lors de la récupération des informations depuis un service distant',
    'x-calculated': true,
    label: 'Erreur de récupération de données de référence'
  },
  {
    key: '_siret_infos._siret_coords.y_latitude',
    'x-originalName': '_siret_infos._siret_coords.y_latitude',
    'x-extension': 'koumoul-com-dataset-sirene/masterData_bulkSearch_siret-infos',
    title: 'Latitude',
    description: 'Latitude (en degrés décimaux = coordonnées GPS)',
    type: 'number',
    'x-refersTo': 'http://schema.org/latitude',
    'x-capabilities': {
      textStandard: false,
      index: false
    },
    'x-concept': {
      id: 'latitude',
      title: 'Latitude',
      primary: true
    },
    label: 'Latitude'
  },
  {
    key: '_siret_infos._siret_coords.x_longitude',
    'x-originalName': '_siret_infos._siret_coords.x_longitude',
    'x-extension': 'koumoul-com-dataset-sirene/masterData_bulkSearch_siret-infos',
    title: 'Longitude',
    description: 'Longitude (en degrés décimaux = coordonnées GPS)',
    type: 'number',
    'x-refersTo': 'http://schema.org/longitude',
    'x-capabilities': {
      textStandard: false,
      index: false
    },
    'x-concept': {
      id: 'longitude',
      title: 'Longitude',
      primary: true
    },
    label: 'Longitude'
  },
  {
    key: '_siret_infos._infos_commune.code_departement',
    'x-originalName': '_siret_infos._infos_commune.code_departement',
    'x-extension': 'koumoul-com-dataset-sirene/masterData_bulkSearch_siret-infos',
    title: 'Code département',
    description: 'Code du département',
    type: 'string',
    'x-refersTo': 'http://rdf.insee.fr/def/geo#codeDepartement',
    'x-capabilities': {
      textStandard: false,
      insensitive: false,
      textAgg: false,
      text: false
    },
    'x-concept': {
      id: 'codeDepartement',
      title: 'Code département',
      primary: true
    },
    label: 'Code département'
  },
  {
    key: '_siret_infos._infos_commune.code_region',
    'x-originalName': '_siret_infos._infos_commune.code_region',
    'x-extension': 'koumoul-com-dataset-sirene/masterData_bulkSearch_siret-infos',
    title: 'Code région',
    description: 'Code de la région',
    type: 'string',
    'x-refersTo': 'http://rdf.insee.fr/def/geo#codeRegion',
    'x-capabilities': {
      textStandard: false,
      insensitive: false,
      textAgg: false,
      text: false
    },
    'x-concept': {
      id: 'codeRegion',
      title: 'Code région',
      primary: true
    },
    label: 'Code région'
  },
  {
    'x-calculated': true,
    key: '_geopoint',
    type: 'string',
    title: 'Coordonnée géographique',
    description: 'Centroïde au format "lat,lon"',
    'x-refersTo': 'http://www.w3.org/2003/01/geo/wgs84_pos#lat_long',
    'x-concept': {
      id: 'latLon',
      title: 'Latitude / Longitude',
      primary: true
    },
    label: 'Coordonnée géographique'
  },
  {
    'x-calculated': true,
    key: '_updatedAt',
    type: 'string',
    format: 'date-time',
    title: 'Date de mise à jour',
    description: 'Date de dernière mise à jour de la ligne du jeu de données',
    label: 'Date de mise à jour'
  },
  {
    'x-calculated': true,
    key: '_id',
    type: 'string',
    format: 'uri-reference',
    title: 'Identifiant',
    description: 'Identifiant unique parmi toutes les lignes du jeu de données',
    label: 'Identifiant'
  },
  {
    'x-calculated': true,
    key: '_i',
    type: 'integer',
    title: 'Numéro de ligne',
    description: 'Indice de la ligne dans le fichier d\'origine',
    label: 'Numéro de ligne'
  },
  {
    'x-calculated': true,
    key: '_rand',
    type: 'integer',
    title: 'Nombre aléatoire',
    description: 'Un nombre aléatoire associé à la ligne qui permet d\'obtenir un tri aléatoire par exemple',
    label: 'Nombre aléatoire'
  }
] as const
