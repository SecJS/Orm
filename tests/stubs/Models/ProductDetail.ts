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

export class ProductDetail extends Model {
  static table = 'product_details'

  id: number
  detail: string
  createdAt: Date
  updatedAt: Date
  productId: number
  product: Product
}
