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
  serialize?: any
  serializeAs?: any
  prepare?: (value: any) => void
  consume?: (value: any) => void
}

/**
 * Define database column
 */
export const Column: PropertyDecorator = (options?: ColumnOptions) => {
  return (target, property: string) => {}
}
