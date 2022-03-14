/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Model } from '../Model'
import { PaginatedResponse } from '@secjs/utils'

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
export type ModelPropsKeys<This> = keyof Omit<This, OmittedModelMethods>

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

export interface ModelContract {
  /**
   * Database Methods
   */

  /** Transform the actual data inside the ORM Instance to a JSON */
  toJSON(): ModelPropsRecord<this>

  /** Find one data and return the ORM Instance */
  find(): Promise<this>

  /** Find many data and return an array of ORM Instance */
  findMany(): Promise<this[]>

  /** Find many data and return a paginated response with links, metas and data */
  paginate(
    page: number,
    limit: number,
    resourceUrl: string,
  ): Promise<PaginatedResponse>

  /** Find many data and return a paginated response with data only */
  forPage(page: number, limit: number): Promise<this[]>

  /** Create a new model from values */
  create(values: ModelPropsRecord<this>): Promise<this>

  /** Update the model from values */
  update(values: ModelPropsRecord<this>): Promise<this>

  /** Update the model from values */
  update(key: ModelPropsKeys<this>, value?: any): Promise<this>

  /** Delete the model */
  delete(): Promise<void>

  /**
   * Builder Methods
   */

  /** Add a where clause for concrete methods */
  where(where: ModelPropsRecord<this>): this

  /** Add a where clause for concrete methods */
  where(statement: string, value?: any): this

  /** Add a relation clause for concrete methods */
  includes(relationName: ModelRelationsKeys<this>): this

  /** Add a groupBy clause for concrete methods */
  groupBy(...columns: ModelPropsKeys<this>[]): this

  /** Add a orderBy clause for concrete methods */
  orderBy(column: ModelPropsKeys<this>, direction: 'asc' | 'desc'): this

  /** Add a skip clause for concrete methods */
  skip(number: number): this

  /** Add a limit clause for concrete methods */
  limit(number: number): this
}
