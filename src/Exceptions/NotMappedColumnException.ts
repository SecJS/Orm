/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { InternalServerException } from '@secjs/exceptions'

export class NotMappedColumnException extends InternalServerException {
  public constructor(columnKey: string, className: string) {
    const content = `The field ${columnKey} has not been mapped in some of your @Column annotation in ${className} Model`

    super(content)
  }
}
