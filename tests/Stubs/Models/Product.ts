/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { UserModel } from './UserModel'
import { Model } from '../../../src/Model'
import { ProductDetail } from './ProductDetail'
import { Column } from '../../../src/Decorators/Column'
import { HasMany } from '../../../src/Decorators/HasMany'
import { BelongsTo } from '../../../src/Decorators/BelongsTo'

export class Product extends Model {
  static persistOnly = ['name', 'userModelId']

  @Column()
  public id: number

  @Column()
  public name: string

  @Column({ defaultValue: 5 })
  public quantity: number

  @Column({ isCreatedAt: true })
  public createdAt: Date

  @Column({ isUpdatedAt: true })
  public updatedAt: Date

  @Column({ columnName: 'userId' })
  public userModelId: number

  @BelongsTo(() => UserModel, { foreignKey: 'userModelId' })
  public user: UserModel

  @HasMany(() => ProductDetail)
  public productDetails: ProductDetail[]

  static async definition() {
    return {
      name: this.faker.name.firstName(),
      quantity: this.faker.datatype.number(),
      userModelId: UserModel.factory('idPrimary'),
    }
  }
}
