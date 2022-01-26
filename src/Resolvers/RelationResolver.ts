/**
 * @secjs/orm
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export class RelationResolver {
  private static getProperties(row: any, tableName: string) {
    return Object.getOwnPropertyNames(row).reduce((results, item) => {
      if (item === 'id') results.push({ old: item, new: item })
      if (item.includes(tableName)) {
        results.push({ old: item, new: item.replace(`${tableName}-`, '') })
      }

      return results
    }, [])
  }

  private static resolveInstance(row: any, Class: any) {
    const instance = new Class()
    const tableName = Class.prototype.tableName

    const properties = this.getProperties(row, tableName)

    properties.forEach(property => instance[property.new] = row[property.old])

    return instance
  }

  // TODO ManyToMany
  // static manyToMany() {}

  // TODO ManyToOne
  // static manyToOne() {}

  static oneToMany(flatData: any | any[], OneClass: any, ManyClass: any) {
    if (Array.isArray(flatData)) {
      return Object.values(flatData.reduce((result, row) => {
        result[row.id] = result[row.id] || this.resolveInstance(row, OneClass)

        const tableName = ManyClass.prototype.tableName.replace('Table', '')

        if (!result[row.id][tableName]) result[row.id][tableName] = []
        result[row.id][tableName].push(this.resolveInstance(row, ManyClass))

        return result
      }, {}))
    }

    const data = this.resolveInstance(flatData, OneClass)
    const tableName = ManyClass.prototype.tableName.replace('Table', '')

    data[tableName] = []
    data[tableName].push(this.resolveInstance(flatData, ManyClass))

    return data
  }

  // TODO OneToOne
  // static oneToOne() {}
}

