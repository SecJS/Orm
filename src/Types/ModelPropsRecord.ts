/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { OmitModelMethods } from './OmitModelMethods'

/**
 * Object from generic Type properties
 */
export type ModelPropsRecord<Type> = Partial<OmitModelMethods<Type>>
