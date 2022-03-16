/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Model } from '../Model'
import { Is } from '@secjs/utils'
import { InternalServerException } from '@secjs/exceptions'
import { Database, DatabaseContract } from '@secjs/database'
import { RelationContract } from '../Contracts/RelationContract'

export class ModelFactory {
  private DB: DatabaseContract

  constructor(connection: string) {
    this.DB = new Database().connection(connection)
  }

  private static getIncludedRelations(relations: RelationContract[]) {
    if (!relations || !relations.length) return []

    return relations.reduce(
      (includedRelations: RelationContract[], previous: RelationContract) => {
        if (previous.isIncluded) includedRelations.push(previous)

        return includedRelations
      },
      [],
    )
  }

  fabricateJson(model: any) {
    const json: any = {}

    model.class.columns.forEach(
      column => (json[column.propertyName] = model[column.propertyName]),
    )

    ModelFactory.getIncludedRelations(model.class.relations).forEach(
      relation => {
        if (['belongsTo', 'hasOne'].includes(relation.relationType)) {
          if (!model[relation.propertyName]) return

          json[relation.propertyName] = model[relation.propertyName].toJSON()

          return
        }

        json[relation.propertyName] = []

        model[relation.propertyName].forEach(relationData => {
          if (!relationData) return

          json[relation.propertyName].push(relationData.toJSON())
        })
      },
    )

    return json
  }

  fabricateInstance(flatData: any | any[], model: any) {
    const setDataInInstance = (data, instance) => {
      Object.keys(data).forEach(key => {
        if (!instance.class.columnDictionary[key]) {
          throw new InternalServerException(
            `The field ${key} has not been mapped in some of your @Column annotation in ${instance.class.name} Model`,
          )
        }

        instance[instance.class.columnDictionary[key]] = data[key]
      })

      return instance
    }

    if (Is.Array(flatData)) {
      const modelData = []

      flatData.forEach(data =>
        modelData.push(setDataInInstance(data, new model())),
      )

      return modelData
    }

    return setDataInInstance(flatData, new model())
  }

  async fabricate(flatData: any | any[], model: typeof Model) {
    let modelData = this.fabricateInstance(flatData, model)
    const includedRelations = ModelFactory.getIncludedRelations(model.relations)

    for (const includedRelation of includedRelations) {
      modelData = await this.verifyModelType(modelData, includedRelation)
    }

    return modelData
  }

  private async verifyModelType(data: any | any[], relation: RelationContract) {
    if (Is.Array(data)) {
      for (const d of data) {
        const index = data.indexOf(d)

        data[index] = await this[relation.relationType](d, relation)
      }

      return data
    }

    return this[relation.relationType](data, relation)
  }

  private async hasOne(data: any, relation: RelationContract): Promise<any> {
    const Model = relation.model()
    const foreignKey = relation.foreignKey
    const primaryKey = relation.primaryKey
    const propertyName = relation.propertyName
    const columnDictionary = Model.columnDictionary

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

    const modelData = await this.DB.buildTable(Model.table)
      .buildWhere(foreignKey, data[primaryKey])
      .find()

    if (modelData) {
      // @ts-ignore
      data[propertyName] = new Model()

      Object.keys(modelData).forEach(key => {
        if (!columnDictionary[key]) {
          throw new InternalServerException(
            `The field ${key} has not been mapped in some of your @Column annotation in ${Model.name} Model`,
          )
        }

        data[propertyName][columnDictionary[key]] = modelData[key]
      })
    }

    return data
  }

  private async hasMany(data: any, relation: RelationContract): Promise<any> {
    const Model = relation.model()
    const foreignKey = relation.foreignKey
    const primaryKey = relation.primaryKey
    const propertyName = relation.propertyName
    const columnDictionary = Model.columnDictionary

    data[propertyName] = []

    const modelsData = await this.DB.buildTable(Model.table)
      .buildWhere(foreignKey, data[primaryKey])
      .findMany()

    modelsData.forEach(modelData => {
      // @ts-ignore
      const modelRelation = new Model()

      Object.keys(modelData).forEach(key => {
        if (!columnDictionary[key]) {
          throw new InternalServerException(
            `The field ${key} has not been mapped in some of your @Column annotation in ${Model.name} Model`,
          )
        }

        modelRelation[columnDictionary[key]] = modelData[key]
      })

      data[propertyName].push(modelRelation)
    })

    return data
  }

  private async belongsTo(data: any, relation: RelationContract): Promise<any> {
    return this.hasOne(data, relation)
  }

  // TODO Implement
  private async manyToMany(
    data: any,
    relation: RelationContract,
  ): Promise<any> {
    return data
  }
}
