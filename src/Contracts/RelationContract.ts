/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Model } from '../Model'

// TODO Create an RelationContract and RelationOptions for each relation type
export interface RelationContract {
  model?: () => typeof Model
  primaryKey?: string
  foreignKey?: string
  isIncluded?: boolean
  propertyName?: string
  relationType?: 'hasOne' | 'hasMany' | 'belongsTo'
}
