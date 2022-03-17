/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Model } from '../Model'
import { HasManyOptions } from '../Contracts/HasManyOptions'
import { RelationContractGenerator } from '../Utils/RelationContractGenerator'

/**
 * Define HasMany relationship
 */
export function HasMany(
  relationModel: () => typeof Model,
  options?: HasManyOptions,
): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    const Model = target.constructor

    Model.boot()

    const relation = new RelationContractGenerator()
      .setModel(Model)
      .setRelationModel(relationModel)
      .hasMany(String(propertyKey), options)

    Model.addRelation(relation)
  }
}
