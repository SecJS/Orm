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

  @BelongsTo(() => UserModel, { primaryKey: 'userModelId' })
  public user: UserModel

  @HasMany(() => ProductDetail)
  public productDetails: ProductDetail[]
}
