/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Model } from '../Model'

export interface ManyToManyContract {
  model?: () => typeof Model
  isIncluded?: boolean
  propertyName?: string
  relationType?: 'manyToMany'
  localTableName?: string
  pivotTableName?: string
  localPrimaryKey?: string
  relationPrimaryKey?: string
  pivotLocalForeignKey?: string
  pivotRelationForeignKey?: string
}
