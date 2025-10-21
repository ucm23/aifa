
import * as SQLite from 'expo-sqlite';

export const dbName = 'readQr_13_10_2025.db';

export const _clear_all_bd = async () => {
    try {
        //const db = await SQLite.openDatabaseAsync('readQR16092025');
        const db = await SQLite.openDatabaseAsync('readQr_13_10_2025.db');
        for (const element of tables_name || []) {
            await db.execAsync(`DELETE FROM ${element};`).then(() => console.log(`❌ Table delete ${element}`))
                .catch((error) => console.error(`❌Error creating table \t"": `, error));
        }
    } catch (error) {
        console.log("🚀 ~ file: _init_.js:73 ~ error:", error)
    }
};

export const useCreateTables = async () => {
    const db = await SQLite.openDatabaseAsync(dbName);
    try {
        for (const element of tables_ || []) {
            const match = element.match(/CREATE TABLE IF NOT EXISTS (\w+)/i);
            const tableName = match ? match[1] : "UNKNOWN";
            await db.execAsync(element).then(() => console.log(`✅ Table created OK ${tableName}`))
                .catch((error) => console.error(`❌Error creating table \t"tableName": `, error));
        }
    } catch (error) {
        console.log("🚀 ~ useCreateTables ~ error:", error)

    } finally {
        if (db) {
            await db.closeAsync();
        }
    }
}

export const tableAppInformation = `AppInformation`;
export const tableUsers = `users`;

const tables_ = [
    /*`CREATE TABLE IF NOT EXISTS ${tableAppInformation} (
        id INTEGER PRIMARY KEY UNIQUE, 
        ip_address_v4 TEXT, 
        ip_address_v6 TEXT, 
        browser_type TEXT, 
        application INTEGER DEFAULT 4, 
        version TEXT, 
        latitude REAL, 
        longitude REAL, 
        show_pager INTEGER DEFAULT 1
    );`,*/
    `CREATE TABLE IF NOT EXISTS ${tableUsers} (
        id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
        id_ TEXT,
        email TEXT,
        password TEXT,
        name TEXT,
        role TEXT,
        token TEXT,
        dealership INTEGER,
        place TEXT,
        place_id TEXT,
        lanes TEXT,
        lane TEXT,
        direction TEXT,
        lane_active TEXT,
        direction_active TEXT,
        last_login DATETIME DEFAULT CURRENT_TIMESTAMP,
        logged BOOLEAN DEFAULT false
    );`,
];

const tables_name = [
    //tableAppInformation,
    tableUsers,
];