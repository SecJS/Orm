/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Model } from '../Model'

export interface RelationContract {
  model?: () => typeof Model
  primaryKey?: string
  foreignKey?: string
  relationType?: string
  isIncluded?: boolean
  propertyName?: string
}
