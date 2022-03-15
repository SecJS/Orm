/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Type with only the keys from This. Example: 'id' | 'name'
 */
export type OmitModelMethods<Type> = Omit<
  Type,
  'save' | 'load' | 'toJSON' /* keyof Model */
>
