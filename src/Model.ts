/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import pluralize from 'pluralize'

// TODO Implement
export abstract class Model {
  static table: string

  constructor() {
    if (!Model.table) Model.table = pluralize(this.constructor.name.toLowerCase())
  }
}
