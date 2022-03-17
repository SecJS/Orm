/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Product } from './Stubs/Models/Product'
import { UserModel } from './Stubs/Models/UserModel'

describe('\n Load Model Class', () => {
  it('should be able to boot all the static properties for each concrete Model', async () => {
    Product.boot()

    expect(Product.booted).toBe(true)
    expect(Product.primaryKey).toBe('id')
    expect(Product.table).toBe('products')
    expect(Product.connection).toBe('default')

    expect(Product.columns[0].isPrimary).toBe(true)
    expect(Product.columns[0].columnName).toBe('id')
    expect(Product.columns[1].isPrimary).toBe(false)
    expect(Product.columns[1].columnName).toBe('name')
  })

  it('should be able to boot a Model with predefined static values inside', async () => {
    UserModel.boot()

    expect(UserModel.booted).toBe(true)
    expect(UserModel.primaryKey).toBe('idPrimary')
    expect(UserModel.table).toBe('users')
    expect(UserModel.connection).toBe('default')

    expect(UserModel.columns[0].isPrimary).toBe(true)
    expect(UserModel.columns[0].columnName).toBe('id')
    expect(UserModel.columns[0].propertyName).toBe('idPrimary')
    expect(UserModel.columns[1].isPrimary).toBe(false)
    expect(UserModel.columns[1].columnName).toBe('name')
    expect(UserModel.columns[1].propertyName).toBe('name')
  })
})
