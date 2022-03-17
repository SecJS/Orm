/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { InternalServerException } from '@secjs/exceptions'

export class NotFoundRelationException extends InternalServerException {
  public constructor(name: any, className: string) {
    const content = `Relation ${name} not found in model ${className}`

    super(content)
  }
}
