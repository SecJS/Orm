/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Product } from './Product'
import { Model } from '../../../src/Model'
import { Column } from '../../../src/Decorators/Column'
import { HasOne } from '../../../src/Decorators/HasOne'

export class User extends Model {
  static table = 'users'

  @Column()
  public id: number

  @Column()
  public name: string

  @Column()
  public email: string

  @Column()
  public createdAt: Date

  @Column()
  public updatedAt: Date

  @HasOne(Product)
  public product: Product
}


