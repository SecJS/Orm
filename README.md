# Orm ⏹️

> Handle your application models in Node.js. Built on top of @secjs/database

[![GitHub followers](https://img.shields.io/github/followers/jlenon7.svg?style=social&label=Follow&maxAge=2592000)](https://github.com/jlenon7?tab=followers)
[![GitHub stars](https://img.shields.io/github/stars/secjs/orm.svg?style=social&label=Star&maxAge=2592000)](https://github.com/secjs/orm/stargazers/)

<p>
    <a href="https://www.buymeacoffee.com/secjs" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>
</p>

<p>
  <img alt="GitHub language count" src="https://img.shields.io/github/languages/count/secjs/orm?style=for-the-badge&logo=appveyor">

  <img alt="Repository size" src="https://img.shields.io/github/repo-size/secjs/orm?style=for-the-badge&logo=appveyor">

  <img alt="License" src="https://img.shields.io/badge/license-MIT-brightgreen?style=for-the-badge&logo=appveyor">

  <img alt="Commitizen" src="https://img.shields.io/badge/commitizen-friendly-brightgreen?style=for-the-badge&logo=appveyor">
</p>

<img src=".github/magic-cube.png" width="200px" align="right" hspace="30px" vspace="100px">

## Installation

> To use the high potential from this package you need to install first this other packages from SecJS,
> it keeps as dev dependency because one day `@secjs/core` will install everything once.

```bash
npm install @secjs/env @secjs/utils @secjs/exceptions
```

> Then you can install the package using:

```bash
npm install @secjs/orm
```

## Usage

### Configuring @secjs/database

> To use @secjs/orm you need to set up @secjs/database first and connect it to Database.

[Go to @secjs/database documentation](https://github.com/SecJS/Database#readme)

### Model

> With config/database file configured and Database connection opened you can start using Model class

#### Setting up your Model

> First you need to create your model class extending Model class and use decorators to map your columns

```ts
import { Model, Column } from '@secjs/orm'

export class Product extends Model {
  /**
   * Defines the table name in database. Default is the
   * name of your model in snake_case and plural format
   */
  static table = 'products'

  /**
   * Defines the connection that this Model will use
   * to handle the database operations. This string will be used
   * in Database.connection method from @secjs/database.
   * Default is default
   */
  static connection = 'default'

  /**
   * Defines the primary key of the Model. You will always
   * set the value in Model and not the database columName.
   * Example: primaryKey will be idName and not id!
   * Default value is id
   */
  static primaryKey = 'idName'

  /**
   * Defines the values that are authorized to be persisted
   * in database. Example: if you try to create/update the
   * createdAt column, it will not be created/updated if it's
   * not present in persistOnly array. Default is ['*']
   */
  static persistOnly = ['name', 'description']

  /**
   * The columnName option defines that idName === id in database.
   * Default is the same name of the property, in this case, idName
   */
  @Column({ columnName: 'id' })
  public idName: number

  @Column()
  public name: string

  @Column()
  public description: string

  /**
   * The defaultValue option defines that when creating an Product,
   * Model will auto set quantity as '1' if nothing is set on create
   */
  @Column({ defaultValue: 1 })
  public quantity: number

  /**
   * The isCreatedAt option defines that when creating an Product,
   * Model will auto set createdAt as 'new Date()'
   */
  @Column({ isCreatedAt: true })
  public createdAt: Date

  /**
   * The isUpdatedAt option defines that when updating an Product,
   * Model will auto set updatedAt as 'new Date()'
   */
  @Column({ isUpdatedAt: true })
  public updatedAt: Date

  /**
   * The isDeletedAt option defines that when deleting an Product,
   * Model will soft delete instead of delete and auto set deletedAt
   * as 'new Date()'
   */
  @Column({ isDeletedAt: true })
  public deletedAt: Date
}
```

#### Creating a new Product

> With our database connection established and our model defined, we can start using Product model

```ts
const product = await Product.create({ name: 'iPhone 10', description: 'Nice iPhone' })

console.log(product instanceof Product) // true

console.log(product.idName) // 1
console.log(product.name) // 'iPhone10'
console.log(product.quantity) // 5
console.log(product.createdAt) // 2022-03-19T16:23:35.897Z
console.log(product.updatedAt) // 2022-03-19T16:23:35.897Z
console.log(product.deletedAt) // null

// Product instance has the toJSON method that will 
// transform the model to object
const productJson = product.toJSON()

console.log(productJson instanceof Product) // false
```

#### Get one and get many products

```ts
const product = await Product.find({ idName: 1 })
console.log(product instanceof Product) // true

const products = await Product.findMany({ idName: 1 })
console.log(products[0] instanceof Product) // true
```

#### Update products

```ts
const where = { idName: 1 }

const product = await Product.update(where, { quantity: 50 })
console.log(product instanceof Product) // true
console.log(product.quantity) // 50
```

#### Delete products

> If you set a Column with isDeletedAt property, delete method will always soft delete your data, setting your column as 'new Date()'

```ts
// If Product Model didn't have isDeletedAt, it would be deleted
const product = await Product.delete({ idName: 1 })
console.log(product instanceof Product) // true
console.log(product.deletedAt) // 2022-03-19T16:30:17.130Z

// You can force the delete setting the force parameter as true
const force = true

const voidProduct = await Product.delete({ idName: 1 }, force)
console.log(voidProduct instanceof Product) // false
console.log(voidProduct) // undefined
```

#### Defining Relationships

> We can use Decorators to define OneToOne, OneToMany and ManyToMany relations in our Model

#### User Model

```ts
import { Role } from './Role'
import { Product } from './Product'
import { Model, Column, HasMany, ManyToMany } from '@secjs/orm'

export class User extends Model {
  static persistOnly = ['name']

  @Column()
  public id: number

  @Column()
  public name: string

  /**
   * The primaryKey option defines the primaryKey of your Model.
   * In this case the default value would be id, because the
   * primaryKey of User model is id.
   *
   * The foreignKey options defines the foreignKey of your RelationModel.
   * In this case the default value would be userId. The name of
   * your Model in lower case (user) with Id in the end.
   */
  @HasMany(() => Product, { primaryKey: 'id', foreignKey: 'userId' })
  public products: Product[]

  /**
   * WARN - In ManyToMany relations you don't need to define the Pivot model
   *
   * pivotTableName: The name of your pivot table - Default is user_role
   * localPrimaryKey: The PK of your Model - Default is id
   * pivotLocalForeignKey: The FK of your Model in the Pivot Table - Default is userId
   * relationPrimaryKey: The PK of your RelationModel - Default is id
   * pivotRelationForeignKey: The FK of your RelationModel in the Pivot Table - Default is roleId
   */
  @ManyToMany(() => Role, {
    pivotTableName: 'user_role'
  })
  public roles: Role[]
}
```

#### Product Model

```ts
import { User } from './User'
import { Model, Column, BelongsTo } from '@secjs/orm'

export class Product extends Model {
  static persistOnly = ['name', 'quantity']

  @Column()
  public id: number

  @Column({ defaultValue: 'Product' })
  public name: string

  @Column({ defaultValue: 1 })
  public quantity: number

  // The FK
  @Column()
  public userId: number

  /**
   * The primaryKey option defines the primaryKey of your RelationModel.
   * In this case the default value would be id, because the
   * primaryKey of User model is id.
   *
   * The foreignKey options defines the foreignKey of your Model.
   * In this case the default value would be userId. The name of
   * your RelationModel in lower case (user) with Id in the end.
   */
  @BelongsTo(() => User, { foreignKey: 'userId', primaryKey: 'id' })
  public user: User
}
```

#### Role Model

```ts
import { User } from './User'
import { Model, Column, ManyToMany } from '@secjs/orm'

export class Role extends Model {
  static persistOnly = ['name']

  @Column()
  public id: number

  @Column({ defaultValue: 'Customer' })
  public name: string

  /**
   * WARN - To map the other side of a ManyToMany relation you need to set the
   * pivotTableName property. If you do not set the pivotTableName here and
   * try to make an include query it would make the query in role_user pivotTable
   */
  @ManyToMany(() => User, {
    pivotTableName: 'user_role'
  })
  public users: User[]
}
```

#### ProductDetail Model

```ts
import { Product } from './Product'
import { Model, Column, BelongsTo } from '@secjs/orm'

export class ProductDetail extends Model {
  static persistOnly = ['detail']

  @Column()
  public id: number

  @Column()
  public detail: string

  // The FK
  @Column()
  public productId: number

  @BelongsTo(() => Product)
  public product: Product
}
```

#### Get relationships using load and query builder

> We can use load instance method to get the relations from User

```ts
const user = await User.find()

// Load roles and products with productDetails from User
await user.load('roles', 'products.productDetails')

console.log(user.roles[0] instanceof Role) // true
console.log(user.products[0] instanceof Product) // true
console.log(user.products[0].productDetails[0] instanceof ProductDetail) // true
```

> But we can use query builder from User too

```ts
const user = await User
  .query()
  .includes('roles')
  // Sub query
  .includes('products', async (query) => {
    query.orderBy('detail', 'asc').includes('productDetails')
  })
  .get()

console.log(user.roles[0] instanceof Role) // true
console.log(user.products[0] instanceof Product) // true
console.log(user.products[0].productDetails[0] instanceof ProductDetail) // true
```

> If you have mapped right your models with HasMany and BelongsTo you can also take the user from Product model. Example using paginate method

```ts
const page = 0
const limit = 1

const { meta, links, data } = await Product
  .query()
  .includes('user')
  .paginate(page, limit, '/products')

console.log(meta)
/**
 * itemCount: 1
 * totalItems: 1
 * totalPages: 1
 * currentPage: 0
 * itemsPerPage: 1
 */

console.log(links)
/**
 * first: '/products?limit=1'
 * previous: '/products?page=0&limit=1'
 * next: '/products?page=1&limit=1'
 * last: '/products?page=1&limit=1'
 */

console.log(data instanceof Product) // true
console.log(data.user instanceof User) // true
```

#### Creating your own methods/static methods using the query builder

> You can define your own methods in your Model and use the query builder to get what you want

```ts
import { User } from './User'
import { Model, Column, BelongsTo } from '@secjs/orm'

export class Product extends Model {
  static persistOnly = ['name', 'quantity']

  @Column()
  public id: number

  @Column({ defaultValue: 'Product' })
  public name: string

  @Column({ defaultValue: 1 })
  public quantity: number

  @Column()
  public userId: number

  @BelongsTo(() => User, { foreignKey: 'userId', primaryKey: 'id' })
  public user: User

  /**
   * You can define it as static and use it like this -> Product.getAllWithUser(1, 2, 3)
   */
  static async getAllWithUser(...quantityIn: number[]) {
    return this
      .query()
      .select('id', 'name', 'quantity')
      .whereIn('quantity', ...quantityIn)
      .orderBy('name', 'ASC')
      .includes('user')
      .getMany()
  }

  /**
   * Or you can define it as an instance method and use it like this
   * -> const product = await Product.find() -> await product.getAllWithUser(1, 2, 3)
   */
  async getAllWithUser(quantityIn: number[]) {
    // WARN - Do not use Model here, it wont work. 
    // You need to use your defined model, in this case, Product.
    return Product
      .query()
      .select('id', 'name', 'quantity')
      .whereIn('quantity', quantityIn)
      .orderBy('name', 'ASC')
      .includes('user')
      .getMany()
  }
}
```

#### Factory method

> The factory method from models can be used to generate a massive number of models. You can use this to work in the tests of your application

```ts
const { id } = await User.create({ name: 'João' })

// Will create ten products in database with name Test and the owner will the user João
const products = await Product.factory().count(10).create<Product[]>({ name: 'Test', userId: id })
// Will make ten products fake objects with name Test and the owner will the user João
const fakeProducts = await Product.factory().count(10).make<Product[]>({ name: 'Test', userId: id })
```

> To solve the problem of repetitive data you can define in your model the static method `definition`. And use the `this.faker` property to mock values

```ts
import { User } from './User'
import { Model, Column, BelongsTo } from '@secjs/orm'

export class Product extends Model {
  // Factories ignore the persistOnly rule
  static persistOnly = ['name', 'quantity']

  static async definition() {
    return {
      name: this.faker.name.firstName(),
      quantity: this.faker.datatype.number(),
      /**
       * Define that User factory should return only the value from idPrimary.
       * If you don't set the returning key, factory will return all the data from User
       */
      userId: User.factory('idPrimary'),
    }
  }

  @Column()
  public id: number

  @Column({ defaultValue: 'Product' })
  public name: string

  @Column({ defaultValue: 1 })
  public quantity: number

  @Column()
  public userId: number

  @BelongsTo(() => User, { foreignKey: 'userId', primaryKey: 'id' })
  public user: User
}
```

> Now you can use create method normally

```ts
import { Product } from './Product'

const { id } = await User.create({ name: 'João' })

// Will create ten products in database with mocked values and 
// the owner will be different for each one of then
const productsDifOwner = await Product.factory().count(10).create<Product[]>()

// Will create ten products in database with mocked values and 
// the owner will be the same for each one of then
const productsSameOwner = await Product.factory().count(10).create<Product[]>({ userId: id })
```

#### Assertions with Factory

> Factory has some assertions that you can make to use in tests

```ts
const factory = User.factory()

await factory.count(10).create<User[]>()

// Assert that user table has twenty users
await factory.assertCount(10) // true

// Assert that exists at least one user with name 'João'
await factory.assertHas({ name: 'João' }) // true

// Assert that does not exist any user with name 'Victor'
await factory.assertMissing({ name: 'Victor' }) // true

// Assert that exists one user with id 1
await factory.assertExists({ id: 1 }) // true

// Assert that does not exists one user with id 9999
await factory.assertNotExists({ id: 9999 }) // true
```

---

## License

Made with 🖤 by [jlenon7](https://github.com/jlenon7) :wave:
