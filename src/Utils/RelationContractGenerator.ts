/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Model } from '../Model'
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
    defaultValues.primaryKey = `${prop}Id`
    defaultValues.foreignKey = this.Model.primaryKey

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
    defaultValues.pivotLocalForeignKey = `${this.Model.table}_id`

    if (full) {
      const RelationModel = this.RelationModel()

      // To
      defaultValues.pivotTableName = `${this.Model.table}_${RelationModel.table}`

      // Many
      defaultValues.relationPrimaryKey = RelationModel.primaryKey
      defaultValues.pivotRelationForeignKey = `${RelationModel.table}_id`
    }

    return Object.assign({}, defaultValues, opts)
  }
}
