/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { InternalServerException } from '@secjs/exceptions'

export class DefinitionNotImplementedException extends InternalServerException {
  public constructor(className: string) {
    const content = `The definition method has not been found in your ${className}. To use factory method you need to implement this method.`

    super(content)
  }
}
