/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ObjectID } from 'bson'
import { UserModel } from './UserModel'
import { Model } from '../../../src/Model'
import { Column } from '../../../src/Decorators/Column'
import { ManyToMany } from '../../../src/Decorators/ManyToMany'

export class Role extends Model {
  static connection = 'mongo'
  static primaryKey = 'id'

  @Column({ columnName: '_id' })
  public id: ObjectID

  @Column()
  public name: string

  @Column()
  public description: string

  @Column({ isCreatedAt: true })
  public createdAt: Date

  @Column({ isUpdatedAt: true })
  public updatedAt: Date

  @ManyToMany(() => UserModel, { pivotTableName: 'users_roles' })
  public users: UserModel[]
}
