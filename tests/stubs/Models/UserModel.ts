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
import { HasMany } from '../../../src/Decorators/HasMany'

export class UserModel extends Model {
  static table = 'users'
  static primaryKey = 'idPrimary'

  @Column({ columnName: 'id' })
  public idPrimary: number

  @Column()
  public name: string

  @Column()
  public email: string

  @Column()
  public createdAt: Date

  @Column()
  public updatedAt: Date

  @HasMany(() => Product)
  public products: Product[]
}
