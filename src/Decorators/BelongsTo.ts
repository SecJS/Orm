/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Model } from '../Model'
import { BelongsToOptions } from '../Contracts/BelongsToOptions'
import { RelationContractGenerator } from '../Utils/RelationContractGenerator'

/**
 * Define BelongsTo relationship
 */
export function BelongsTo(
  relationModel: () => typeof Model,
  options?: BelongsToOptions,
): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    const Model = target.constructor

    Model.boot()

    const relation = new RelationContractGenerator()
      .setModel(Model)
      .setRelationModel(relationModel)
      .belongsTo(String(propertyKey), options)

    Model.addRelation(relation)
  }
}
