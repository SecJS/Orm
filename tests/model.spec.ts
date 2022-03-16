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
import { Database, DatabaseContract } from '@secjs/database'

describe('\n Model Class', () => {
  let DB: DatabaseContract

  beforeAll(async () => {
    await Database.openConnections('postgres')

    DB = new Database().connection('postgres')
  })

  beforeEach(async () => {
    await DB.createTable('users', (tableBuilder: Knex.TableBuilder) => {
      tableBuilder.increments('id').primary()
      tableBuilder.string('name').nullable()
      tableBuilder.string('email').nullable()
      tableBuilder.timestamps(true, true, true)
    })

    await DB.createTable('products', (tableBuilder: Knex.TableBuilder) => {
      tableBuilder.increments('id').primary()
      tableBuilder.string('name').nullable()
      tableBuilder.integer('quantity').nullable().defaultTo(0)
      tableBuilder.timestamps(true, true, true)
      tableBuilder.integer('userId').references('id').inTable('users')
    })

    const userId = await DB.buildTable('users').insert({ name: 'Victor', email: 'txsoura@gmail.com' })

    const ids = await DB.buildTable('products').insert([
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

    await DB.createTable('product_details', (tableBuilder: Knex.TableBuilder) => {
      tableBuilder.increments('id').primary()
      tableBuilder.string('detail').nullable()
      tableBuilder.timestamps(true, true, true)
      tableBuilder.integer('productId').references('id').inTable('products')
    })

    const promises = ids.map(id =>
      DB.buildTable('product_details').insert([
        { detail: '128 GB', productId: id },
        { detail: 'Black', productId: id },
      ]),
    )

    await Promise.all(promises)
  })

  it('should return all data from Product model with user and productDetails included', async () => {
    const models = await Product.includes('user').includes('productDetails').findMany()

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

  it('should return one data from Product model with user and productDetails included', async () => {
    const product = await Product.includes('user').includes('productDetails').find()

    const productJson = product.toJSON()

    expect(productJson.id).toBe(1)
    expect(productJson.quantity).toBe(10)
    expect(productJson.name).toBe('iPhone 10')
    expect(productJson.user.idPrimary).toBe(1)
    expect(productJson.user.name).toBe('Victor')
    expect(productJson.user.email).toBe('txsoura@gmail.com')
    expect(productJson.productDetails[0].productModelId).toBe(1)
  })

  afterEach(async () => {
    await DB.dropTable('product_details')
    await DB.dropTable('products')
    await DB.dropTable('users')
  })

  afterAll(async () => {
    await Database.closeConnections('postgres')
  })
})
