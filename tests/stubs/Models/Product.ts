/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Model } from '../../../src/Model'
import { ProductDetail } from './ProductDetail'
import { Column } from '../../../src/Decorators/Column'

export class Product extends Model {
  protected table = 'products'
  protected connection = 'default'

  @Column()
  public id: number

  @Column()
  public name: string

  @Column()
  public createdAt: Date

  @Column()
  public updatedAt: Date

  @Column()
  public productDetails: ProductDetail[]
}
