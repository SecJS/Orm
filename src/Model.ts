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
import { RelationContract } from './Contracts/RelationContract'
import { ModelPropsKeys, ModelPropsRecord, ModelContract } from './Contracts/ModelContract'

export abstract class Model implements ModelContract {
  private DB: DatabaseContract = new DatabaseConnection().getDb()

  /** The name of the table in Database */
  static table: string
  /** The boolean that defines if this model has been already booted */
  static booted: boolean
  /** The database connection that this Model will work */
  static connection: string
  /** The primary key to build relationships across models */
  static primaryKey: string

  /** All the model columns mapped */
  static columns: ColumnOptions[]
  /** All the model relations mapped */
  static relations: RelationContract[]

  private static defineStatic(propName: string, value: any) {
    if (this[propName]) return

    this[propName] = value
  }

  static boot() {
    if (this.booted) return

    this.booted = true

    this.defineStatic('columns', [])
    this.defineStatic('relations', [])
    this.defineStatic('primaryKey', 'id')
    this.defineStatic('connection', 'default')
    this.defineStatic('table', String.toSnakeCase(String.pluralize(this.name)))
  }

  static addColumn(column: ColumnOptions) {
    if (this.primaryKey === column.columnName) {
      column.isPrimary = true
    }

    this.columns.push(column)
  }

  static addRelation(relation: RelationContract) {
    relation.model = relation.model()

    switch (relation.relationType) {
      case 'belongsTo':
        relation.foreignKey = this.primaryKey
        break;
      default:
        relation.primaryKey = this.primaryKey
    }

    this.relations.push(relation)
  }

  protected get class(): any {
    return this.constructor
  }

  /**
   * Database Methods
   */

  // static toJSON<T extends typeof Model>(this: T): ModelPropsRecord<InstanceType<T>> {
  //   return {}
  // }

  toJSON(): ModelPropsRecord<this> {
    const json: any = {}

    this.class.columns.forEach(column => json[column.columnName] = this[column.columnName])

    this.class.relations.forEach(relation => {
      if (!relation.isIncluded) return

      if (['belongsTo', 'hasOne'].includes(relation.relationType)) {
        if (!this[relation.columnName]) return

        json[relation.columnName] = this[relation.columnName].toJSON()

        return
      }

      json[relation.columnName] = []

      this[relation.columnName].forEach(relationData => {
        if (!relationData) return

        json[relation.columnName].push(relationData.toJSON())
      })
    })

    return json
  }

  async find(): Promise<this> {
    const flatData = await this.DB
      .buildTable(this.class.table)
      .find()

    Object.keys(flatData).forEach(key => this[key] = flatData[key])

    return ModelFactory.run(this, this.class.relations)
  }

  async findMany(): Promise<this[]> {
    const flatData = await this.DB
      .buildTable(this.class.table)
      .findMany()

    const modelData = []

    flatData.forEach(data => {
      const model = new this.class()

      Object.keys(data).forEach(key => model[key] = data[key])

      modelData.push(model)
    })

    return ModelFactory.run(modelData, this.class.relations)
  }

  async paginate(page: number, limit: number, resourceUrl = '/') {
    return this.DB.paginate(page, limit, resourceUrl)
  }

  async forPage(page: number, limit: number) {
    return this.DB.forPage(page, limit)
  }

  async create(values: ModelPropsRecord<this>): Promise<this> {
    const [id] = await this.DB.insert(values)

    return this.where('id', id).find()
  }

  async update(
    key: ModelPropsKeys<this> | ModelPropsRecord<this>,
    value?: ModelPropsRecord<this>,
  ): Promise<this> {
    const [id] = await this.DB.update(key, value)

    return this.where('id', id).find()
  }

  async delete(): Promise<void> {
    await this.DB.delete()
  }

  /**
   * Builder Methods
   */

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

  includes(relationName: ModelPropsKeys<this>): this {
    const self: any = this.constructor

    const relation = this.class.relations.find(relation => relation.columnName === relationName)

    if (!relation) {
      throw new InternalServerException(`Relation ${relationName} not found in model ${this.constructor.name}`)
    }

    relation.isIncluded = true

    const index = this.class.relations.indexOf(relation)
    this.class.relations[index] = relation

    return this
  }

  groupBy(...columns: ModelPropsKeys<this>[]): this {
    // @ts-ignore
    this.DB.buildGroupBy(...columns)

    return this
  }

  orderBy(column: ModelPropsKeys<this>, direction: 'asc' | 'desc'): this {
    // @ts-ignore
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
