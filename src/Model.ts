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
import { ModelFactory } from './Utils/ModelFactory'
import { DatabaseConnection } from './DatabaseConnection'
import { InternalServerException } from '@secjs/exceptions'
import { ColumnContract } from './Contracts/ColumnContract'
import { RelationContract } from './Contracts/RelationContract'

/**
 * Omit keys of type when the key type is from the specified type
 */
type OmitTypes<
  This,
  Types,
  WithNever = {
    [Key in keyof This]: Exclude<This[Key], undefined> extends Types
      ? never
      : This[Key] extends Record<string, unknown>
      ? OmitTypes<This[Key], Types>
      : This[Key]
  }
> = Pick<
  WithNever,
  {
    [K in keyof WithNever]: WithNever[K] extends never ? never : K
  }[keyof WithNever]
>

/**
 * Omit all the methods from Model class. Example: 'find' | 'findMany'
 */
export type OmittedModelMethods = keyof Model

/**
 * Type with only the keys from This. Example: 'id' | 'name'
 */
export type ModelPropsKeys<This> = keyof Omit<This, OmittedModelMethods> &
  string

/**
 * Type of Record from This. Example: Record<'id' | 'name', any>
 */
export type ModelPropsRecord<This> = Record<ModelPropsKeys<This>, any>

/**
 * Type with only the relations from This. Example: 'user' | 'productDetails'
 */
export type ModelRelationsKeys<This> = ModelPropsKeys<
  OmitTypes<This, string | boolean | number | Date>
>

export abstract class Model {
  /** The name of the table in Database */
  static table: string
  /** The boolean that defines if this model has been already booted */
  static booted: boolean
  /** The database connection that this Model will work */
  static connection: string
  /** The primary key to build relationships across models */
  static primaryKey: string
  /** All the model columns mapped */
  static columns: ColumnContract[]
  /** Dictionary to specify the column name in database to class property */
  static columnDictionary: Record<string, string>
  /** All the model relations mapped */
  static relations: RelationContract[]

  private DB: DatabaseContract
  private modelFactory: ModelFactory

  constructor() {
    const table = this.class.table
    const connection = this.class.connection

    this.modelFactory = new ModelFactory(connection)
    this.DB = new DatabaseConnection().getDatabase(connection).buildTable(table)
  }

  protected get class(): any {
    return this.constructor
  }

  static boot() {
    if (this.booted) return

    this.booted = true

    this.defineStatic('columns', [])
    this.defineStatic('relations', [])
    this.defineStatic('primaryKey', 'id')
    this.defineStatic('columnDictionary', {})
    this.defineStatic('connection', 'default')
    this.defineStatic('relationDictionary', {})
    this.defineStatic('table', String.toSnakeCase(String.pluralize(this.name)))
  }

  static addColumn(column: ColumnContract) {
    if (this.primaryKey === column.columnName) {
      column.isPrimary = true
    }

    this.columns.push(column)
    this.columnDictionary[column.columnName] = column.propertyName
  }

  static addRelation(relation: RelationContract) {
    switch (relation.relationType) {
      case 'belongsTo':
        relation.foreignKey = this.primaryKey
        break
      default:
        relation.primaryKey = this.primaryKey
    }

    this.relations.push(relation)
  }

  private static defineStatic(propName: string, value: any) {
    if (this[propName]) return

    this[propName] = value
  }

  /**
   * Database Methods
   */

  toJSON(): ModelPropsRecord<this> {
    const json: any = {}

    this.class.columns.forEach(
      column => (json[column.columnName] = this[column.columnName]),
    )

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
    const flatData = await this.DB.find()

    Object.keys(flatData).forEach(key => (this[key] = flatData[key]))

    return this.modelFactory.run(this, this.class.relations)
  }

  async findMany(): Promise<this[]> {
    const flatData = await this.DB.findMany()

    const modelData = []

    flatData.forEach(data => {
      const model = new this.class()

      Object.keys(data).forEach(key => {
        if (!this.class.columnDictionary[key]) {
          throw new InternalServerException(
            `The field ${key} has not been mapped in some of your @Column annotation in ${this.class.name} Model`,
          )
        }

        model[this.class.columnDictionary[key]] = data[key]
      })

      modelData.push(model)
    })

    return this.modelFactory.run(modelData, this.class.relations)
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

  where(
    statement: string | ModelPropsKeys<this> | ModelPropsRecord<this>,
    value?: any,
  ): this {
    this.DB.buildWhere(statement, value)

    return this
  }

  includes(relationName: ModelRelationsKeys<this>): this {
    const relation = this.class.relations.find(
      relation => relation.propertyName === relationName,
    )

    if (!relation) {
      throw new InternalServerException(
        `Relation ${relationName} not found in model ${this.constructor.name}`,
      )
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
