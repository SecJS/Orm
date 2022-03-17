/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Knex } from 'knex'
import { DatabaseContract } from '@secjs/database'

export class TestDataHandler {
  static DB: DatabaseContract

  static setDB(DB: DatabaseContract): typeof TestDataHandler {
    TestDataHandler.DB = DB

    return this
  }

  static async dropTables() {
    await TestDataHandler.DB.dropTable('product_details')
    await TestDataHandler.DB.dropTable('users_roles')
    await TestDataHandler.DB.dropTable('products')
    await TestDataHandler.DB.dropTable('roles')
    await TestDataHandler.DB.dropTable('users')
  }

  static async createTables() {
    await TestDataHandler.DB.createTable('users', (tableBuilder: Knex.TableBuilder) => {
      tableBuilder.increments('id').primary()
      tableBuilder.string('name').nullable()
      tableBuilder.string('email').nullable()
      tableBuilder.timestamps(true, true, true)
    })

    await TestDataHandler.DB.createTable('roles', (tableBuilder: Knex.TableBuilder) => {
      tableBuilder.increments('id').primary()
      tableBuilder.string('name').nullable()
      tableBuilder.string('description').nullable()
      tableBuilder.timestamps(true, true, true)
    })

    await TestDataHandler.DB.createTable('users_roles', (tableBuilder: Knex.TableBuilder) => {
      tableBuilder.increments('id').primary()
      tableBuilder.integer('users_id').unsigned().references('id').inTable('users')
      tableBuilder.integer('roles_id').unsigned().references('id').inTable('roles')
    })

    await TestDataHandler.DB.createTable('products', (tableBuilder: Knex.TableBuilder) => {
      tableBuilder.increments('id').primary()
      tableBuilder.string('name').nullable()
      tableBuilder.integer('quantity').nullable().defaultTo(0)
      tableBuilder.timestamps(true, true, true)
      tableBuilder.integer('userId').references('id').inTable('users')
    })

    await TestDataHandler.DB.createTable('product_details', (tableBuilder: Knex.TableBuilder) => {
      tableBuilder.increments('id').primary()
      tableBuilder.string('detail').nullable()
      tableBuilder.timestamps(true, true, true)
      tableBuilder.timestamp('deletedAt')
      tableBuilder.integer('productId').references('id').inTable('products')
    })
  }

  static async createData() {
    const [userId] = await TestDataHandler.DB.buildTable('users').insert({ name: 'Victor', email: 'txsoura@gmail.com' })

    const [roleId1, roleId2] = await TestDataHandler.DB.buildTable('roles').insert([
      {
        name: 'Admin',
        description: 'Server Admin',
      },
      { name: 'Owner', description: 'Server Owner' },
    ])

    await TestDataHandler.DB.buildTable('users_roles').insert([
      { users_id: userId, roles_id: roleId1 },
      {
        users_id: userId,
        roles_id: roleId2,
      },
    ])

    const ids = await TestDataHandler.DB.buildTable('products').insert([
      {
        name: 'iPhone 10',
        quantity: 10,
        userId: userId,
      },
      {
        name: 'iPhone 11',
        quantity: 10,
        userId: userId,
      },
      {
        name: 'iPhone 12',
        quantity: 11,
        userId: userId,
      },
    ])

    const promises = ids.map(id =>
      TestDataHandler.DB.buildTable('product_details').insert([
        { detail: '128 GB', productId: id },
        { detail: 'Black', productId: id },
      ]),
    )

    await Promise.all(promises)
  }
}
