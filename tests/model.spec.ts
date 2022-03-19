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

    DB = new Database()
    TestDataHandler.setDB(DB)

    await TestDataHandler.createTables()
  })

  beforeEach(async () => {
    await TestDataHandler.createData()
  })

  it('should be able to create a new product', async () => {
    const { idPrimary } = await UserModel.find()

    const product = await Product.create({
      name: 'Macbook Pro 2020',
      quantity: 10,
      userModelId: idPrimary,
    })

    const productJson = product.toJSON()

    expect(productJson.user).toBeFalsy()
    expect(productJson.productDetails).toBeFalsy()
    expect(productJson.id).toBe(4)
    // Should be five because of persistOnly property and defaultValue
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

    const product = await Product.update({ id }, { name: 'Macbook Pro 2021', quantity: 11 })

    const productJson = product.toJSON()

    expect(productJson.user).toBeFalsy()
    expect(productJson.productDetails).toBeFalsy()
    expect(productJson.id).toBe(8)
    // Should be five because of persistOnly property and defaultValue
    expect(productJson.quantity).toBe(5)
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

    const notSoftDeleted = await Product.delete({ id })
    expect(notSoftDeleted).toBeFalsy()

    const deletedProduct = await Product.find({ id })
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

    const softDeletedProduct = await ProductDetail.delete({ id: productDetail.id })

    expect(softDeletedProduct).toBeTruthy()
    expect(softDeletedProduct.deletedAt).toBeTruthy()
  })

  it('should return all data from Product model with user and productDetails included', async () => {
    const models = await Product.query().includes('user').includes('productDetails').getMany()

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
    const product = await Product.query().includes('user').includes('productDetails').get()

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
    const user = await UserModel.query().includes('roles').get()

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
    const products = await Product.query().where({ quantity: 10 }).orderBy('name', 'desc').getMany()

    expect(products.length).toBe(16)
    expect(products[0].name).toBe('iPhone 11')
  })

  it('should be able to get Product paginated using skip and limit', async () => {
    const products = await Product.query().skip(0).limit(1).getMany()

    expect(products.length).toBe(1)
    expect(products[0].id).toBe(1)
    expect(products[0].name).toBe('iPhone 10')
  })

  it('should be able to get Product paginated using forPage', async () => {
    const products = await Product.forPage(0, 1)

    expect(products.length).toBe(1)
    expect(products[0].id).toBe(1)
    expect(products[0].name).toBe('iPhone 10')
  })

  it('should be able to get Product paginated with paginated response', async () => {
    const { meta, links, data } = await Product.paginate(0, 1, '/products')

    expect(meta.itemCount).toBe(1)
    expect(meta.totalItems).toBe(36)
    expect(meta.totalPages).toBe(36)
    expect(meta.currentPage).toBe(0)
    expect(meta.itemsPerPage).toBe(1)
    expect(links.first).toBe('/products?limit=1')
    expect(links.previous).toBe('/products?page=0&limit=1')
    expect(links.next).toBe('/products?page=1&limit=1')
    expect(links.last).toBe('/products?page=36&limit=1')
    expect(data.length).toBe(1)
    expect(data[0].id).toBe(1)
    expect(data[0].name).toBe('iPhone 10')
  })

  it('should be able to create custom method using the query builder inside the model', async () => {
    const user = await UserModel.getOneWithRoles(1)

    const userJson = user.toJSON()

    expect(userJson.idPrimary).toBe(1)
    expect(userJson.name).toBe('Victor')
    expect(userJson.email).toBe('txsoura@gmail.com')
    expect(userJson.createdAt).toBeFalsy()
    expect(userJson.updatedAt).toBeFalsy()
    expect(userJson.roles.length).toBe(2)
  })

  it('should be able to make definitions of products', async () => {
    const products = await Product.factory().count(10).make<Product[]>()
    const product = products[0]

    expect(products.length).toBe(10)
    expect(product.id).toBeTruthy()
    expect(product.name).toBeTruthy()
    expect(product.quantity).toBeTruthy()
    expect(product.userModelId).toBeTruthy()
    expect(product.createdAt).toBeTruthy()
    expect(product.updatedAt).toBeTruthy()

    // Check if is not a promise resolved object
    // @ts-ignore
    expect(product.userModelId instanceof Promise).toBeFalsy()
  })

  it('should be able to create definitions of products', async () => {
    const factory = Product.factory()

    expect(await factory.assertCount(45)).toBeTruthy()

    const products = await factory.count(10).create<Product[]>()
    const product = products[0]

    expect(products.length).toBe(10)
    expect(product.id).toBeTruthy()
    expect(product.name).toBeTruthy()
    expect(product.quantity).toBeTruthy()
    expect(product.userModelId).toBeTruthy()
    expect(product.createdAt).toBeTruthy()
    expect(product.updatedAt).toBeTruthy()

    // Check if is not a promise resolved object
    // @ts-ignore
    expect(product.userModelId instanceof Promise).toBeFalsy()

    expect(await factory.assertCount(55)).toBeTruthy()
    expect(await factory.assertHas({ id: product.id })).toBeTruthy()
    expect(await factory.assertMissing({ id: 9999 })).toBeTruthy()
  })

  afterAll(async () => {
    await TestDataHandler.dropTables()

    await Database.closeConnections('postgres')
  })
})
