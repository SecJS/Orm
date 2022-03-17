/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ModelFactory } from './Utils/ModelFactory'
import { ModelPropsKeys } from './Types/ModelPropsKeys'
import { ModelPropsJson } from './Types/ModelPropsJson'
import { ColumnContract } from './Contracts/ColumnContract'
import { ModelPropsRecord } from './Types/ModelPropsRecord'
import { Is, PaginatedResponse, String } from '@secjs/utils'
import { Database, DatabaseContract } from '@secjs/database'
import { ModelRelationsKeys } from './Types/ModelRelationsKeys'
import { RelationContractTypes } from './Types/RelationContractTypes'
import { NotFoundRelationException } from './Exceptions/NotFoundRelationException'

export abstract class Model {
  /**
   * The name of the table in Database
   */
  static table: string

  /**
   * The boolean that defines if this model has been already booted
   */
  static booted: boolean

  /**
   * The database connection that this Model will work
   */
  static connection: string

  /**
   * The primary key to build relationships across models
   */
  static primaryKey: string

  /**
   * All the model columns mapped
   */
  static columns: ColumnContract[]

  /**
   * Dictionary to specify the column name in database to class property
   */
  static columnDictionary: Record<string, string>

  /**
   * All the model relations mapped
   */
  static relations: RelationContractTypes[]

  /**
   * Extras properties that could be added to Model, usually the data
   * inside pivotTable from ManyToMany Relations
   */
  $extras: any | any[]

  /**
   * DB to handle all data operations
   */
  private static _DB: DatabaseContract

  private static get DB(): DatabaseContract {
    if (!this._DB) {
      this._DB = new Database()
        .connection(this.connection)
        .buildTable(this.table)
    }

    return this._DB
  }

  /**
   * Factory to fabricate all instances from DB data
   */
  private static _Factory: ModelFactory

  private static get Factory(): ModelFactory {
    if (!this._Factory) {
      this._Factory = new ModelFactory(this.connection)
    }

    return this._Factory
  }

  /**
   * Get the subclass constructor. Example: Product, User, etc
   */
  protected get class(): typeof Model {
    return this.constructor as typeof Model
  }

  /**
   * Boot static properties inside subclass constructor instead of Model
   */
  static boot() {
    if (this.booted) return

    this.booted = true

    this.defineStatic('columns', [])
    this.defineStatic('relations', [])
    this.defineStatic('primaryKey', 'id')
    this.defineStatic('columnDictionary', {})
    this.defineStatic('connection', 'default')
    this.defineStatic('table', String.toSnakeCase(String.pluralize(this.name)))
  }

  /**
   * Add a new column inside subclass constructor
   */
  static addColumn(column: ColumnContract) {
    if (this.primaryKey === column.propertyName) {
      column.isPrimary = true
    }

    this.columns.push(column)
    this.columnDictionary[column.columnName] = column.propertyName
  }

  /**
   * Add a new relation inside subclass constructor
   */
  static addRelation(relation: RelationContractTypes) {
    this.relations.push(relation)
  }

  /**
   * Get one data in DB and return as a subclass instance
   */
  static async find<Class extends typeof Model>(
    this: Class,
  ): Promise<InstanceType<Class>> {
    const flatData = await this.DB.find()

    return this.Factory.fabricate(flatData, this)
  }

  /**
   * Get many data in DB and return as an array of subclass instance
   */
  static async findMany<Class extends typeof Model>(
    this: Class,
  ): Promise<InstanceType<Class>[]> {
    const flatData = await this.DB.findMany()

    return this.Factory.fabricate(flatData, this)
  }

  /**
   * Get many data paginated in DB and return with meta, links
   * and an array of subclass instance
   */
  static async paginate<Class extends typeof Model>(
    this: Class,
    page: number,
    limit: number,
    resourceUrl = '/',
  ): Promise<PaginatedResponse<InstanceType<Class>>> {
    const { data, meta, links } = await this.DB.paginate(
      page,
      limit,
      resourceUrl,
    )

    return {
      meta,
      links,
      data: await this.Factory.fabricate(data, this),
    }
  }

  /**
   * Get many data paginated in DB and return an array of subclass instance
   */
  static async forPage<Class extends typeof Model>(
    this: Class,
    page: number,
    limit: number,
  ): Promise<InstanceType<Class>[]> {
    const flatData = await this.DB.forPage(page, limit)

    return this.Factory.fabricate(flatData, this)
  }

  /**
   * Create a new model in DB and return as a subclass instance
   */
  static async create<Class extends typeof Model>(
    this: Class,
    values: ModelPropsRecord<InstanceType<Class>>,
  ): Promise<InstanceType<Class>> {
    const columnValues: any = {}
    const reverseDictionary = this.reverseColumnDictionary()
    const primaryKey = reverseDictionary[this.primaryKey]

    Object.keys(values).forEach(key => {
      columnValues[reverseDictionary[key]] = values[key]
    })

    const [id] = await this.DB.insert(columnValues, primaryKey)

    return this.where(primaryKey, id).find()
  }

  /**
   * Update a model in DB and return as a subclass instance
   */
  static async update<Class extends typeof Model>(
    this: Class,
    key:
      | ModelPropsKeys<InstanceType<Class>>
      | ModelPropsRecord<InstanceType<Class>>,
    value?: any,
  ): Promise<InstanceType<Class>> {
    const columnValues: any = {}
    const reverseDictionary = this.reverseColumnDictionary()
    const primaryKey = reverseDictionary[this.primaryKey]

    if (Is.Object(key)) {
      Object.keys(key).forEach(k => {
        columnValues[reverseDictionary[k]] = key[k]
      })

      const [id] = await this.DB.update(key, primaryKey)

      return this.where(primaryKey, id).find()
    }

    if (Is.String(key)) {
      key = reverseDictionary[key]

      const [id] = await this.DB.update(key, value, primaryKey)

      return this.where(primaryKey, id).find()
    }
  }

  /**
   * Delete a model in DB
   */
  static async delete(): Promise<void> {
    await this.DB.delete()
  }

  /**
   * Build a where query to be used inside other Model methods. You can
   * call this method as many times as you want
   */
  static where<Class extends typeof Model>(
    this: Class,
    statement:
      | string
      | ModelPropsKeys<InstanceType<Class>>
      | ModelPropsRecord<InstanceType<Class>>,
    value?: any,
  ): Class {
    const reverseDictionary = this.reverseColumnDictionary()

    if (Is.String(statement)) {
      statement = reverseDictionary[statement]

      // @ts-ignore
      this.DB.buildWhere(statement, value)

      return this
    }

    if (Is.Object(statement)) {
      let newStatement: any = {}

      Object.keys(statement).forEach(key => {
        newStatement[reverseDictionary[key]] = statement[key]
      })

      // @ts-ignore
      this.DB.buildWhere(statement)

      return this
    }
  }

  /**
   * Build a join query to be used inside other Model methods. You can
   * call this method as many times as you want
   */
  static includes<Class extends typeof Model>(
    this: Class,
    relationName: ModelRelationsKeys<InstanceType<Class>>,
  ): Class {
    const relation = this.relations.find(
      relation => relation.propertyName === relationName,
    )

    if (!relation) {
      throw new NotFoundRelationException(relationName, this.constructor.name)
    }

    relation.isIncluded = true

    const index = this.relations.indexOf(relation)
    this.relations[index] = relation

    return this
  }

  /**
   * Build a groupBy query to be used inside other Model methods. You can
   * call this method as many times as you want
   */
  static groupBy<Class extends typeof Model>(
    this: Class,
    ...columns: ModelPropsKeys<InstanceType<Class>>[]
  ): Class {
    // @ts-ignore
    this.DB.buildGroupBy(...columns)

    return this
  }

  /**
   * Build a orderBy query to be used inside other Model methods. You can
   * call this method as many times as you want
   */
  static orderBy<Class extends typeof Model>(
    this: Class,
    ...columns: ModelPropsKeys<InstanceType<Class>>[]
  ): Class {
    // @ts-ignore
    this.DB.buildOrderBy(...columns)

    return this
  }

  /**
   * Build a skip query to be used inside other Model methods. You can
   * call this method as many times as you want
   */
  static skip<Class extends typeof Model>(this: Class, number: number): Class {
    this.DB.buildSkip(number)

    return this
  }

  /**
   * Build a limit query to be used inside other Model methods. You can
   * call this method as many times as you want
   */
  static limit<Class extends typeof Model>(this: Class, number: number): Class {
    this.DB.buildLimit(number)

    return this
  }

  /**
   * Return only the included relations from relations array and set the included to false again
   */
  static getIncludedRelations() {
    if (!this.relations || !this.relations.length) return []

    return this.relations.reduce((included, relation) => {
      if (relation.isIncluded) {
        included.push({ ...relation, isIncluded: true })

        const index = this.relations.indexOf(relation)
        this.relations[index].isIncluded = false
      }

      return included
    }, [])
  }

  private static reverseColumnDictionary() {
    const reserveDictionary: any = {}

    Object.keys(this.columnDictionary).forEach(
      key => (reserveDictionary[this.columnDictionary[key]] = key),
    )

    return reserveDictionary
  }

  /**
   * Define the static property only if it is not already defined
   */
  private static defineStatic(propName: string, value: any) {
    if (this[propName]) return

    this[propName] = value
  }

  /**
   * Return a Json object from the actual subclass instance
   */
  toJSON(): ModelPropsJson<this> {
    const json: any = {}

    this.class.columns.forEach(column => {
      json[column.propertyName] = this[column.propertyName]
    })

    this.class.relations.forEach(relation => {
      if (!this[relation.propertyName]) return

      if (['belongsTo', 'hasOne'].includes(relation.relationType)) {
        json[relation.propertyName] = this[relation.propertyName].toJSON()

        return
      }

      this[relation.propertyName].forEach(relationData => {
        if (!relationData) return
        if (!json[relation.propertyName]) json[relation.propertyName] = []

        json[relation.propertyName].push(relationData.toJSON())
      })
    })

    if (this.$extras) json.$extras = this.$extras

    return json
  }
}
