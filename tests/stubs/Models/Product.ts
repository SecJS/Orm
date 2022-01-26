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

export class Product extends Model {
  static table = 'products'

  id: number
  name: string
  createdAt: Date
  updatedAt: Date
  productDetails: ProductDetail[]
}
