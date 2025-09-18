import * as SQLite from 'expo-sqlite';

class LightKnex {
  constructor(db) {
    this.db = db;
    this.resetQuery();
  }

  static async init(databaseName = 'readQR17092025.db') {
    try {
      console.log('📦 Abriendo base de datos...');
      const db = await SQLite.openDatabaseAsync(databaseName);
      console.log('✅ Base de datos abierta');
      
      // Initialize tables
      console.log('📊 Creando tablas...');
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS places (
          id INTEGER PRIMARY KEY UNIQUE,
          place TEXT,
          dealership INTEGER,
          last_login DATETIME DEFAULT CURRENT_TIMESTAMP,
          logged BOOLEAN DEFAULT 0
        );
      `);
      console.log('✅ Tablas creadas');
      
      return new LightKnex(db);
    } catch (error) {
      console.error('❌ Error inicializando LightKnex:', error);
      throw error;
    }
  }

  select(...columns) {
    this.query.columns = columns.length > 0 ? columns : ['*'];
    return this;
  }

  from(table) {
    this.query.table = table;
    return this;
  }

  where(conditions) {
    this.query.whereConditions = { ...this.query.whereConditions, ...conditions };
    return this;
  }

  orderBy(column, direction = 'ASC') {
    this.query.orderBy = { column, direction };
    return this;
  }

  limit(max) {
    this.query.limit = max;
    return this;
  }

  async execute() {
    if (!this.query.table) {
      throw new Error('Table not specified. Use .from() method.');
    }

    const { table, columns, whereConditions, orderBy, limit } = this.query;
    
    let sql = `SELECT ${columns.join(', ')} FROM ${table}`;
    let params = [];

    // WHERE clause
    const whereKeys = Object.keys(whereConditions);
    if (whereKeys.length > 0) {
      sql += ` WHERE ${whereKeys.map(key => `${key} = ?`).join(' AND ')}`;
      params = whereKeys.map(key => whereConditions[key]);
    }

    // ORDER BY
    if (orderBy) {
      sql += ` ORDER BY ${orderBy.column} ${orderBy.direction}`;
    }

    // LIMIT
    if (limit) {
      sql += ` LIMIT ${limit}`;
    }

    const result = await this.db.getAllAsync(sql, params);
    this.resetQuery();
    return result;
  }

  async first() {
    this.limit(1);
    const results = await this.execute();
    return results.length > 0 ? results[0] : null;
  }

  // INSERT
  async insert(data) {
    if (!this.query.table) {
      throw new Error('Table not specified. Use .into() method.');
    }

    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');

    const sql = `INSERT INTO ${this.query.table} (${keys.join(', ')}) VALUES (${placeholders})`;
    const result = await this.db.runAsync(sql, values);
    
    this.resetQuery();
    return {
      id: result.lastInsertRowId,
      changes: result.changes
    };
  }

  into(table) {
    this.query.table = table;
    return {
      insert: (data) => this.insert(data)
    };
  }

  // UPDATE
  async update(data) {
    if (!this.query.table) {
      throw new Error('Table not specified.');
    }

    const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = Object.values(data);
    
    let sql = `UPDATE ${this.query.table} SET ${setClause}`;
    let params = [...values];

    // WHERE clause
    const whereKeys = Object.keys(this.query.whereConditions);
    if (whereKeys.length > 0) {
      sql += ` WHERE ${whereKeys.map(key => `${key} = ?`).join(' AND ')}`;
      params = [...params, ...whereKeys.map(key => this.query.whereConditions[key])];
    }

    const result = await this.db.runAsync(sql, params);
    this.resetQuery();
    return result.changes;
  }

  // DELETE
  async delete() {
    if (!this.query.table) {
      throw new Error('Table not specified. Use .from() method.');
    }

    let sql = `DELETE FROM ${this.query.table}`;
    let params = [];

    // WHERE clause
    const whereKeys = Object.keys(this.query.whereConditions);
    if (whereKeys.length > 0) {
      sql += ` WHERE ${whereKeys.map(key => `${key} = ?`).join(' AND ')}`;
      params = whereKeys.map(key => this.query.whereConditions[key]);
    }

    const result = await this.db.runAsync(sql, params);
    this.resetQuery();
    return result.changes;
  }

  // RAW queries
  async raw(sql, params = []) {
    const result = await this.db.getAllAsync(sql, params);
    this.resetQuery();
    return result;
  }

  resetQuery() {
    this.query = {
      table: null,
      columns: ['*'],
      whereConditions: {},
      orderBy: null,
      limit: null
    };
  }

  async close() {
    await this.db.closeAsync();
  }
}

// Singleton instance
let knexInstance = null;

export const initKnex = async (databaseName = 'readQR17092025.db') => {
  try {
    if (!knexInstance) {
      knexInstance = await LightKnex.init(databaseName);
    }
    return knexInstance;
  } catch (error) {
    console.error('❌ Error en initKnex:', error);
    throw error;
  }
};

export const getKnex = () => {
  if (!knexInstance) {
    throw new Error('Knex not initialized. Call initKnex() first.');
  }
  return knexInstance;
};

// Función para verificar el estado de la BD
export const isDatabaseInitialized = () => {
  return knexInstance !== null;
};