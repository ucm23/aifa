
import * as SQLite from 'expo-sqlite';

export const dbName = 'readQR17092025.db';

export const _clear_all_bd = async () => {
    try {
        const db = await SQLite.openDatabaseAsync('readQR16092025');
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
                .catch((error) => console.error(`❌Error creating table \t"": `, error));
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
export const tablePlaces = `places`;

const tables_ = [
    `CREATE TABLE IF NOT EXISTS ${tableAppInformation} (
        id INTEGER PRIMARY KEY UNIQUE, 
        ip_address_v4 TEXT, 
        ip_address_v6 TEXT, 
        browser_type TEXT, 
        application INTEGER DEFAULT 4, 
        version TEXT, 
        latitude REAL, 
        longitude REAL, 
        show_pager INTEGER DEFAULT 1
    );`,
    `CREATE TABLE IF NOT EXISTS ${tablePlaces} (
        id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
        place TEXT,
        dealership INTEGER,
        last_login DATETIME DEFAULT CURRENT_TIMESTAMP,
        logged BOOLEAN DEFAULT false
    );`,
];

const tables_name = [
    tableAppInformation,
    tablePlaces,
];