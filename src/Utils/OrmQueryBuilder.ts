/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Model } from '../Model'
import { ModelFactory } from './ModelFactory'
import { DatabaseContract } from '@secjs/database'
import { Is, PaginatedResponse } from '@secjs/utils'
import { ModelPropsKeys } from '../Types/ModelPropsKeys'
import { ModelPropsRecord } from '../Types/ModelPropsRecord'
import { ModelRelationsKeys } from '../Types/ModelRelationsKeys'
import { NotFoundRelationException } from '../Exceptions/NotFoundRelationException'

export class OrmQueryBuilder<Class extends typeof Model> {
  private readonly Model: typeof Model
  private readonly DB: DatabaseContract
  private readonly Factory: ModelFactory

  public constructor(
    model: typeof Model,
    DB: DatabaseContract,
    Factory: ModelFactory,
  ) {
    this.Model = model
    this.DB = DB
    this.Factory = Factory
  }

  async get(): Promise<InstanceType<Class>> {
    const flatData = await this.DB.find()

    if (!flatData) {
      return null
    }

    return this.Factory.fabricate(flatData, this.Model)
  }

  async getMany(): Promise<InstanceType<Class>[]> {
    const flatData = await this.DB.findMany()

    if (!flatData || !flatData.length) {
      return []
    }

    return this.Factory.fabricate(flatData, this.Model)
  }

  async forPage(page: number, limit: number): Promise<InstanceType<Class>[]> {
    const flatData = await this.DB.forPage(page, limit)

    return this.Factory.fabricate(flatData, this.Model)
  }

  async paginate(
    page: number,
    limit: number,
    resourceUrl?: string,
  ): Promise<PaginatedResponse<InstanceType<Class>[]>> {
    const { data, meta, links } = await this.DB.paginate(
      page,
      limit,
      resourceUrl,
    )

    return {
      meta,
      links,
      data: await this.Factory.fabricate(data, this.Model),
    }
  }

  async create(
    values: ModelPropsRecord<InstanceType<Class>>,
  ): Promise<InstanceType<Class>> {
    const createObject: any = {}
    const reverseDictionary = this.Model.reverseColumnDictionary()
    const primaryKey = reverseDictionary[this.Model.primaryKey]

    Object.keys(values).forEach(key => {
      if (
        this.Model.persistOnly[0] === '*' ||
        this.Model.persistOnly.find(p => p === key)
      ) {
        createObject[reverseDictionary[key]] = values[key]
      }
    })

    // Used for createdAt and updatedAt
    const date = new Date()

    this.Model.columns.forEach(c => {
      // Set createdAt only if it does not exist in createObject
      if (c.isCreatedAt && !createObject[c.columnName]) {
        createObject[c.columnName] = date

        return
      }

      // Set updatedAt only if it does not exist in createObject
      if (c.isUpdatedAt && !createObject[c.columnName]) {
        createObject[c.columnName] = date

        return
      }

      // Set the default value of the column only if it does not exist in createObject, and it's not a PK
      if (!c.isPrimary && !createObject[c.columnName]) {
        createObject[c.columnName] = c.defaultValue

        return
      }
    })

    const [id] = await this.DB.insert(createObject, primaryKey)

    return this.where(primaryKey, id).get()
  }

  async update(
    key:
      | ModelPropsKeys<InstanceType<Class>>
      | ModelPropsRecord<InstanceType<Class>>,
    value?: any,
  ): Promise<InstanceType<Class>> {
    const updateObject: any = {}
    const reverseDictionary = this.Model.reverseColumnDictionary()
    const primaryKey = reverseDictionary[this.Model.primaryKey]

    if (Is.Object(key)) {
      Object.keys(key).forEach(k => {
        if (
          this.Model.persistOnly[0] === '*' ||
          this.Model.persistOnly.find(p => p === k)
        ) {
          updateObject[reverseDictionary[k]] = key[k]
        }
      })
    } else if (Is.String(key)) {
      if (
        this.Model.persistOnly[0] === '*' ||
        this.Model.persistOnly.find(p => p === key)
      ) {
        updateObject[reverseDictionary[key]] = value
      }
    }

    this.Model.columns.forEach(c => {
      // Set updatedAt only if it does not exist in updateObject
      if (c.isUpdatedAt && !updateObject[c.columnName]) {
        updateObject[c.columnName] = new Date()

        return
      }
    })

    const [id] = await this.DB.update(updateObject, primaryKey)

    return this.where(primaryKey, id).get()
  }

  async delete(): Promise<InstanceType<Class>> {
    const deletedAtColumn = this.Model.columns.find(c => c.isDeletedAt)

    if (deletedAtColumn) {
      const updateObject = {}

      updateObject[deletedAtColumn.columnName] = new Date()

      return this.update(updateObject)
    }

    await this.DB.delete()
  }

  select(...columns: ModelPropsKeys<InstanceType<Class>>[]): this {
    const reverseDictionary = this.Model.reverseColumnDictionary()

    columns = columns.map(column => reverseDictionary[column])

    // @ts-ignore
    this.DB.buildSelect(...columns)

    return this
  }

  distinct(...columns: ModelPropsKeys<InstanceType<Class>>[]): this {
    const reverseDictionary = this.Model.reverseColumnDictionary()

    columns = columns.map(column => reverseDictionary[column])

    // @ts-ignore
    this.DB.buildDistinct(...columns)

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

  orderBy(
    column: ModelPropsKeys<InstanceType<Class>>,
    direction: 'asc' | 'desc' | 'ASC' | 'DESC',
  ): this {
    const reverseDictionary = this.Model.reverseColumnDictionary()

    this.DB.buildOrderBy(
      reverseDictionary[column],
      direction.toLowerCase() as any,
    )

    return this
  }

  groupBy(...columns: ModelPropsKeys<InstanceType<Class>>[]): this {
    const reverseDictionary = this.Model.reverseColumnDictionary()

    columns = columns.map(column => reverseDictionary[column])

    // @ts-ignore
    this.DB.buildGroupBy(...columns)

    return this
  }

  having(column: string, operator: string, value: any): this {
    const reverseDictionary = this.Model.reverseColumnDictionary()

    this.DB.buildHaving(reverseDictionary[column], operator, value)

    return this
  }

  includes(relationName: ModelRelationsKeys<InstanceType<Class>>): this {
    const relation = this.Model.relations.find(
      relation => relation.propertyName === relationName,
    )

    if (!relation) {
      throw new NotFoundRelationException(relationName, this.constructor.name)
    }

    relation.isIncluded = true

    const index = this.Model.relations.indexOf(relation)
    this.Model.relations[index] = relation

    return this
  }

  where(
    statement:
      | string
      | ModelPropsKeys<InstanceType<Class>>
      | ModelPropsRecord<InstanceType<Class>>,
    value?: any,
  ): this {
    const reverseDictionary = this.Model.reverseColumnDictionary()

    if (!statement) {
      return this
    }

    if (Is.String(statement)) {
      statement = reverseDictionary[statement] || statement

      // @ts-ignore
      this.DB.buildWhere(statement, value)

      return this
    }

    if (Is.Object(statement)) {
      let newStatement: any = {}

      Object.keys(statement).forEach(key => {
        newStatement[reverseDictionary[key] || key] = statement[key]
      })

      // @ts-ignore
      this.DB.buildWhere(newStatement)

      return this
    }
  }

  orWhere(
    statement:
      | string
      | ModelPropsKeys<InstanceType<Class>>
      | ModelPropsRecord<InstanceType<Class>>,
    value?: any,
  ): this {
    const reverseDictionary = this.Model.reverseColumnDictionary()

    if (!statement) {
      return this
    }

    if (Is.String(statement)) {
      statement = reverseDictionary[statement] || statement

      // @ts-ignore
      this.DB.buildOrWhere(statement, value)

      return this
    }

    if (Is.Object(statement)) {
      let newStatement: any = {}

      Object.keys(statement).forEach(key => {
        newStatement[reverseDictionary[key] || key] = statement[key]
      })

      // @ts-ignore
      this.DB.buildOrWhere(newStatement)

      return this
    }
  }

  whereLike(
    statement:
      | string
      | ModelPropsKeys<InstanceType<Class>>
      | ModelPropsRecord<InstanceType<Class>>,
    value?: any,
  ): this {
    const reverseDictionary = this.Model.reverseColumnDictionary()

    if (!statement) {
      return this
    }

    if (Is.String(statement)) {
      statement = reverseDictionary[statement] || statement

      // @ts-ignore
      this.DB.buildWhereLike(statement, value)

      return this
    }

    if (Is.Object(statement)) {
      let newStatement: any = {}

      Object.keys(statement).forEach(key => {
        newStatement[reverseDictionary[key] || key] = statement[key]
      })

      // @ts-ignore
      this.DB.buildWhereLike(newStatement)

      return this
    }
  }

  whereILike(
    statement:
      | string
      | ModelPropsKeys<InstanceType<Class>>
      | ModelPropsRecord<InstanceType<Class>>,
    value?: any,
  ): this {
    const reverseDictionary = this.Model.reverseColumnDictionary()

    if (!statement) {
      return this
    }

    if (Is.String(statement)) {
      statement = reverseDictionary[statement] || statement

      // @ts-ignore
      this.DB.buildWhereILike(statement, value)

      return this
    }

    if (Is.Object(statement)) {
      let newStatement: any = {}

      Object.keys(statement).forEach(key => {
        newStatement[reverseDictionary[key] || key] = statement[key]
      })

      // @ts-ignore
      this.DB.buildWhereILike(newStatement)

      return this
    }
  }

  whereIn(
    columnName: ModelPropsKeys<InstanceType<Class>>,
    values: any[],
  ): this {
    const reverseDictionary = this.Model.reverseColumnDictionary()

    this.DB.buildWhereIn(reverseDictionary[columnName] || columnName, values)

    return this
  }

  whereNotIn(
    columnName: ModelPropsKeys<InstanceType<Class>>,
    values: any[],
  ): this {
    const reverseDictionary = this.Model.reverseColumnDictionary()

    this.DB.buildWhereNotIn(reverseDictionary[columnName] || columnName, values)

    return this
  }

  whereBetween(
    columnName: ModelPropsKeys<InstanceType<Class>>,
    values: [any, any],
  ): this {
    const reverseDictionary = this.Model.reverseColumnDictionary()

    this.DB.buildWhereBetween(
      reverseDictionary[columnName] || columnName,
      values,
    )

    return this
  }

  whereNotBetween(
    columnName: ModelPropsKeys<InstanceType<Class>>,
    values: [any, any],
  ): this {
    const reverseDictionary = this.Model.reverseColumnDictionary()

    this.DB.buildWhereNotBetween(
      reverseDictionary[columnName] || columnName,
      values,
    )

    return this
  }

  whereNull(columnName: ModelPropsKeys<InstanceType<Class>>): this {
    const reverseDictionary = this.Model.reverseColumnDictionary()

    this.DB.buildWhereNull(reverseDictionary[columnName] || columnName)

    return this
  }

  whereNotNull(columnName: ModelPropsKeys<InstanceType<Class>>): this {
    const reverseDictionary = this.Model.reverseColumnDictionary()

    this.DB.buildWhereNotNull(reverseDictionary[columnName] || columnName)

    return this
  }
}
