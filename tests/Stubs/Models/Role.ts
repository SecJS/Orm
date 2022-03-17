import { Column } from '../../../src/Decorators/Column'
import { ManyToMany } from '../../../src/Decorators/ManyToMany'
import { UserModel } from './UserModel'

/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { Model } from '../../../src/Model'

export class Role extends Model {
  @Column()
  public id: number

  @Column()
  public name: string

  @Column()
  public description: string

  @Column()
  public createdAt: Date

  @Column()
  public updatedAt: Date

  @ManyToMany(() => UserModel)
  public users: UserModel[]
}
