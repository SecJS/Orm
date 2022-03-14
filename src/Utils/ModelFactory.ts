/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Is } from '@secjs/utils'
import { DatabaseContract } from '@secjs/database'
import { DatabaseConnection } from '../DatabaseConnection'
import { InternalServerException } from '@secjs/exceptions'
import { RelationContract } from '../Contracts/RelationContract'

export class ModelFactory {
  private static DB: DatabaseContract = new DatabaseConnection().getDb()

  private static getIncludedRelations(relations: RelationContract[]) {
    if (!relations || !relations.length) return []

    return relations.reduce((includedRelations: RelationContract[], previous: RelationContract) => {
      if (previous.isIncluded) includedRelations.push(previous)

      return includedRelations
    }, [])
  }

  private static async verifyModelType(data: any | any[], relation: RelationContract) {
    if (Is.Array(data)) {
      for (let d of data) {
        const index = data.indexOf(d)

        data[index] = await this[relation.relationType](d, relation)
      }

      return data
    }

    return this[relation.relationType](data, relation)
  }

  private static async hasOne(data: any, relation: RelationContract): Promise<any> {
    const model = relation.model
    const foreignKey = relation.foreignKey
    const primaryKey = relation.primaryKey
    const propertyName = relation.propertyName
    const columnDictionary = model.columnDictionary

    // Where in approach
    // if (Is.Array(data)) {
    //   const foreignKeyValues = data.map(d => d[foreignKey])
    //
    //   console.log(foreignKey)
    //
    //   const relationData = await this.DB
    //     .buildTable(model.table)
    //     .buildWhereIn('id', foreignKeyValues)
    //     .findMany()
    //
    //   relationData.forEach(relationD => {
    //     data.forEach((mainM, index) => {
    //       console.log(relationD.id === mainM[foreignKey])
    //       if (relationD.id !== mainM[foreignKey]) return
    //
    //       mainM[columnName] = new model()
    //
    //       Object.keys(relationD).forEach(key => mainM[columnName][key] = relationD[key])
    //
    //       data[index] = mainM
    //     })
    //   })
    //
    //   return data
    // }

    data[propertyName] = null

    const modelData = await this.DB
      .buildTable(model.table)
      .buildWhere(foreignKey, data[primaryKey])
      .find()

    if (modelData) {
      data[propertyName] = new model()

      Object.keys(modelData).forEach(key => {
        if (!columnDictionary[key]) {
          throw new InternalServerException(`The field ${key} has not been mapped in some of your @Column annotation in ${model.name} Model`)
        }

        data[propertyName][columnDictionary[key]] = modelData[key]
      })
    }

    return data
  }

  private static async hasMany(data: any, relation: RelationContract): Promise<any> {
    const model = relation.model
    const foreignKey = relation.foreignKey
    const primaryKey = relation.primaryKey
    const propertyName = relation.propertyName
    const columnDictionary = model.columnDictionary

    data[propertyName] = []

    const modelsData = await this.DB
      .buildTable(model.table)
      .buildWhere(foreignKey, data[primaryKey])
      .findMany()

    modelsData.forEach(modelData => {
      const modelRelation = new model()

      Object.keys(modelData).forEach(key => {
        if (!columnDictionary[key]) {
          throw new InternalServerException(`The field ${key} has not been mapped in some of your @Column annotation in ${model.name} Model`)
        }

        modelRelation[columnDictionary[key]] = modelData[key]
      })

      data[propertyName].push(modelRelation)
    })

    return data
  }

  private static async belongsTo(data: any, relation: RelationContract): Promise<any> {
    // const model = relation.model
    // const foreignKey = relation.foreignKey
    // const primaryKey = relation.primaryKey
    // const propertyName = relation.propertyName
    // const columnDictionary = model.columnDictionary
    //
    // data[propertyName] = null
    //
    // const modelData = await this.DB
    //   .buildTable(model.table)
    //   .buildWhere(foreignKey, data[primaryKey])
    //   .find()
    //
    // if (modelData) {
    //   data[propertyName] = new model()
    //
    //   Object.keys(modelData).forEach(key => data[propertyName][columnDictionary[key]] = modelData[key])
    // }
    //
    // return data
    return this.hasOne(data, relation)
  }

  // TODO Implement
  private static async manyToMany(data: any, relation: RelationContract): Promise<any> {
    return data
  }

  static async run(model: any | any[], relations: RelationContract[]) {
    const includedRelations = ModelFactory.getIncludedRelations(relations)

    for (const includedRelation of includedRelations) {
      model = await this.verifyModelType(model, includedRelation)
    }

    return model
  }
}

