/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Database, DatabaseContract } from '@secjs/database'

export class DatabaseConnection {
  private static DB: DatabaseContract = new Database()

  public getDb(): DatabaseContract {
    return DatabaseConnection.DB
  }

  public async connection(connection = 'default') {
    if (connection === 'default') {
      return DatabaseConnection.DB.connect()
    }

    await DatabaseConnection.DB.connection(connection).connect()
  }
}

