/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HasOneOptions } from '../Contracts/HasOneOptions'
import { HasManyOptions } from '../Contracts/HasManyOptions'
import { BelongsToOptions } from '../Contracts/BelongsToOptions'
import { ManyToManyOptions } from '../Contracts/ManyToManyOptions'

export type RelationOptionsTypes =
  | HasOneOptions
  | HasManyOptions
  | BelongsToOptions
  | ManyToManyOptions
