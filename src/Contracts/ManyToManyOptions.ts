/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export interface ManyToManyOptions {
  pivotTableName?: string
  localPrimaryKey?: string
  relationPrimaryKey?: string
  pivotLocalForeignKey?: string
  pivotRelationForeignKey?: string
}
