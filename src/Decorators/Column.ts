/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ColumnOptions } from '../Contracts/ColumnOptions'

/**
 * Define database Column
 */
export function Column(options?: ColumnOptions): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    const Model = target.constructor

    options = Object.assign(
      {},
      {
        isPrimary: false,
        columnName: propertyKey,
        defaultValue: null,
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
