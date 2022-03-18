/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export interface ColumnOptions {
  isPrimary?: boolean
  columnName?: string
  defaultValue?: any
  castTo?:
    | 'json'
    | 'array'
    | 'string'
    | 'float'
    | 'integer'
    | 'object'
    | 'boolean'
    | 'date'
    | 'dateTime'
    | 'timestamp'
  isCreatedAt?: boolean
  isUpdatedAt?: boolean
  isDeletedAt?: boolean
  // serialize?: any
  // serializeAs?: any
  // prepare?: (value: any) => void
  // consume?: (value: any) => void
}
