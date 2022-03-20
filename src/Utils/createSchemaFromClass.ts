/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Schema } from 'mongoose'
import { Model } from '../Model'

export function createSchemaFromClass(Class: typeof Model) {
  const schemaObject: any = {}

  Class.columns.forEach(column => {
    schemaObject[column.columnName] = {}
    schemaObject[column.columnName].type = column.propertyType

    if (column.defaultValue) {
      schemaObject[column.columnName].default = column.defaultValue
    }
  })

  Class.relations.forEach(relation => {
    schemaObject[relation.propertyName] = {}
    schemaObject[relation.propertyName].type = 'ObjectId'
    schemaObject[relation.propertyName].ref = relation.model().name
  })

  return new Schema(schemaObject)
}
