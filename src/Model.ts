/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { String } from '@secjs/utils'
import { Database, DatabaseContract, JoinType } from '@secjs/database'

type OmittedModelMethods = keyof Model
type ModelPropsKeys<This> = keyof Omit<This, OmittedModelMethods>
type ModelPropsRecord<This> = Record<ModelPropsKeys<This>, any>

export abstract class Model {
  private DB: DatabaseContract

  protected async _load() {
    this.DB = await new Database().connection(this.connection).connect()

    this.DB.buildTable(this.table)
  }

  // protected abstract primaryKey = 'id'
  // protected abstract timestamps = false
  // protected abstract incrementing = true
  // protected abstract incrementingType = 'string'

  protected connection = 'default'
  protected table = String.toSnakeCase(String.pluralize(this.constructor.name))

  async find() {
    return this.DB.find()
  }

  async findMany() {
    return this.DB.findMany()
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

  select(...columns: ModelPropsKeys<this>[]): this {
    this.DB.buildSelect(...(columns as string[]))

    return this
  }

  distinct(...columns: ModelPropsKeys<this>[]): this {
    this.DB.buildDistinct(...(columns as string[]))

    return this
  }

  where(statement: string | ModelPropsRecord<this>, value?: any): this {
    this.DB.buildWhere(statement, value)

    return this
  }

  join(
    tableName: string,
    column1: string,
    column2: string,
    joinType?: JoinType,
  ): this {
    this.DB.buildJoin(tableName, column1, column2, joinType)

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

  having(column: string, operator: string, value: string): this {
    this.DB.buildHaving(column, operator, value)

    return this
  }

  skip(number: number): this {
    this.DB.buildSkip(number)

    return this
  }

  limit(number: number): this {
    this.DB.buildLimit(number)

    return this
  }
}
