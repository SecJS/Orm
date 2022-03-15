/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Omit keys of type when the key type is from the specified type
 */
export type OmitKeysOfType<
  This,
  Types,
  WithNever = {
    [Key in keyof This]: Exclude<This[Key], undefined> extends Types
      ? never
      : This[Key] extends Record<string, unknown>
      ? OmitKeysOfType<This[Key], Types>
      : This[Key]
  }
> = Pick<
  WithNever,
  {
    [K in keyof WithNever]: WithNever[K] extends never ? never : K
  }[keyof WithNever]
>
