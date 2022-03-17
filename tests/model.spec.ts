/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import 'reflect-metadata'
import { Product } from './Stubs/Models/Product'
import { UserModel } from './Stubs/Models/UserModel'
import { TestDataHandler } from './Utils/TestDataHandler'
import { Database, DatabaseContract } from '@secjs/database'
import { ProductDetail } from './Stubs/Models/ProductDetail'

describe('\n Model Class', () => {
  let DB: DatabaseContract

  beforeAll(async () => {
    await Database.openConnections('postgres')

    DB = new Database().connection('postgres')
  })

  beforeEach(async () => {
    TestDataHandler.setDB(DB)

    await TestDataHandler.createTables()
    await TestDataHandler.createData()
  })

  it('should be able to create a new product', async () => {
    const { idPrimary } = await UserModel.find()

    const product = await Product.create({
      name: 'Macbook Pro 2020',
      userModelId: idPrimary,
    })

    const productJson = product.toJSON()

    expect(productJson.user).toBeFalsy()
    expect(productJson.productDetails).toBeFalsy()
    expect(productJson.id).toBe(4)
    expect(productJson.quantity).toBe(5)
    expect(productJson.name).toBe('Macbook Pro 2020')
    expect(productJson.createdAt).toBeTruthy()
    expect(productJson.updatedAt).toBeTruthy()
  })

  it('should be able to update a product', async () => {
    const { idPrimary } = await UserModel.find()

    const { id } = await Product.create({
      name: 'Macbook Pro 2020',
      quantity: 10,
      userModelId: idPrimary,
    })

    const product = await Product.where('id', id).update({ name: 'Macbook Pro 2021' })

    const productJson = product.toJSON()

    expect(productJson.user).toBeFalsy()
    expect(productJson.productDetails).toBeFalsy()
    expect(productJson.id).toBe(4)
    expect(productJson.quantity).toBe(10)
    expect(productJson.name).toBe('Macbook Pro 2021')
    expect(productJson.createdAt).toBeTruthy()
    expect(productJson.updatedAt).toBeTruthy()
  })

  it('should be able to delete a product', async () => {
    const { idPrimary } = await UserModel.find()

    const { id } = await Product.create({
      name: 'Macbook Pro 2020',
      quantity: 10,
      userModelId: idPrimary,
    })

    const notSoftDeleted = await Product.where('id', id).delete()
    expect(notSoftDeleted).toBeFalsy()

    const deletedProduct = await Product.where('id', id).find()
    expect(deletedProduct).toBeFalsy()
  })

  it('should be able to soft delete a product detail', async () => {
    const { idPrimary } = await UserModel.find()

    const { id } = await Product.create({
      name: 'Macbook Pro 2020',
      quantity: 10,
      userModelId: idPrimary,
    })

    const productDetail = await ProductDetail.create({
      detail: 'M1',
      productModelId: id,
    })

    const softDeletedProduct = await ProductDetail.where({ id: productDetail.id }).delete()

    expect(softDeletedProduct).toBeTruthy()
    expect(softDeletedProduct.deletedAt).toBeTruthy()
  })

  it('should return all data from Product model with user and productDetails included', async () => {
    const models = await Product.includes('user').includes('productDetails').findMany()

    const firstModelJson = models[0].toJSON()

    expect(firstModelJson.id).toBe(1)
    expect(firstModelJson.userModelId).toBe(1)
    expect(firstModelJson.name).toBe('iPhone 10')
    expect(firstModelJson.user.idPrimary).toBe(1)
    expect(firstModelJson.user.name).toBe('Victor')
    expect(firstModelJson.productDetails[0].detail).toBe('128 GB')
    expect(firstModelJson.productDetails[0].productModelId).toBe(1)
    expect(firstModelJson.productDetails[1].detail).toBe('Black')
    expect(firstModelJson.productDetails[1].productModelId).toBe(1)
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

  it('should return all data from User model with roles included', async () => {
    const user = await UserModel.includes('roles').find()

    const userJson = user.toJSON()

    expect(userJson.idPrimary).toBe(1)
    expect(userJson.name).toBe('Victor')
    expect(userJson.roles[0].id).toBe(1)
    expect(userJson.roles[0].name).toBe('Admin')
    expect(userJson.roles[1].id).toBe(2)
    expect(userJson.roles[1].name).toBe('Owner')
    expect(userJson.$extras[0].id).toBe(1)
    expect(userJson.$extras[0].users_id).toBe(userJson.idPrimary)
    expect(userJson.$extras[0].roles_id).toBe(1)
  })

  it('should get all data from Product only where quantity is 10 and orderBy name', async () => {
    const products = await Product.where({ quantity: 10 }).orderBy('name', 'desc').findMany()

    expect(products.length).toBe(2)
    expect(products[0].name).toBe('iPhone 11')
  })

  afterEach(async () => {
    await TestDataHandler.dropTables()
  })

  afterAll(async () => {
    await Database.closeConnections('postgres')
  })
})
