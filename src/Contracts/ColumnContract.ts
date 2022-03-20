/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export interface ColumnContract {
  isPrimary?: boolean
  columnName?: string
  defaultValue?: any
  propertyType?: any
  propertyName?: string
  isCreatedAt?: boolean
  isUpdatedAt?: boolean
  isDeletedAt?: boolean
}
