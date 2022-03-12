/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Is } from '@secjs/utils'

export class ModelFactory {
  private static createDictionaryFromRow(row: any | any[]) {
    const dictionary = {}

    if (Is.Array(row)) row = row[0]

    Object.keys(row).forEach(key => {
      const [_, column] = key.split('.')

      dictionary[key] = column
    })

    return dictionary
  }

  private static updateInstanceState(row: any, model: any) {
    const tableName = model.table
    const rowDictionary = ModelFactory.createDictionaryFromRow(row)

    Object.keys(rowDictionary).forEach(key => {
      const relationTableName = key.split('.')[0]

      if (tableName === relationTableName) {
        model[rowDictionary[key]] = row[key]

        return
      }

      const relation = model.relations.find(relation => relation.model.table === relationTableName)

      switch (relation.relationType) {
        case 'hasOne':
          if (!model[relation.columnName]) {
            model[relation.columnName] = new relation.model()
          }

          // console.log(row)
          console.log(key, row[key])

          model[relation.columnName][rowDictionary[key]] = row[key]
          break;
        case 'belongsTo':
          if (!model[relation.columnName]) {
            model[relation.columnName] = new relation.model()
          }

          // console.log(row)
          console.log(key, row[key])

          model[relation.columnName][rowDictionary[key]] = row[key]
          break;
        case 'hasMany':
          if (!model[relation.columnName]) {
            model[relation.columnName] = {}
          }

          // console.log('PRIMARYKEY', `${tableName}.id`)
          // console.log('PRIMARYKEY', row[`${tableName}.id`])
          // console.log('FOREIGNKEY', `${relationTableName}.${relation.foreignKey}`)
          // console.log('FOREIGNKEY', row[`${relationTableName}.${relation.foreignKey}`])

          if (row[`${relationTableName}.${relation.foreignKey}`] !== row[`${tableName}.id`]) {
            return
          }

          if (model[relation.columnName][row[`${relationTableName}.id`]]) {
            const relationModel = model[relation.columnName][row[`${relationTableName}.id`]]
            relationModel[rowDictionary[key]] = row[key]

            model[relation.columnName][row[`${relationTableName}.id`]] = relationModel
            return
          }

          const relationModel = new relation.model()
          relationModel[rowDictionary[key]] = row[key]

          model[relation.columnName][row[`${relationTableName}.id`]] = relationModel
        break;
      }
    })

    model.relations.forEach(relation => {
      if (relation.relationType === 'hasMany') {
        model[relation.columnName] = Object.values(model[relation.columnName])
      }
    })

    return model
  }

  static create(flatData: any[], model: any) {
    const data = flatData.reduce((result, row) => {
      const id = row[`${model.table}.id`]

      result[id] = result[id] || this.updateInstanceState(row, model)

      return result
    }, {})

    return Object.values(data)
  }
}

