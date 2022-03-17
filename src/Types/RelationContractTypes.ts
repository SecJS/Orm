/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HasOneContract } from '../Contracts/HasOneContract'
import { HasManyContract } from '../Contracts/HasManyContract'
import { BelongsToContract } from '../Contracts/BelongsToContract'
import { ManyToManyContract } from '../Contracts/ManyToManyContract'

export type RelationContractTypes =
  | HasOneContract
  | HasManyContract
  | BelongsToContract
  | ManyToManyContract
