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

  /**
   * TODO Implement cloneDatabase method in @secjs/database.
   *
   * We are using Database as Mono state inside all Model subclasses, this could
   * cause a big problem when handling a lot of requests using builder methods.
   * This method will create a new instance of Database, without creating a new
   * connection with database.
   */
  getDatabase(connection = 'default'): DatabaseContract {
    // return DatabaseConnection.DB.cloneDatabase(connection)
    return DatabaseConnection.DB
  }

  async createConnection(connection = 'default') {
    if (connection === 'default') {
      return DatabaseConnection.DB.connect()
    }

    await DatabaseConnection.DB.connection(connection).connect()
  }
}
