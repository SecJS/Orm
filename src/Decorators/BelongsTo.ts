/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export interface BelongsToOptions {
  model?: any
  foreignKey?: string
  columnName?: string
  relationType?: string
}

/**
 * Define BelongsTo relationship
 */
export function BelongsTo(model): PropertyDecorator {
  return (target, propertyKey: string | symbol) => {
    const options: BelongsToOptions = {}

    let relations = Reflect.getMetadata('model:relations', target.constructor)

    if (!relations) {
      relations = []

      Reflect.defineMetadata('model:relations', [], target.constructor)
    }

    options.model = model
    options.foreignKey = 'id'
    options.relationType = 'belongsTo'
    options.columnName = String(propertyKey)

    relations.push(options)

    Reflect.defineMetadata('model:relations', relations, target.constructor)
  }
}
