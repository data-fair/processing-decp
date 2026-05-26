# <img alt="Data FAIR logo" src="https://cdn.jsdelivr.net/gh/data-fair/data-fair@master/ui/public/assets/logo.svg" width="30"> @data-fair/processing-decp

Processing plugin for the [Data Fair](https://github.com/data-fair/processings) platform designed to harvest, consolidate, and update French Public Procurement Data (DECP) published on data.gouv.fr.

It relies on the global historical file for initial setup, and then incrementally applies daily updates using daily publications.

## Features

- **Dataset Separation & Flexibility** — Processes the mixed DECP source files and cleanly splits them into two distinct datasets (*marchés* and *concessions*) for maximum clarity. Users can choose to generate both datasets simultaneously or focus on just one.
- **One-Time Initialization** — Performs a heavy initial setup by downloading and parsing the historical `decp-global.json` archive. Designed to be executed only once at setup.
- **User-Triggered Daily Updates** — Incremental synchronization is decoupled from initialization. The user can manually trigger or schedule updates, with a strong recommendation to run them daily to fetch the latest delta files from data.gouv.fr.

## Configuration

### Create

| Field | Description |
| ----- | ----------- |
| `datasetTitle` | Defines the name for the new dataset. |
| `datasetFilterCreate` | Data type to process: `marchés`, `concessions`, or `both` (which will create two separate datasets for clarity). |
| `initializeDataset` | When enabled, performs a one-time initialization of the dataset using the global historical archive. |

### Update

| Field | Description |
| ----- | ----------- |
| `dataset` | Target dataset ID to update daily with the latest published files |
| `datasetFilterUpdate` | Data type to target for the incremental update: marchés or concessions (only one type can be updated per task run). |

## Extensions

Data harvested from data.gouv.fr can be enriched depending on your deployment environment (Staging or Koumoul). These extensions append public entity names, geocoding information, and CPV nomenclature details.

<details>
<summary><b>Staging Configuration ('Marché' and 'Concession )</b></summary>

```json
extensions = [
  {
    active: true,
    type: 'remoteService',
    remoteService: 'koumoul-com-dataset-sirene',
    action: 'masterData_bulkSearch_siret-infos',
    select: [
      'denominationUniteLegale',
      '_siret_coords.y_latitude',
      '_siret_coords.x_longitude',
      '_infos_commune.code_departement',
      '_infos_commune.code_region'
    ],
    overwrite: {},
    propertyPrefix: '_siret_infos'
  }
]
```
</details>

<details>
<summary><b>Koumoul Configuration ('Marché')</b></summary>

```json
extensions = [
      {
        active: true,
        type: 'remoteService',
        remoteService: 'dataset:geolocalisation-des-etablissements-du-repertoire-sirene',
        action: 'masterData_bulkSearch_siret-coords',
        select: [
          'x_longitude',
          'y_latitude'
        ],
        overwrite: {},
        propertyPrefix: '_siret_coords'
      },
      {
        active: true,
        type: 'remoteService',
        remoteService: 'dataset:sirene',
        action: 'masterData_bulkSearch_siret-infos',
        select: [
          '_infos_commune.code_departement',
          '_infos_commune.code_region',
          'denominationUniteLegale'
        ],
        overwrite: {},
        propertyPrefix: '_siret_infos'
      },
      {
        active: true,
        type: 'remoteService',
        remoteService: 'dataset:a5u3jsc115-84-1c2591opar',
        action: 'masterData_bulkSearch_nomenclature-des-secteurs-dachat-code-cpv',
        select: [
          'secteurs',
          'soussecteurs',
          'intitule_officiel_par_code_cpv'
        ],
        overwrite: {},
        propertyPrefix: '_nomenclature_des-secteurs-dachat-code-cpv'
      }
    ]
```
</details>

<details>
<summary><b>Koumoul Configuration ('Concession' )</b></summary>

```json
extensions = [
      {
        active: true,
        type: 'remoteService',
        remoteService: 'dataset:geolocalisation-des-etablissements-du-repertoire-sirene',
        action: 'masterData_bulkSearch_siret-coords',
        select: [
          'x_longitude',
          'y_latitude'
        ],
        overwrite: {},
        propertyPrefix: '_siret_coords'
      },
      {
        active: true,
        type: 'remoteService',
        remoteService: 'dataset:sirene',
        action: 'masterData_bulkSearch_siret-infos',
        select: [
          '_infos_commune.code_departement',
          '_infos_commune.code_region',
          'denominationUniteLegale'
        ],
        overwrite: {},
        propertyPrefix: '_siret_infos'
      }
    ]
```
</details>

## Data Sources

This processing plugin interacts with the following official resources:
- [DECP - Consolidated Files on data.gouv.fr](https://www.data.gouv.fr/datasets/donnees-essentielles-de-la-commande-publique-fichiers-consolides)
- [DECP API on data.gouv.fr](https://www.data.gouv.fr/datasets/api-decp)
