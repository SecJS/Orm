/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ObjectID } from 'bson'
import { ModelPropsRecord } from './ModelPropsRecord'

/**
 * Json from generic Type properties
 */
export type ModelPropsJson<Type> = RecursiveJson<ModelPropsRecord<Type>>

/**
 * Return the key type if extends string | boolean | number | Date.
 * Else will return again ModelPropsJson for key type
 */
export type RecursiveJson<Type> = {
  [Key in keyof Type]: Type[Key] extends
    | string
    | boolean
    | number
    | Date
    | ObjectID
    ? Type[Key]
    : ModelPropsJson<Type[Key]>
}
