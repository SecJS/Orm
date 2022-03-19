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
import { Database, DatabaseContract } from '@secjs/database'
import { HasOneContract } from '../Contracts/HasOneContract'
import { BelongsToContract } from '../Contracts/BelongsToContract'
import { ManyToManyContract } from '../Contracts/ManyToManyContract'
import { RelationContractTypes } from '../Types/RelationContractTypes'
import { RelationContractGenerator } from './RelationContractGenerator'
import { NotMappedColumnException } from '../Exceptions/NotMappedColumnException'

export class ModelGenerator {
  private DB: DatabaseContract

  constructor(connection: string) {
    this.DB = new Database().connection(connection)
  }

  async generate(flatData: any | any[], MainModel: typeof Model) {
    let model = this.flatDataToInstance(flatData, MainModel)
    const includedRelations = MainModel.getIncludedRelations()

    for (const includedRelation of includedRelations) {
      model = await this.includeRelation(model, includedRelation)
    }

    return model
  }

  flatDataToInstance(flatData: any | any[], MainModel: any) {
    const populateInstance = (data, instance) => {
      const SubClassModel = instance.class
      const columnDictionary = SubClassModel.columnDictionary

      Object.keys(data).forEach(key => {
        if (!columnDictionary[key]) {
          throw new NotMappedColumnException(key, SubClassModel.name)
        }

        instance[columnDictionary[key]] = data[key]
      })

      return instance
    }

    if (Is.Array(flatData)) {
      const models = []

      flatData.forEach(d => models.push(populateInstance(d, new MainModel())))

      return models
    }

    return populateInstance(flatData, new MainModel())
  }

  private async includeRelation(
    model: typeof Model | typeof Model[],
    relation: RelationContractTypes,
  ) {
    if (Is.Array(model)) {
      for (const d of model) {
        const index = model.indexOf(d)

        model[index] = await this[relation.relationType](d, relation as any)
      }

      return model
    }

    return this[relation.relationType](model, relation as any)
  }

  private async hasOne(
    model: typeof Model,
    relation: HasOneContract,
  ): Promise<typeof Model> {
    const Model = relation.model()
    const primaryKey = relation.primaryKey
    const foreignKey = relation.foreignKey
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

    model[propertyName] = null

    const flatRelationData = await this.DB.buildTable(Model.table)
      .buildWhere(foreignKey, model[primaryKey])
      .find()

    if (flatRelationData) {
      // @ts-ignore
      model[propertyName] = new Model()

      Object.keys(flatRelationData).forEach(key => {
        if (!columnDictionary[key]) {
          throw new NotMappedColumnException(key, Model.name)
        }

        model[propertyName][columnDictionary[key]] = flatRelationData[key]
      })
    }

    return model
  }

  private async hasMany(
    model: typeof Model,
    relation: HasOneContract,
  ): Promise<typeof Model> {
    const Model = relation.model()
    const foreignKey = relation.foreignKey
    const primaryKey = relation.primaryKey
    const propertyName = relation.propertyName
    const columnDictionary = Model.columnDictionary

    model[propertyName] = []

    const flatRelationsData = await this.DB.buildTable(Model.table)
      .buildWhere(foreignKey, model[primaryKey])
      .findMany()

    flatRelationsData.forEach(flatRelationData => {
      // @ts-ignore
      const modelRelation = new Model()

      Object.keys(flatRelationData).forEach(key => {
        if (!columnDictionary[key]) {
          throw new NotMappedColumnException(key, Model.name)
        }

        modelRelation[columnDictionary[key]] = flatRelationData[key]
      })

      model[propertyName].push(modelRelation)
    })

    return model
  }

  private async belongsTo(
    model: typeof Model,
    relation: BelongsToContract,
  ): Promise<typeof Model> {
    const Model = relation.model()
    const primaryKey = relation.primaryKey
    const foreignKey = relation.foreignKey
    const propertyName = relation.propertyName
    const columnDictionary = Model.columnDictionary

    model[propertyName] = null

    const flatRelationData = await this.DB.buildTable(Model.table)
      .buildWhere(primaryKey, model[foreignKey])
      .find()

    if (flatRelationData) {
      // @ts-ignore
      model[propertyName] = new Model()

      Object.keys(flatRelationData).forEach(key => {
        if (!columnDictionary[key]) {
          throw new NotMappedColumnException(key, Model.name)
        }

        model[propertyName][columnDictionary[key]] = flatRelationData[key]
      })
    }

    return model
  }

  private async manyToMany(
    model: typeof Model,
    relation: ManyToManyContract,
  ): Promise<typeof Model> {
    relation = new RelationContractGenerator()
      // @ts-ignore
      .setModel(model.class)
      .setRelationModel(relation.model)
      .manyToMany(relation.propertyName, relation, true)

    const Model = relation.model()
    const propertyName = relation.propertyName
    const pivotTableName = relation.pivotTableName
    const relationPrimaryKey = relation.relationPrimaryKey
    const pivotRelationForeignKey = relation.pivotRelationForeignKey
    const columnDictionary = Model.columnDictionary

    model[propertyName] = []

    const pivotTableData = await this.DB.buildTable(pivotTableName)
      .buildWhere(
        relation.pivotLocalForeignKey,
        model[relation.localPrimaryKey],
      )
      .findMany()

    // @ts-ignore
    model.$extras = pivotTableData

    const relationIds = pivotTableData.map(
      data => data[pivotRelationForeignKey],
    )

    const flatRelationsData = await this.DB.buildTable(Model.table)
      .buildWhereIn(relationPrimaryKey, relationIds)
      .findMany()

    flatRelationsData.forEach(flatRelationData => {
      // @ts-ignore
      const modelRelation = new Model()

      Object.keys(flatRelationData).forEach(key => {
        if (!columnDictionary[key]) {
          throw new NotMappedColumnException(key, Model.name)
        }

        modelRelation[columnDictionary[key]] = flatRelationData[key]
      })

      model[propertyName].push(modelRelation)
    })

    return model
  }
}
