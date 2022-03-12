/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { String } from '@secjs/utils'
import { DatabaseContract } from '@secjs/database'
import { ColumnOptions } from './Decorators/Column'
import { ModelFactory } from './Utils/ModelFactory'
import { DatabaseConnection } from './DatabaseConnection'
import { InternalServerException } from '@secjs/exceptions'
import { Product } from '../tests/stubs/Models/Product'

type OmittedModelMethods = keyof Model
type ModelPropsKeys<This> = keyof Omit<This, OmittedModelMethods>
type ModelPropsRecord<This> = Record<ModelPropsKeys<This>, any>

export abstract class Model {
  private DB: DatabaseContract = new DatabaseConnection().getDb()

  private relations = this.getMetadata('model:relations')
  private columns: ColumnOptions[] = this.getMetadata('model:columns')

  protected connection = 'default'
  protected table = String.toSnakeCase(String.pluralize(this.constructor.name))

  private getMetadata(key: string) {
    const metadata = Reflect.getMetadata(key, this.constructor)

    if (!metadata) {
      return []
    }

    return metadata
  }

  constructor() {
    // const columnNames = this.columns.map(column => `${column.columnName} as ${this.table}.${column.columnName}`)
    // const columnNames = this.columns.map(column => `${column.columnName}`)

    // this.DB.buildTable(this.table)
  }


  // protected abstract primaryKey = 'id'
  // protected abstract timestamps = false
  // protected abstract incrementing = true
  // protected abstract incrementingType = 'string'

  async find() {
    const data = await this.DB
      .buildTable(this.table)
      .find()

    // console.log(ObjectTranspiler.createDictionaryFromRow(data))

    return data
  }

  async findMany() {
    let flatData = await this.DB
      .buildTable(this.table)
      .findMany()

    // return ModelFactory.create(flatData, this) as this[]
    return flatData
  }

  async paginate(page: number, limit: number, resourceUrl = '/') {
    return this.DB.paginate(page, limit, resourceUrl)
  }

  async forPage(page: number, limit: number) {
    return this.DB.forPage(page, limit)
  }

  async create(values: ModelPropsRecord<this>) {
    return this.DB.insertAndGet(values)
  }

  async update(
    key: ModelPropsKeys<this> | ModelPropsRecord<this>,
    value?: ModelPropsRecord<this>,
  ) {
    return this.DB.updateAndGet(key, value)
  }

  async delete() {
    return this.DB.delete()
  }

  // Builder Methods

  // select(...columns: ModelPropsKeys<this>[]): this {
  //   this.DB.buildSelect(...(columns as string[]))
  //
  //   return this
  // }
  //
  // distinct(...columns: ModelPropsKeys<this>[]): this {
  //   this.DB.buildDistinct(...(columns as string[]))
  //
  //   return this
  // }

  where(statement: string | ModelPropsRecord<this>, value?: any): this {
    this.DB.buildWhere(statement, value)

    return this
  }

  join(relationName: string): this {
    const relation = this.relations.find(relation => relation.columnName === relationName)

    if (!relation) {
      throw new InternalServerException(`Relation ${relationName} not found in model ${this.constructor.name}`)
    }

    let { model, foreignKey } = relation

    let relationColumns = Reflect.getMetadata('model:columns', model)

    relationColumns = relationColumns.map(column => `${model.table}.${column.columnName} as ${model.table}.${column.columnName}`)
    const modelColumns = this.columns.map(column => `${this.table}.${column.columnName} as ${this.table}.${column.columnName}`)

    const primaryKey = `${this.table}.id`
    foreignKey = `${model.table}.${foreignKey}`

    this.DB
      .buildJoin(model.table, primaryKey, '=', foreignKey, 'leftJoin')
      .buildSelect(...modelColumns, ...relationColumns)

    return this
  }

  groupBy(...columns: string[]): this {
    this.DB.buildGroupBy(...columns)

    return this
  }

  orderBy(column: string, direction: 'asc' | 'desc'): this {
    this.DB.buildOrderBy(column, direction)

    return this
  }

  // having(column: string, operator: string, value: string): this {
  //   this.DB.buildHaving(column, operator, value)
  //
  //   return this
  // }

  skip(number: number): this {
    this.DB.buildSkip(number)

    return this
  }

  limit(number: number): this {
    this.DB.buildLimit(number)

    return this
  }
}
