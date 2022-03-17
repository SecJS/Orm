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
 * Define database column
 */
// TODO Criar decorator CreatedAtColumn, UpdatedAtColumn e DeletedAtColumn.
// Eles terão o mesmo comportamento de column porem vão definir
// valores padrões no create, update e delete da model
export function Column(options?: ColumnOptions): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    const Model = target.constructor

    options = Object.assign(
      {},
      {
        isPrimary: false,
        columnName: propertyKey,
        propertyName: String(propertyKey),
      },
      options,
    )

    Model.boot()
    Model.addColumn(options)
  }
}
