/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Model } from '../Model'
import { String } from '@secjs/utils'
import { RelationENUM } from '../Enums/RelationENUM'
import { HasOneOptions } from '../Contracts/HasOneOptions'
import { HasManyOptions } from '../Contracts/HasManyOptions'
import { HasOneContract } from '../Contracts/HasOneContract'
import { HasManyContract } from '../Contracts/HasManyContract'
import { BelongsToOptions } from '../Contracts/BelongsToOptions'
import { ManyToManyOptions } from '../Contracts/ManyToManyOptions'
import { BelongsToContract } from '../Contracts/BelongsToContract'
import { ManyToManyContract } from '../Contracts/ManyToManyContract'

export class RelationContractGenerator {
  private Model: typeof Model
  private RelationModel: () => typeof Model

  setModel(model: typeof Model): this {
    this.Model = model

    return this
  }

  setRelationModel(relationModel: () => typeof Model): this {
    this.RelationModel = relationModel

    return this
  }

  hasOne(prop: string, opts: HasOneOptions): HasOneContract {
    const defaultValues: HasOneContract = {}

    defaultValues.isIncluded = false
    defaultValues.propertyName = prop
    defaultValues.model = this.RelationModel
    defaultValues.primaryKey = this.Model.primaryKey
    defaultValues.relationType = RelationENUM.HAS_ONE
    defaultValues.foreignKey = `${this.Model.name.toLowerCase()}Id`

    return Object.assign({}, defaultValues, opts)
  }

  hasMany(prop: string, opts: HasManyOptions): HasManyContract {
    const defaultValues: HasManyContract = {}

    defaultValues.isIncluded = false
    defaultValues.propertyName = prop
    defaultValues.model = this.RelationModel
    defaultValues.primaryKey = this.Model.primaryKey
    defaultValues.relationType = RelationENUM.HAS_MANY
    defaultValues.foreignKey = `${this.Model.name.toLowerCase()}Id`

    return Object.assign({}, defaultValues, opts)
  }

  belongsTo(prop: string, opts: BelongsToOptions): BelongsToContract {
    const defaultValues: BelongsToContract = {}

    defaultValues.isIncluded = false
    defaultValues.propertyName = prop
    defaultValues.model = this.RelationModel
    defaultValues.relationType = RelationENUM.BELONGS_TO
    defaultValues.primaryKey = this.Model.primaryKey
    defaultValues.foreignKey = `${prop}Id`

    return Object.assign({}, defaultValues, opts)
  }

  manyToMany(
    prop: string,
    opts: ManyToManyOptions,
    full = false,
  ): ManyToManyContract {
    const defaultValues: ManyToManyContract = {}

    defaultValues.isIncluded = false
    defaultValues.propertyName = prop
    defaultValues.model = this.RelationModel
    defaultValues.relationType = RelationENUM.MANY_TO_MANY

    // Many
    defaultValues.localPrimaryKey = this.Model.primaryKey
    defaultValues.pivotLocalForeignKey = `${String.singularize(
      this.Model.table,
    )}Id`

    if (full) {
      const RelationModel = this.RelationModel()

      // To
      defaultValues.pivotTableName = `${String.singularize(
        this.Model.table,
      )}_${String.singularize(RelationModel.table)}`

      // Many
      defaultValues.relationPrimaryKey = RelationModel.primaryKey
      defaultValues.pivotRelationForeignKey = `${String.singularize(
        RelationModel.table,
      )}Id`
    }

    return Object.assign({}, defaultValues, opts)
  }
}
