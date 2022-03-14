/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import 'reflect-metadata'
import { Knex } from 'knex'
import { Product } from './stubs/Models/Product'
import { ProductDetail } from './stubs/Models/ProductDetail'
import { DatabaseConnection } from '../src/DatabaseConnection'

describe('\n Model Class', () => {
  let databaseConnection: DatabaseConnection

  beforeEach(async () => {
    databaseConnection = new DatabaseConnection()

    await databaseConnection.connection('default')

    await databaseConnection.getDb().createTable('users', (tableBuilder: Knex.TableBuilder) => {
      tableBuilder.increments('id').primary()
      tableBuilder.string('name').nullable()
      tableBuilder.string('email').nullable()
      tableBuilder.timestamps(true, true, true)
    })

    await databaseConnection.getDb().createTable('products', (tableBuilder: Knex.TableBuilder) => {
      tableBuilder.increments('id').primary()
      tableBuilder.string('name').nullable()
      tableBuilder.integer('quantity').nullable().defaultTo(0)
      tableBuilder.timestamps(true, true, true)
      tableBuilder.integer('userId').references('id').inTable('users')
    })

    const userId = await databaseConnection
      .getDb()
      .buildTable('users')
      .insert({ name: 'Victor', email: 'txsoura@gmail.com' })

    const ids = await databaseConnection.getDb().buildTable('products').insert([
      {
        name: 'iPhone 10',
        quantity: 10,
        userId: userId[0]
      },
      {
        name: 'iPhone 10',
        quantity: 10,
        userId: userId[0]
      },
      {
        name: 'iPhone 10',
        quantity: 10,
        userId: userId[0]
      },
    ])

    await databaseConnection.getDb().createTable('product_details', (tableBuilder: Knex.TableBuilder) => {
      tableBuilder.increments('id').primary()
      tableBuilder.string('detail').nullable()
      tableBuilder.timestamps(true, true, true)
      tableBuilder.integer('productId').references('id').inTable('products')
    })

    const promises = ids.map(id => databaseConnection
      .getDb()
      .buildTable('product_details')
      .insert([{ detail: '128 GB', productId: id }, { detail: 'Black', productId: id }])
    )

    await Promise.all(promises)
  })

  it('should return the data from Product model organized', async () => {
    const product = new Product()

    const models = await product
      .includes('user')
      .includes('productDetails')
      .findMany()

    models.forEach(model => console.log(model.toJSON()))

    const json = Product.toJSON()
    json.
  })

  afterEach(async () => {
    await databaseConnection.getDb().dropTable('product_details')
    await databaseConnection.getDb().dropTable('products')
    await databaseConnection.getDb().dropTable('users')

    await databaseConnection.getDb().close()
  })
})
