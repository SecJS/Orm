/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Model } from '../Model'
import { Number } from '@secjs/utils'
import { ModelQueryBuilder } from './ModelQueryBuilder'
import { ModelPropsRecord } from '../Types/ModelPropsRecord'

export class ModelFactory<Class extends typeof Model> {
  private readonly Model: typeof Model
  private readonly query: ModelQueryBuilder<Class>
  private readonly definition: () => Promise<any>
  private readonly returning: string

  private _count = 1

  constructor(
    model: typeof Model,
    query: ModelQueryBuilder<Class>,
    definition: () => Promise<any>,
    returning: string,
  ) {
    this.Model = model
    this.query = query
    this.definition = definition
    this.returning = returning
  }

  async make<T = InstanceType<Class> | InstanceType<Class>[]>(
    values?: ModelPropsRecord<InstanceType<Class>>,
  ): Promise<T> {
    if (this._count > 1) {
      return this.makeMany(values)
    }

    return this.makeOne(values)
  }

  async create<T = InstanceType<Class> | InstanceType<Class>[]>(
    values?: ModelPropsRecord<InstanceType<Class>>,
  ): Promise<T> {
    if (this._count > 1) {
      return this.createMany(values)
    }

    return this.createOne(values)
  }

  async assertCount(number: number): Promise<boolean> {
    return (await this.query.count()) === number
  }

  async assertExists(
    statement: ModelPropsRecord<InstanceType<Class>>,
  ): Promise<boolean> {
    return Boolean(await this.query.where(statement).get())
  }

  async assertNotExists(
    statement: ModelPropsRecord<InstanceType<Class>>,
  ): Promise<boolean> {
    return !(await this.assertExists(statement))
  }

  async assertHas(
    statement: ModelPropsRecord<InstanceType<Class>>,
  ): Promise<boolean> {
    const data = await this.query.where(statement).getMany()

    return data.length >= 1
  }

  async assertMissing(
    statement: ModelPropsRecord<InstanceType<Class>>,
  ): Promise<boolean> {
    return !(await this.assertHas(statement))
  }

  count(number = 1): this {
    this._count = number

    return this
  }

  private async createOne(values: any): Promise<any> {
    const data = await this.getDefinition(values, 'create')

    if (this.returning === '*') {
      return this.query.create(data)
    }

    const createdData = await this.query.create(data, true)

    return createdData[this.returning]
  }

  private async createMany(values?: any): Promise<any> {
    const promises = []

    for (let i = 1; i <= this._count; i++) {
      promises.push(this.createOne(values))
    }

    return Promise.all(promises)
  }

  private async makeOne(values?: any): Promise<any> {
    let data: any = {}

    this.Model.columns.forEach(column => {
      if (column.isCreatedAt) {
        data[column.columnName] = new Date()

        return
      }

      if (column.isUpdatedAt) {
        data[column.columnName] = new Date()

        return
      }

      if (column.defaultValue) {
        data[column.propertyName] = column.defaultValue

        return
      }

      if (column.isPrimary) {
        data[column.propertyName] = Number.randomIntFromInterval(0, 100000)
      }
    })

    data = {
      ...data,
      ...(await this.getDefinition(values, 'make')),
    }

    if (this.returning === '*') {
      return data
    }

    return data[this.returning]
  }

  private async makeMany(values?: any): Promise<any> {
    const promises = []

    for (let i = 1; i <= this._count; i++) {
      promises.push(this.makeOne(values))
    }

    return Promise.all(promises)
  }

  private async getDefinition(values: any, method: string) {
    const data = await this.definition()

    const promises = Object.keys(data).reduce((promises, key) => {
      // Do not execute sub factory if the value already exists in values object
      if (values && values[key]) return promises

      if (data[key] instanceof ModelFactory) {
        promises.push(
          Promise.resolve(data[key][method]()).then(
            result => (data[key] = result),
          ),
        )
      }

      return promises
    }, [])

    await Promise.all(promises)

    return {
      ...data,
      ...values,
    }
  }
}
