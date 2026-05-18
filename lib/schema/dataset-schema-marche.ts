export default [
  {
    key: 'id',
    title: 'ID',
    type: 'string',
    description: 'Identifiant technique attribué par l\'acheteur à un marché.',
    label: 'ID'
  },
  {
    key: 'montant',
    type: 'number',
    title: 'Montant',
    description: 'Représente la somme totale hors taxes (HT) que l\'acheteur s\'engage à payer ou, pour un accord-cadre, le montant maximum potentiel prévu sur toute la durée du contrat, reconductions incluses.',
    label: 'Montant'
  },
  {
    key: 'nature',
    type: 'string',
    title: 'Nature',
    description: 'Correspond à l\'une des mentions suivantes : marché, marché de partenariat, marché de défense ou de sécurité',
    label: 'Nature'
  },
  {
    key: 'procedure',
    type: 'string',
    title: 'Procédure',
    description: 'Désigne la méthode utilisée par l\'acheteur pour attribuer un contrat. La valeur correspond à l\'une des catégories suivantes : "procédure adaptée", "appel d\'offres ouvert", "appel d\'offres restreint", "procédure avec négociation", "marché public passé sans publicité ni mise en concurrence préalable", "dialogue compétitif".',
    label: 'Procédure'
  },
  {
    key: 'objet',
    type: 'string',
    title: 'Objet',
    description: 'Description succincte de l\'objet du marché public résumant la nature des prestations attendues ou des fournitures à livrer.',
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
    description: 'Correspond à la date de la réception de la notification du marché par le titulaire.',
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
    description: 'Définit le mode de rémunération du titulaire. La valeur doit être l\'une des suivantes : "Forfaitaire" (prix global fixe), "Unitaire" (prix à l\'unité selon les quantités réelles) ou "Mixte" (combinaison des deux).',
    label: 'Forme du prix'
  },
  {
    key: 'lieuexecutiontypecode',
    type: 'string',
    title: 'Type de code lieu exécution',
    description: 'Spécifie la nature de l\'identifiant géographique utilisé. Doit correspondre à l\'une des valeurs suivantes : "code postal", "code commune", "code arrondissement", "code canton", "code département", "code région", "code pays".',
    label: 'Type de code lieu exécution'
  },
  {
    key: 'lieuexecutioncode',
    type: 'string',
    title: 'Code lieu exécution',
    description: 'Indique l\'identifiant géographique de la zone principale où les prestations sont réalisées. Selon l\'échelle choisie, il peut s\'agir d\'un code postal, d\'un code commune, d\'un code département, d\'un code région ou d\'un code pays',
    label: 'Code lieu exécution'
  },
  {
    key: 'acheteurid',
    type: 'string',
    title: 'ID Acheteur',
    description: 'Numéro SIRET de la collectivité, ministère ou établissement public qui passe le contrat',
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
    description: 'Exprime en mois, arrondie au nombre supérieur, la durée maximum possible d\'un marché, incluant toutes les tranches et toutes les possibilités de reconduction prévues.',
    label: 'Durée (mois)'
  },
  {
    key: 'codecpv',
    type: 'string',
    title: 'Code CPV',
    description: 'Nomenclature indicant le contenu du contrat',
    label: 'Code CPV',
    'x-refersTo': 'http://data.europa.eu/cpv/cpv',
    'x-concept': {
      id: 'codeCPV',
      title: 'Code CPV',
      primary: true
    }
  },
  {
    key: 'datepublicationdonnees',
    type: 'string',
    title: 'Date de publication des données',
    format: 'date',
    description: 'Indique la date à laquelle les données essentielles du marché ont été mises en ligne et rendues publiques sur le portail national',
    label: 'Date de publication des données'
  },
  {
    key: 'offresrecues',
    type: 'number',
    title: 'Offres reçues',
    description: 'Nombre d\'offres reçues lors de la phase de passation, y compris les offres irrecevables.',
    label: 'Offres reçues'
  },
  {
    key: 'ccag',
    type: 'string',
    title: 'CCAG',
    description: 'Identifie le Cahier des Clauses Administratives Générales auquel le marché fait référence. Il définit les règles juridiques et administratives d\'exécution du contrat.',
    label: 'CCAG'
  },
  {
    key: 'typegroupementoperateurs',
    type: 'string',
    title: 'Type de groupement opérateurs',
    description: 'Indique si les entreprises titulaires ont répondu ensemble via un groupement momentané d\'entreprises (co-traitance) et définit la nature de leur responsabilité juridique. La valeur doit être l\'une des suivantes : "Conjoint" (chaque entreprise n\'est responsable que de sa part), "Solidaire" (chaque entreprise est engagée sur la totalité du marché) ou "Pas de groupement" (l\'entreprise a postulé seule).',
    label: 'Type de groupement opérateurs'
  },
  {
    key: 'typeidentifiant',
    type: 'string',
    title: 'Type Indentifiant',
    separator: ';',
    description: 'Spécifie le référentiel dont est issu l\'identifiant de l\'opérateur. La valeur doit obligatoirement être l\'une des suivantes : "SIRET" (France métropolitaine/DROM), "TVA" (TVA intracommunautaire UE), "TAHITI" (Polynésie française), "RIDET" (Nouvelle-Calédonie), "FRWF" (Wallis-et-Futuna), "IREP" (Saint-Pierre-et-Miquelon) ou "HORS UE" (Entreprises hors Union Européenne). Le SIRET sera préféré toutes les fois où cela est possible',
    label: 'Type Indentifiant'
  },
  {
    key: 'idtitulaire',
    type: 'string',
    title: 'ID Titulaire',
    separator: ';',
    description: 'Identifiant unique (numéro SIRET ou équivalent pour l\'étranger) du ou des signataires du marché.',
    label: 'SIRET Titulaire'
  },
  {
    key: 'considerationssociales',
    type: 'string',
    title: 'Considérations sociales',
    separator: ';',
    description: 'Indique la prise en compte des objectifs sociaux ou d\'emploi (loi Climat et Résilience / PNAD). L\'acheteur choisit une ou plusieurs valeurs parmi : "clause sociale", "critère social", "marché réservé", ou "pas de considération sociale" si le contrat n\'en comporte aucune. Utile pour le pilotage des achats durables et le SPASER.',
    label: 'Considérations sociales'
  },
  {
    key: 'considerationsenvironnementales',
    type: 'string',
    title: 'Considérations environnementales',
    separator: ';',
    description: 'Indique l\'intégration d\'objectifs environnementaux dans le cadre de la lutte contre le dérèglement climatique et le renforcement de la résilience. L\'acheteur choisit une ou plusieurs valeurs parmi : "clause environnementale", "critère environnemental", ou "pas de considération environnementale". Donnée clé pour le suivi du PNAD et des critères écoresponsables.',
    label: 'Considérations environnementales'
  },
  {
    key: 'modalitesexecution',
    type: 'string',
    title: "Modalités d'exécution",
    separator: ';',
    description: 'Précise les conditions particulières d\'exécution de la prestation (ex: recours à un chantier d\'insertion, règles d\'approvisionnement ou contraintes géographiques spécifiques).',
    label: "Modalités d'exécution"
  },
  {
    key: 'techniques',
    type: 'string',
    title: 'Techniques',
    description: 'Indique les outils ou méthodes de rationalisation de l\'achat utilisés par l\'acheteur, comme l\'accord-cadre, le système d\'acquisition dynamique ou les enchères électroniques.',
    label: 'Techniques'
  },
  {
    key: 'typesprix',
    type: 'string',
    title: 'Types de prix',
    description: 'Définit les modalités d\'évolution financière du prix au cours du contrat. La valeur doit être l\'une des suivantes : "Définitif ferme", "Définitif actualisable", "Définitif révisable" ou "Provisoire".',
    label: 'Types de prix'
  },
  {
    key: 'modificationid',
    type: 'string',
    title: 'ID Modification',
    separator: ';',
    description: 'Identifiant unique d\'un avenant ou d\'une modification apportée au marché initial en cours d\'exécution.',
    label: 'ID Modification'
  },
  {
    key: 'modificationdatenotification',
    type: 'string',
    title: 'Date notification modification',
    separator: ';',
    description: 'Date de notification officielle de la modification ou de l\'avenant du contrat au titulaire.',
    label: 'Date notification modification'
  },
  {
    key: 'modificationdatepublicationdonnees',
    type: 'string',
    title: 'Date publication modification',
    separator: ';',
    description: 'Date à laquelle les données de la modification ou de l\'avenant ont été publiées sur le portail national de l\'Open Data.',
    label: 'Date publication modification'
  },
  {
    key: 'modificationmontant',
    type: 'string',
    title: 'Montant modification',
    separator: ';',
    description: 'Nouveau montant total hors taxes (HT) du marché après application de la modification, ou montant propre de l\'avenant selon le flux.',
    label: 'Montant modification'
  },
  {
    key: 'modificationtypeidentifiant',
    type: 'string',
    title: 'Modif : Type identifiant titulaire',
    separator: ';',
    description: 'Précise le référentiel de l\'identifiant du nouveau titulaire suite à la modification (SIRET, RIDET, TAFITI, etc.).',
    label: 'Modif : Type identifiant titulaire'
  },
  {
    key: 'modificationidtitulaire',
    type: 'string',
    title: 'Modif : Identifiant titulaire',
    separator: ';',
    description: 'Identifiant du nouveau titulaire suite à la modification.',
    label: 'Modif : Identifiant titulaire'
  },
  {
    key: 'modificationduree',
    type: 'string',
    title: 'Modif : Durée (mois)',
    separator: ';',
    description: 'Modification de la durée du contrat',
    label: 'Modif : Durée (mois)'
  },
  {
    key: 'modificationobjet',
    type: 'string',
    title: 'Modif : Objet',
    separator: ';',
    description: 'Modification de l\'objet du contrat',
    label: 'Modif : Objet'
  },
  {
    key: 'source',
    type: 'string',
    title: 'Source',
    description: 'Origine de la plateforme ou de l\'application ayant généré et transmis les données du contrat',
    label: 'Source'
  },
  {
    key: 'origineue',
    type: 'number',
    title: 'Origine UE',
    description: 'Pourcentage des produits, fournitures ou matières premières issus de pays membres de l\'Union Européenne entrant dans le cadre de l\'exécution du contrat.',
    label: 'Origine UE'
  },
  {
    key: 'originefrance',
    type: 'number',
    title: 'Origine France',
    description: 'Pourcentage des produits, fournitures ou matières premières directement fabriqués ou sourcés en France entrant dans le cadre de l\'exécution du contrat.',
    label: 'Origine France'
  },
  {
    key: 'tauxavance',
    type: 'number',
    title: 'Taux avance',
    description: 'Pourcentage du montant du contrat versé au titulaire dès le début du marché pour lui constituer une trésorerie de lancement, avant tout début de réalisation.',
    label: 'Taux avance'
  },
  {
    key: 'attributionavance',
    type: 'boolean',
    title: 'Attribution avance',
    description: 'Indique si une avance financière de démarrage est réglementairement ou contractuellement octroyée au titulaire (true) ou non (false).',
    label: 'Attribution avance'
  },
  {
    key: 'soustraitancedeclaree',
    type: 'boolean',
    title: 'Sous-traitance déclarée',
    description: 'Indique par un booléen si le titulaire fait appel à un ou plusieurs sous-traitants déclarés dès la signature ou en cours d\'exécution du marché.',
    label: 'Sous-traitance déclarée'
  },
  {
    key: 'idaccordcadre',
    type: 'string',
    title: 'ID Accord-cadre',
    description: 'Référence ou identifiant unique du marché public global de type accord-cadre auquel est adossé le présent marché ou bon de commande.',
    label: 'ID Accord-cadre'
  },
  {
    key: 'marcheinnovant',
    type: 'boolean',
    title: 'Marché innovant',
    description: 'Indique par un booléen si le contrat bénéficie du dispositif d\'achat innovant dispensant de publicité et de mise en concurrence sous un certain seuil.',
    label: 'Marché innovant'
  },
  {
    key: 'soustraitanttypeidentifiant',
    type: 'string',
    title: 'Type Identifiant Sous-traitant',
    separator: ';',
    description: 'Nature de l\'identifiant fourni pour le sous-traitant (SIRET, TVA, etc.).',
    label: 'Type Identifiant Sous-traitant'
  },
  {
    key: 'soustraitantsid',
    type: 'string',
    title: 'SIRET Sous-traitants',
    separator: ';',
    description: 'Identifiant(s) SIRET unique(s) des entreprises sous-traitantes déclarées et agréées pour la réalisation d\'une partie des prestations du marché.',
    label: 'SIRET Sous-traitants'
  },
  {
    key: 'actesoustraitancedureemois',
    type: 'number',
    title: 'Durée acte sous-traitance (mois)',
    description: 'Durée d\'implication exprimée en mois du sous-traitant concerné par l\'acte spécial ou l\'agrément d\'exécution.',
    label: 'Durée acte sous-traitance (mois)'
  },
  {
    key: 'actesoustraitancemontant',
    type: 'string',
    title: 'Montant acte sous-traitance',
    separator: ';',
    description: 'Montant maximum hors taxes (HT) payé directement par l\'acheteur public au sous-traitant agréé au titre de ses prestations.',
    label: 'Montant acte sous-traitance'
  },
  {
    key: 'actesoustraitancevariationprix',
    type: 'string',
    title: 'Variation prix acte sous-traitance',
    separator: ';',
    description: 'Spécifie si le prix dédié au sous-traitant subit les mêmes variations d\'indexation (ferme, révisable) que le marché principal du titulaire.',
    label: 'Variation prix acte sous-traitance'
  },
  {
    key: 'actesoustraitancedatenotification',
    type: 'string',
    title: 'Date notification acte sous-traitance',
    separator: ';',
    description: 'Date de signature ou de notification administrative validant officiellement l\'acte spécial de sous-traitance.',
    label: 'Date notification acte sous-traitance'
  },
  {
    key: 'actesoustraitancedatepublicationdonnees',
    type: 'string',
    title: 'Date publication acte sous-traitance',
    separator: ';',
    description: 'Date à laquelle les données essentielles rattachées à la déclaration de ce sous-traitant ont été téléversées sur la plateforme nationale Open Data.',
    label: 'Date publication acte sous-traitance'
  },
  {
    key: 'modificationactesoustraitanceid',
    type: 'string',
    title: 'ID modification acte sous-traitance',
    separator: ';',
    description: 'Identifiant technique de l\'acte modificatif ou de l\'avenant lié spécifiquement au contrat de sous-traitance.',
    label: 'ID modification acte sous-traitance'
  },
  {
    key: 'datenotificationmodificationsoustraitance',
    type: 'string',
    title: 'Date notification modif sous-traitance',
    separator: ';',
    description: 'Date à laquelle l\'avenant modifiant le contrat du sous-traitant a été formellement notifié.',
    label: 'Date notification modif sous-traitance'
  },
  {
    key: 'modificationactesoustraitancedatepublicationdonnees',
    type: 'string',
    title: 'Date publication modif sous-traitance',
    separator: ';',
    description: 'Date de mise en ligne des données de l\'avenant de sous-traitance sur le portail d\'accès public.',
    label: 'Date publication modif sous-traitance'
  },
  {
    key: 'modificationactesoustraitancemontant',
    type: 'string',
    title: 'Montant modif acte sous-traitance',
    separator: ';',
    description: 'Nouveau montant total hors taxes (HT) alloué au sous-traitant après prise en compte de l\'acte modificatif.',
    label: 'Montant modif acte sous-traitance'
  },
  {
    key: 'modificationactesoustraitancedureemois',
    type: 'number',
    title: 'Modif Sous-traitance : Durée (mois)',
    separator: ';',
    description: 'Nouvelle durée d\'exécution de la part sous-traitée après modification de l\'acte spécial.',
    label: 'Modif Sous-traitance : Durée (mois)'
  }
] as const
