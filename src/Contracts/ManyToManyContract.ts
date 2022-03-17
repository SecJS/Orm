/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Model } from '../Model'
import { RelationENUM } from '../Enums/RelationENUM'

export interface ManyToManyContract {
  model?: () => typeof Model
  isIncluded?: boolean
  propertyName?: string
  relationType?: RelationENUM.MANY_TO_MANY
  localTableName?: string
  pivotTableName?: string
  localPrimaryKey?: string
  relationPrimaryKey?: string
  pivotLocalForeignKey?: string
  pivotRelationForeignKey?: string
}