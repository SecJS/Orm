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
import { DatabaseConnection } from '../src/DatabaseConnection'

describe('\n Model Class', () => {
  let databaseConnection: DatabaseConnection

  beforeEach(async () => {
    databaseConnection = new DatabaseConnection()

    await databaseConnection.createConnection('default')

    await databaseConnection.getDatabase().createTable('users', (tableBuilder: Knex.TableBuilder) => {
      tableBuilder.increments('id').primary()
      tableBuilder.string('name').nullable()
      tableBuilder.string('email').nullable()
      tableBuilder.timestamps(true, true, true)
    })

    await databaseConnection.getDatabase().createTable('products', (tableBuilder: Knex.TableBuilder) => {
      tableBuilder.increments('id').primary()
      tableBuilder.string('name').nullable()
      tableBuilder.integer('quantity').nullable().defaultTo(0)
      tableBuilder.timestamps(true, true, true)
      tableBuilder.integer('userId').references('id').inTable('users')
    })

    const userId = await databaseConnection
      .getDatabase()
      .buildTable('users')
      .insert({ name: 'Victor', email: 'txsoura@gmail.com' })

    const ids = await databaseConnection
      .getDatabase()
      .buildTable('products')
      .insert([
        {
          name: 'iPhone 10',
          quantity: 10,
          userId: userId[0],
        },
        {
          name: 'iPhone 10',
          quantity: 10,
          userId: userId[0],
        },
        {
          name: 'iPhone 10',
          quantity: 10,
          userId: userId[0],
        },
      ])

    await databaseConnection.getDatabase().createTable('product_details', (tableBuilder: Knex.TableBuilder) => {
      tableBuilder.increments('id').primary()
      tableBuilder.string('detail').nullable()
      tableBuilder.timestamps(true, true, true)
      tableBuilder.integer('productId').references('id').inTable('products')
    })

    const promises = ids.map(id =>
      databaseConnection
        .getDatabase()
        .buildTable('product_details')
        .insert([
          { detail: '128 GB', productId: id },
          { detail: 'Black', productId: id },
        ]),
    )

    await Promise.all(promises)
  })

  it('should return the data from Product model with user and productDetails included', async () => {
    const product = new Product()

    const models = await product.includes('user').includes('productDetails').findMany()

    expect(models[0].id).toBe(1)
    expect(models[0].userModelId).toBe(1)
    expect(models[0].name).toBe('iPhone 10')
    expect(models[0].user.idPrimary).toBe(1)
    expect(models[0].user.name).toBe('Victor')
    expect(models[0].productDetails[0].id).toBe(1)
    expect(models[0].productDetails[0].detail).toBe('128 GB')
    expect(models[0].productDetails[0].productModelId).toBe(1)
    expect(models[0].productDetails[1].id).toBe(2)
    expect(models[0].productDetails[1].detail).toBe('Black')
    expect(models[0].productDetails[1].productModelId).toBe(1)
  })

  afterEach(async () => {
    await databaseConnection.getDatabase().dropTable('product_details')
    await databaseConnection.getDatabase().dropTable('products')
    await databaseConnection.getDatabase().dropTable('users')

    await databaseConnection.getDatabase().close()
  })
})
