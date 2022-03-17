/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Model } from '../Model'
import { HasOneOptions } from '../Contracts/HasOneOptions'
import { RelationContractGenerator } from '../Utils/RelationContractGenerator'

/**
 * Define HasOne relationship
 */
export function HasOne(
  relationModel: () => typeof Model,
  options?: HasOneOptions,
): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    const Model = target.constructor

    Model.boot()

    const relation = new RelationContractGenerator()
      .setModel(Model)
      .setRelationModel(relationModel)
      .hasOne(String(propertyKey), options)

    Model.addRelation(relation)
  }
}
