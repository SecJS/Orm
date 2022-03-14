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

  @Column()
  public quantity: string

  @Column()
  public createdAt: Date

  @Column()
  public updatedAt: Date

  @Column()
  public userId: number

  @BelongsTo(() => UserModel)
  public user: UserModel

  @HasMany(() => ProductDetail)
  public productDetails: ProductDetail[]
}
