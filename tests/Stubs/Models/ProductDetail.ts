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
import { BelongsTo } from '../../../src/Decorators/BelongsTo'

export class ProductDetail extends Model {
  @Column()
  public id: number

  @Column()
  public detail: string

  @Column({ isCreatedAt: true })
  public createdAt: Date

  @Column({ isUpdatedAt: true })
  public updatedAt: Date

  @Column({ isDeletedAt: true })
  public deletedAt: Date

  @Column({ columnName: 'productId' })
  public productModelId: number

  @BelongsTo(() => Product)
  public product: Product
}
