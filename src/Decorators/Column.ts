/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import 'reflect-metadata'
import { ColumnOptions } from '../Contracts/ColumnOptions'

/**
 * Define database Column
 */
export function Column(options?: ColumnOptions): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    const Model = target.constructor

    const type = Reflect.getMetadata('design:type', target, propertyKey)

    options = Object.assign(
      {},
      {
        isPrimary: false,
        columnName: propertyKey,
        defaultValue: null,
        propertyType: type,
        propertyName: String(propertyKey),
        isCreatedAt: false,
        isUpdatedAt: false,
        isDeletedAt: false,
      },
      options,
    )

    Model.boot()
    Model.addColumn(options)
  }
}
