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
import { ProductDetail } from './ProductDetail'
import { Column } from '../../../src/Decorators/Column'
import { HasMany } from '../../../src/Decorators/HasMany'
import { BelongsTo } from '../../../src/Decorators/BelongsTo'

export class Product extends Model {
  static connection = 'mongo'
  static primaryKey = 'id'
  static persistOnly = ['name', 'userModelId']

  @Column({ columnName: '_id' })
  public id: ObjectID

  @Column()
  public name: string

  @Column({ defaultValue: 5 })
  public quantity: number

  @Column({ isCreatedAt: true })
  public createdAt: Date

  @Column({ isUpdatedAt: true })
  public updatedAt: Date

  @Column({ columnName: 'userId' })
  public userModelId: ObjectID

  @BelongsTo(() => UserModel, { foreignKey: 'userModelId' })
  public user: UserModel

  @HasMany(() => ProductDetail, { primaryKey: 'id', foreignKey: 'productModelId' })
  public productDetails: ProductDetail[]

  static async definition() {
    return {
      name: this.faker.name.firstName(),
      quantity: this.faker.datatype.number(),
      userModelId: UserModel.factory('idPrimary'),
    }
  }
}
