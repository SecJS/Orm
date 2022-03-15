/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { DatabaseContract } from '@secjs/database'
import { ModelFactory } from './Utils/ModelFactory'
import { ModelPropsKeys } from './Types/ModelPropsKeys'
import { ModelPropsJson } from './Types/ModelPropsJson'
import { PaginatedResponse, String } from '@secjs/utils'
import { DatabaseConnection } from './DatabaseConnection'
import { InternalServerException } from '@secjs/exceptions'
import { ColumnContract } from './Contracts/ColumnContract'
import { ModelPropsRecord } from './Types/ModelPropsRecord'
import { ModelRelationsKeys } from './Types/ModelRelationsKeys'
import { RelationContract } from './Contracts/RelationContract'

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

  static DB: DatabaseContract
  static Factory: ModelFactory

  protected get class(): typeof Model {
    return this.constructor as typeof Model
  }

  static boot() {
    if (this.booted) return

    this.booted = true

    this.defineStatic('columns', [])
    this.defineStatic('relations', [])
    this.defineStatic('primaryKey', 'id')
    this.defineStatic('columnDictionary', {})
    this.defineStatic('connection', 'default')
    this.defineStatic('table', String.toSnakeCase(String.pluralize(this.name)))

    this.Factory = new ModelFactory(this.connection)
    this.DB = new DatabaseConnection().getDatabase(this.connection)
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

  static async find<Class extends typeof Model>(
    this: Class,
  ): Promise<InstanceType<Class>> {
    const flatData = await this.DB.buildTable(this.table).find()

    return this.Factory.fabricate(flatData, this)
  }

  static async findMany<Class extends typeof Model>(
    this: Class,
  ): Promise<InstanceType<Class>[]> {
    const flatData = await this.DB.buildTable(this.table).findMany()

    return this.Factory.fabricate(flatData, this)
  }

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

  static async forPage<Class extends typeof Model>(
    this: Class,
    page: number,
    limit: number,
  ): Promise<InstanceType<Class>[]> {
    const flatData = await this.DB.forPage(page, limit)

    return this.Factory.fabricate(flatData, this)
  }

  static async create<Class extends typeof Model>(
    this: Class,
    values: ModelPropsRecord<InstanceType<Class>>,
  ): Promise<InstanceType<Class>> {
    const [id] = await this.DB.insert(values)

    return this.where('id', id).find()
  }

  static async update<Class extends typeof Model>(
    this: Class,
    key:
      | ModelPropsKeys<InstanceType<Class>>
      | ModelPropsRecord<InstanceType<Class>>,
    value?: ModelPropsRecord<InstanceType<Class>>,
  ): Promise<InstanceType<Class>> {
    const [id] = await this.DB.update(key, value)

    return this.where('id', id).find()
  }

  static async delete(): Promise<void> {
    await this.DB.delete()
  }

  static where<Class extends typeof Model>(
    this: Class,
    statement:
      | string
      | ModelPropsKeys<InstanceType<Class>>
      | ModelPropsRecord<InstanceType<Class>>,
    value?: any,
  ): Class {
    // @ts-ignore
    this.DB.buildWhere(statement, value)

    return this
  }

  static includes<Class extends typeof Model>(
    this: Class,
    relationName: ModelRelationsKeys<InstanceType<Class>>,
  ): Class {
    const relation = this.relations.find(
      relation => relation.propertyName === relationName,
    )

    if (!relation) {
      throw new InternalServerException(
        `Relation ${relationName} not found in model ${this.constructor.name}`,
      )
    }

    relation.isIncluded = true

    const index = this.relations.indexOf(relation)
    this.relations[index] = relation

    return this
  }

  static groupBy<Class extends typeof Model>(
    this: Class,
    ...columns: ModelPropsKeys<InstanceType<Class>>[]
  ): Class {
    // @ts-ignore
    this.DB.buildGroupBy(...columns)

    return this
  }

  static orderBy<Class extends typeof Model>(
    this: Class,
    ...columns: ModelPropsKeys<InstanceType<Class>>[]
  ): Class {
    // @ts-ignore
    this.DB.buildOrderBy(...columns)

    return this
  }

  static skip<Class extends typeof Model>(this: Class, number: number): Class {
    this.DB.buildSkip(number)

    return this
  }

  static limit<Class extends typeof Model>(this: Class, number: number): Class {
    this.DB.buildLimit(number)

    return this
  }

  private static defineStatic(propName: string, value: any) {
    if (this[propName]) return

    this[propName] = value
  }

  toJSON(): ModelPropsJson<this> {
    return this.class.Factory.fabricateJson(this)
  }
}
