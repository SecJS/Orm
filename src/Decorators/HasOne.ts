/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Model } from '../Model'
import { RelationOptions } from '../Contracts/RelationOptions'
import { RelationContract } from '../Contracts/RelationContract'

/**
 * Define HasOne relationship
 */
export function HasOne(model: () => typeof Model, options?: RelationOptions): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    const MainModel = target.constructor

    /**
     * Default primary key will be defined inside addRelation method
     * if it does not exist in options.
     */
    const relation: RelationContract = Object.assign(
      {},
      {
        model,
        isIncluded: false,
        relationType: 'hasOne',
        propertyName: String(propertyKey),
        foreignKey: `${MainModel.name.toLowerCase()}Id`,
      },
      options,
    )

    MainModel.boot()
    MainModel.addRelation(relation)
  }
}
