/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export interface RelationContract {
  model?: any
  primaryKey?: string
  foreignKey?: string
  columnName?: string
  relationType?: string
  isIncluded?: boolean
  propertyName?: string
}

