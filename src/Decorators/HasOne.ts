/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export interface HasOneOptions {
  model?: any
  foreignKey?: string
  columnName?: string
  relationType?: string
}

/**
 * Define HasOne relationship
 */
export function HasOne(model): PropertyDecorator {
  return (target, propertyKey: string | symbol) => {
    const options: HasOneOptions = {}

    let relations = Reflect.getMetadata('model:relations', target.constructor)

    if (!relations) {
      relations = []

      Reflect.defineMetadata('model:relations', [], target.constructor)
    }

    options.model = model
    options.relationType = 'hasOne'
    options.columnName = String(propertyKey)
    options.foreignKey = `${target.constructor.name.toLowerCase()}Id`

    relations.push(options)

    Reflect.defineMetadata('model:relations', relations, target.constructor)
  }
}
