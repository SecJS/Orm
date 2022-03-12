/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Env } from '@secjs/env'
import { Path } from '@secjs/utils'

export default {
  /*
  |--------------------------------------------------------------------------
  | Default Database Connection Name
  |--------------------------------------------------------------------------
  |
  | Here you may specify which of the database connections below you wish
  | to use as your default connection for all database work. Of course
  | you may use many connections at once using the Database library.
  |
  */
  default: Env('DB_CONNECTION', 'postgres'),

  /*
  |--------------------------------------------------------------------------
  | Database Connections
  |--------------------------------------------------------------------------
  |
  | Here are each of the database connections setup for your application.
  | Of course, examples of configuring each database platform that is
  | supported by SecJS is shown below to make development simple.
  |
  */

  connections: {
    sqlite: {
      driver: 'sqlite',
      filename: Env('DB_FILENAME', Path.database('sqlite')),
    },

    mysql: {
      driver: 'mysql',
      url: Env('DB_URL', ''),
      host: Env('DB_HOST', '127.0.0.1'),
      port: Env({ type: 'number', name: 'DB_PORT' }, 3306),
      database: Env('DB_DATABASE', 'mysql'),
      user: Env('DB_USERNAME', 'root'),
      password: Env('DB_PASSWORD', ''),
    },

    postgres: {
      driver: 'postgres',
      url: Env('DB_URL', ''),
      host: Env('DB_HOST', '127.0.0.1'),
      port: Env({ type: 'number', name: 'DB_PORT' }, 5433),
      database: Env('DB_DATABASE', 'postgres'),
      user: Env('DB_USERNAME', 'postgres'),
      password: Env('DB_PASSWORD', 'root'),
    },

    sqlserver: {
      driver: 'sqlserver',
      url: Env('DB_URL', ''),
      host: Env('DB_HOST', '127.0.0.1'),
      port: Env({ type: 'number', name: 'DB_PORT' }, 1433),
      database: Env('DB_DATABASE', 'sqlserver'),
      user: Env('DB_USERNAME', 'root'),
      password: Env('DB_PASSWORD', ''),
    },

    mongo: {
      driver: 'mongo',
      protocol: 'mongodb',
      url: Env('DB_URL', ''),
      host: Env('DB_HOST', '127.0.0.1'),
      port: Env({ type: 'number', name: 'DB_PORT' }, 27017),
      database: Env('DB_DATABASE', 'mongodb'),
      user: Env('DB_USERNAME', ''),
      password: Env('DB_PASSWORD', ''),
      options: {
        w: 'majority',
        replicaSet: 'rs',
        retryWrites: true,
        authSource: 'admin',
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    },
  },

  /*
  |--------------------------------------------------------------------------
  | Migration Repository Table
  |--------------------------------------------------------------------------
  |
  | This table keeps track of all the migrations that have already run for
  | your application. Using this information, we can determine which of
  | the migrations on disk haven't actually been run in the database.
  |
  */

  migrations: 'migrations',
}
