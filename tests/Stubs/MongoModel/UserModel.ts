/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ObjectID } from 'bson'
import { Role } from './Role'
import { Product } from './Product'
import { Model } from '../../../src/Model'
import { Column } from '../../../src/Decorators/Column'
import { HasMany } from '../../../src/Decorators/HasMany'
import { ManyToMany } from '../../../src/Decorators/ManyToMany'

export class UserModel extends Model {
  static table = 'users'
  static connection = 'mongo'
  static primaryKey = 'idPrimary'

  @Column({ columnName: '_id' })
  public idPrimary: ObjectID

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

  static async getOneWithRoles(id: ObjectID) {
    return this.query()
      .where('idPrimary', id)
      .select('idPrimary', 'name', 'email')
      .orderBy('name', 'ASC')
      .includes('roles')
      .get()
  }

  static async definition() {
    return {
      name: this.faker.name.firstName(),
      email: this.faker.internet.email(),
    }
  }
}
