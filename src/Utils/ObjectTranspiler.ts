/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Is } from '@secjs/utils'

export class ObjectTranspiler {
  static createDictionaryFromModel(model: any) {
    const tableName = model.table
    const dictionary = {}

    model.columns.forEach(column => {
      dictionary[`${tableName}.${column.columnName}`] = column.columnName
    })

    model.relations.forEach(relation => {
      const relationModel = relation.model
      const relationTableName = relationModel.table
      const columns = Reflect.getMetadata('model:columns', relationModel)

      dictionary[relationTableName] = {}

      columns.forEach(column => {
        dictionary[relationTableName][`${relationTableName}.${column.columnName}`] = column.columnName
      })
    })

    return dictionary
  }

  static createDictionaryFromRow(row: any | any[]) {
    const dictionary = {}

    if (Is.Array(row)) row = row[0]

    Object.keys(row).forEach(key => {
      const [_, column] = key.split('.')

      dictionary[key] = column
    })

    return dictionary
  }

  static transpile(flatData: any | any[], model: any): any | any[] {
    const tableName = model.table
    const dictionary = this.createDictionaryFromModel(model)

    Object.keys(flatData).forEach(key => {
      if (key.includes(`${tableName}.`)) {
        const valueInDictionary = dictionary[key]

        model[valueInDictionary] = flatData[key]
      } else {
        const relationTableName = key.split('.')[0]
        const relationDictionary = dictionary[relationTableName]
        const valueInDictionary = relationDictionary[key]

        if (!model[relationTableName]) model[relationTableName] = {}

        model[relationTableName][valueInDictionary] = flatData[key]
      }
    })

    return model

    // if (Is.Array(flatData)) {
    //   const data = flatData.reduce((result, row) => {
    //     result[row.id] = result[row.id] || this.resolveInstance(row, OneClass)
    //
    //     const tableName = ManyClass.prototype.tableName.replace('Table', '')
    //
    //     if (!result[row.id][tableName]) result[row.id][tableName] = []
    //     result[row.id][tableName].push(this.resolveInstance(row, ManyClass))
    //
    //     return result
    //   }, {})
    //
    //   return Object.values(data)
    // }
  }
}

