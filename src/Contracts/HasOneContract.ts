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
import { ModelQueryBuilder } from '../Utils/ModelQueryBuilder'

export interface HasOneContract {
  model?: () => typeof Model
  callback?: (query: ModelQueryBuilder<any>) => Promise<void>
  primaryKey?: string
  foreignKey?: string
  isIncluded?: boolean
  propertyName?: string
  relationType?: RelationENUM.HAS_ONE
}
