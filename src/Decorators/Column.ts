/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// TODO Implement
export interface ColumnOptions {
  isPrimary?: boolean
  columnName?: string
  // serialize?: any
  // serializeAs?: any
  // prepare?: (value: any) => void
  // consume?: (value: any) => void
}

/**
 * Define database column
 */
export function Column(options?: ColumnOptions): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    const Model = target.constructor

    options = Object.assign(
      {},
      {
        isPrimary: false,
        columnName: propertyKey,
      },
      options,
    )

    Model.boot()
    Model.addColumn(options)
  }
}
