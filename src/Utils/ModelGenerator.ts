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
import { DatabaseContract } from '@secjs/database'
import { ModelQueryBuilder } from './ModelQueryBuilder'
import { HasOneContract } from '../Contracts/HasOneContract'
import { BelongsToContract } from '../Contracts/BelongsToContract'
import { ManyToManyContract } from '../Contracts/ManyToManyContract'
import { RelationContractTypes } from '../Types/RelationContractTypes'
import { RelationContractGenerator } from './RelationContractGenerator'
import { NotMappedColumnException } from '../Exceptions/NotMappedColumnException'

export class ModelGenerator {
  private readonly DB: DatabaseContract
  private readonly Model: typeof Model

  constructor(model: typeof Model, DB: DatabaseContract) {
    this.DB = DB
    this.Model = model
  }

  async generate(flatData: any | any[]) {
    let model = this.flatDataToInstance(flatData)
    const includedRelations = this.Model.getIncludedRelations()

    for (const includedRelation of includedRelations) {
      model = await this.includeRelation(model, includedRelation)
    }

    return model
  }

  flatDataToInstance(flatData: any | any[]) {
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

      // @ts-ignore
      flatData.forEach(d => models.push(populateInstance(d, new this.Model())))

      return models
    }

    // @ts-ignore
    return populateInstance(flatData, new this.Model())
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
    const RelationModel = relation.model()
    const primaryKey = relation.primaryKey
    const foreignKey = relation.foreignKey
    const propertyName = relation.propertyName
    const query = new ModelQueryBuilder(RelationModel, this.DB)

    // Execute client callback if it exists
    if (relation.callback) await relation.callback(query)

    model[propertyName] = await query.where(foreignKey, model[primaryKey]).get()

    return model
  }

  private async hasMany(
    model: typeof Model,
    relation: HasOneContract,
  ): Promise<typeof Model> {
    const RelationModel = relation.model()
    const primaryKey = relation.primaryKey
    const foreignKey = relation.foreignKey
    const propertyName = relation.propertyName
    const query = new ModelQueryBuilder(RelationModel, this.DB)

    // Execute client callback if it exists
    if (relation.callback) await relation.callback(query)

    model[propertyName] = await query
      .where(foreignKey, model[primaryKey])
      .getMany()

    return model
  }

  private async belongsTo(
    model: typeof Model,
    relation: BelongsToContract,
  ): Promise<typeof Model> {
    const RelationModel = relation.model()
    const primaryKey = relation.primaryKey
    const foreignKey = relation.foreignKey
    const propertyName = relation.propertyName
    const query = new ModelQueryBuilder(RelationModel, this.DB)

    // Execute client callback if it exists
    if (relation.callback) await relation.callback(query)

    model[propertyName] = await query.where(primaryKey, model[foreignKey]).get()

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

    const RelationModel = relation.model()
    const propertyName = relation.propertyName
    const pivotTableName = relation.pivotTableName
    const relationPrimaryKey = relation.relationPrimaryKey
    const pivotRelationForeignKey = relation.pivotRelationForeignKey
    const localPrimaryKey = relation.localPrimaryKey
    const pivotLocalForeignKey = relation.pivotLocalForeignKey
    const query = new ModelQueryBuilder(RelationModel, this.DB)

    // Using DB here because there is no PivotModel
    const pivotTableData = await this.DB.buildTable(pivotTableName)
      .buildWhere(pivotLocalForeignKey, model[localPrimaryKey])
      .findMany()

    // @ts-ignore
    model.$extras = pivotTableData

    const relationIds = pivotTableData.map(d => d[pivotRelationForeignKey])

    // Set DB table to RelationModel again
    this.DB.buildTable(RelationModel.table)

    // Execute client callback if it exists
    if (relation.callback) await relation.callback(query)

    model[propertyName] = await query
      // @ts-ignore
      .whereIn(relationPrimaryKey, relationIds)
      .getMany()

    return model
  }
}
