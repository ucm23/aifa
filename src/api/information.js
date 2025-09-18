
import * as Network from 'expo-network';
import * as SQLite from 'expo-sqlite';
import { dbName, tableAppInformation } from '../lib/__init_tables__';
import { os, version } from '../lib/main';



export const indexInformation = async () => {
    const db = await SQLite.openDatabaseAsync(dbName);
    try {
        let id = 1
        const [result] = await db.getAllAsync(
            `SELECT * FROM ${tableAppInformation} WHERE id = ?;`,
            [id]
        );
        if (!result) {
            const ip = await Network.getIpAddressAsync();
            console.log("🚀 ~ indexInformation ~ ip:", ip)
            const props = {
                id,
                ip_address_v4: ip,
                ip_address_v6: ip,
                browser_type: `${os} ${version}`,
                application: 4,
                version,
                show_pager: true,
            }
            await db.withTransactionAsync(async () => {
                await db.runAsync(
                    `INSERT INTO AppInformation (id,ip_address_v4,ip_address_v6,browser_type,application,version,show_pager) VALUES (?, ?, ?, ?, ?, ?, ?);`,
                    [
                        props?.id,
                        props?.ip_address_v4,
                        props?.ip_address_v6,
                        props?.browser_type,
                        props?.application,
                        props?.version,
                        props?.show_pager,
                    ]
                );
            });
        }
    } catch (error) {
        console.error("🚀 ~ const indexInformation= ~ error:", error);
    }
};

export const indexInformationById = async () => {
    const db = await SQLite.openDatabaseAsync(dbName);
    let item = {}
    try {
        const [result] = await db.getAllAsync(`SELECT * FROM ${tableAppInformation} WHERE id = 1;`, []);
        item = result
    } catch (error) {
        console.error("🚀 ~ const indexInformationById= ~ error:", error);
    } finally {
        return item
    }
};

export const updateInformationById = async ({ id, show_pager }) => {
    const db = await SQLite.openDatabaseAsync(dbName);
    try {
        await db.withTransactionAsync(async () => {
            await db.runAsync(`UPDATE ${tableAppInformation} SET show_pager = ? WHERE id = ?`, [show_pager, id]);
        });
    } catch (error) {
        console.error("🚀 ~ const updateInformationById js= ~ error:", error);
    }
};