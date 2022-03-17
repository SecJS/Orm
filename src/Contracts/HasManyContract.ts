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

export interface HasManyContract {
  model?: () => typeof Model
  primaryKey?: string
  foreignKey?: string
  isIncluded?: boolean
  propertyName?: string
  relationType?: RelationENUM.HAS_MANY
}
