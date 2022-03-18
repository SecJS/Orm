/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Role } from './Role'
import { Product } from './Product'
import { Model } from '../../../src/Model'
import { Column } from '../../../src/Decorators/Column'
import { HasMany } from '../../../src/Decorators/HasMany'
import { ManyToMany } from '../../../src/Decorators/ManyToMany'

export class UserModel extends Model {
  static table = 'users'
  static connection = 'default'
  static primaryKey = 'idPrimary'

  @Column({ columnName: 'id' })
  public idPrimary: number

  @Column()
  public name: string

  @Column()
  public email: string

  @Column({ isCreatedAt: true })
  public createdAt: Date

  @Column({ isUpdatedAt: true })
  public updatedAt: Date

  @HasMany(() => Product)
  public products: Product[]

  @ManyToMany(() => Role)
  public roles: Role[]

  static async getOneWithRoles(id: number) {
    return this.query()
      .where('idPrimary', id)
      .select('idPrimary', 'name', 'email')
      .orderBy('name', 'ASC')
      .includes('roles')
      .get()
  }
}
