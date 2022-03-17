/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Model } from '../Model'
import { ManyToManyOptions } from '../Contracts/ManyToManyOptions'
import { ManyToManyContract } from '../Contracts/ManyToManyContract'

/**
 * Define ManyToMany relationship
 */
export function ManyToMany(
  model: () => typeof Model,
  options?: ManyToManyOptions,
): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    const MainModel = target.constructor

    /**
     * Default local primary key and foreign key will be defined inside
     * addRelation method if it does not exist in options.
     */
    const relation: ManyToManyContract = Object.assign(
      {},
      {
        model,
        isIncluded: false,
        relationType: 'manyToMany' as any,
        propertyName: String(propertyKey),
      },
      options,
    )

    MainModel.boot()
    MainModel.addRelation(relation)
  }
}
