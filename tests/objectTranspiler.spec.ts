/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import 'reflect-metadata'
import { ObjectTranspiler } from '../src/Utils/ObjectTranspiler'
import { Product } from './stubs/Models/Product'

describe('\n ObjectTranspiler Class', () => {
  beforeEach(async () => {})

  it('should create a dictionary from the row to separate properties', async () => {
    const data = {
      'products.id': 1,
      'products.name': 'iPhone 10',
      'products.quantity': 10,
      'products.createdAt': new Date(),
      'products.updatedAt': new Date(),
      'product_details.id': 1,
      'product_details.detail': '128 GB',
      'product_details.createdAt': new Date(),
      'product_details.updatedAt': new Date(),
      'product_details.productId': 1
  }

    const dictionary = ObjectTranspiler.createDictionaryFromRow(data)

    expect(dictionary).toStrictEqual({
      'products.id': 'id',
      'products.name': 'name',
      'products.quantity': 'quantity',
      'products.createdAt': 'createdAt',
      'products.updatedAt': 'updatedAt',
      'product_details.id': 'id',
      'product_details.detail': 'detail',
      'product_details.createdAt': 'createdAt',
      'product_details.updatedAt': 'updatedAt',
      'product_details.productId': 'productId'
    })
  })

  it('should create a dictionary from the model to separate properties', async () => {
    const data = {
      'products.id': 1,
      'products.name': 'iPhone 10',
      'products.quantity': 10,
      'products.createdAt': new Date(),
      'products.updatedAt': new Date(),
      'product_details.id': 1,
      'product_details.detail': '128 GB',
      'product_details.createdAt': new Date(),
      'product_details.updatedAt': new Date(),
      'product_details.productId': 1
    }

    const dictionary = ObjectTranspiler.createDictionaryFromModel(new Product())

    expect(dictionary).toStrictEqual({
      'products.id': 'id',
      'products.name': 'name',
      'products.quantity': 'quantity',
      'products.createdAt': 'createdAt',
      'products.updatedAt': 'updatedAt',
      'product_details': {
        'product_details.id': 'id',
        'product_details.detail': 'detail',
        'product_details.createdAt': 'createdAt',
        'product_details.updatedAt': 'updatedAt',
        'product_details.productId': 'productId'
      }
    })
  })

  it('should transpile the flatData to Model class', async () => {
    const flatData = {
      'products.id': 1,
      'products.name': 'iPhone 10',
      'products.quantity': 10,
      'products.createdAt': new Date(),
      'products.updatedAt': new Date(),
      'product_details.id': 1,
      'product_details.detail': '128 GB',
      'product_details.createdAt': new Date(),
      'product_details.updatedAt': new Date(),
      'product_details.productId': 1
    }

    console.log(ObjectTranspiler.transpile(flatData, new Product()))
  })

  afterEach(async () => {})
})
