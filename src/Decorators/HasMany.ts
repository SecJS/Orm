/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { RelationContract } from '../Contracts/RelationContract'

/**
 * Define HasMany relationship
 */
export function HasMany(model): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    const MainModel = target.constructor

    // Primary key will be defined inside addRelation method
    const relation: RelationContract = {
      model,
      isIncluded: false,
      relationType: 'hasMany',
      columnName: String(propertyKey),
      propertyName: String(propertyKey),
      foreignKey: `${MainModel.name.toLowerCase()}Id`
    }

    MainModel.boot()
    MainModel.addRelation(relation)
  }
}
