/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Database } from '@secjs/database'
import { ModelFactory } from './Utils/ModelFactory'
import { ModelPropsKeys } from './Types/ModelPropsKeys'
import { ModelPropsJson } from './Types/ModelPropsJson'
import { PaginatedResponse, String } from '@secjs/utils'
import { OrmQueryBuilder } from './Utils/OrmQueryBuilder'
import { ColumnContract } from './Contracts/ColumnContract'
import { ModelPropsRecord } from './Types/ModelPropsRecord'
import { RelationContractTypes } from './Types/RelationContractTypes'

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
   * Defines the attributes that are allowed to be persisted in Database
   */
  static persistOnly: string[]

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
    this.defineStatic('persistOnly', ['*'])
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

  static query<Class extends typeof Model>(
    this: Class,
  ): OrmQueryBuilder<Class> {
    const DB = new Database().connection(this.connection).buildTable(this.table)
    const Factory = new ModelFactory(this.connection)

    return new OrmQueryBuilder<Class>(this, DB, Factory)
  }

  /**
   * Get one data in DB and return as a subclass instance
   */
  static async find<Class extends typeof Model>(
    this: Class,
    where?: ModelPropsRecord<InstanceType<Class>>,
  ): Promise<InstanceType<Class>> {
    return this.query().where(where).get()
  }

  /**
   * Get many data in DB and return as an array of subclass instance
   */
  static async findMany<Class extends typeof Model>(
    this: Class,
    where?: ModelPropsRecord<InstanceType<Class>>,
  ): Promise<InstanceType<Class>[]> {
    return this.query().where(where).getMany()
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
    where?: ModelPropsRecord<InstanceType<Class>>,
  ): Promise<PaginatedResponse<InstanceType<Class>[]>> {
    return this.query().where(where).paginate(page, limit, resourceUrl)
  }

  /**
   * Get many data paginated in DB and return an array of subclass instance
   */
  static async forPage<Class extends typeof Model>(
    this: Class,
    page: number,
    limit: number,
    where?: ModelPropsRecord<InstanceType<Class>>,
  ): Promise<InstanceType<Class>[]> {
    return this.query().where(where).forPage(page, limit)
  }

  /**
   * Create a new model in DB and return as a subclass instance
   */
  static async create<Class extends typeof Model>(
    this: Class,
    values: ModelPropsRecord<InstanceType<Class>>,
  ): Promise<InstanceType<Class>> {
    return this.query().create(values)
  }

  /**
   * Update a model in DB and return as a subclass instance
   */
  static async update<Class extends typeof Model>(
    this: Class,
    where: ModelPropsRecord<InstanceType<Class>>,
    key:
      | ModelPropsKeys<InstanceType<Class>>
      | ModelPropsRecord<InstanceType<Class>>,
    value?: any,
  ): Promise<InstanceType<Class>> {
    return this.query().where(where).update(key, value)
  }

  /**
   * Delete a model in DB
   */
  static async delete<Class extends typeof Model>(
    this: Class,
    where: ModelPropsRecord<InstanceType<Class>>,
  ): Promise<InstanceType<Class>> {
    return this.query().where(where).delete()
  }

  /**
   * Return only the included relations from relations array and set the included to false again
   */
  static getIncludedRelations(): RelationContractTypes[] {
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

  static reverseColumnDictionary() {
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
