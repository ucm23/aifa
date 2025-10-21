
import * as SQLite from 'expo-sqlite';
import * as Network from 'expo-network';
import { dbName, tableUsers } from '../lib/__init_tables__';
import axios from 'axios';
import { attributesStringOKOKCreate, attributesStringOKOKUpdate, selectbyID, simpleSelect } from '../lib/main';
import Fetcher from '../lib/Fetcher';

import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

export const saveData = async (key, value) => {
    await SecureStore.setItemAsync(key, JSON.stringify(value));
}

export const getData = async (key) => {
    let result = await SecureStore.getItemAsync(key);
    if (result) return JSON.parse(result);
}

export const login = async ({ id, dealership, email, password }) => {

    let fetch = { status: 0, data: null };
    try {
        const data = {
            email: email.trim(),
            password: password?.trim()
        };
        let response = await Fetcher({
            method: 'POST',
            url: 'auth/login',
            data: JSON.stringify(data)
        });

        //Alert.alert('Response Status: ', JSON.stringify(response, null, 4));

        if (response?.status === 200) {
            fetch.status = 1;
            fetch.data = response?.data
        }
    } catch (error) {
        console.error("catch login ~ error", error);
        if (error.message) {
            console.error("Error message:", error.message);
        }
    } finally {
        return fetch;
    }
};

export const saveDataLogin = async ({ response_data, lane, direction, email, password, login }) => {
    //console.log("🚀 ~ saveDataLogin ~ login:", login)

    let fetch = { status: 0, data: null };
    let db = null;

    try {
        db = await SQLite.openDatabaseAsync(dbName);

        //await saveData("local", { response_data, lane, direction, email, password, login })

        //console.log("🚀 ~ login ~ db:", db)
        const data = {
            //_dealership: dealership,
            //_id: id,
            email: email.trim(),
            password: password?.trim()
        };

        const id_ = response_data?.user?.id;

        const selectQuery = `SELECT * FROM ${tableUsers} WHERE id_ = ?;`;
        console.log("🚀 ~ login ~ selectQuery:", selectQuery, [id_]);

        console.log("DB abierta:", db);

        const finder_user = await db.getAllAsync(selectQuery, id_);
        console.log("🚀 ~ login ~ finder_user:", finder_user);

        if (!finder_user || finder_user.length === 0) {
            let insertQuery = ``;
            let values = null;
            if (login) {
                insertQuery = `INSERT INTO ${tableUsers} 
                    (id_, place_id, email, name, role, lanes, token, password) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?);`;
                values = [
                    id_,
                    response_data?.user?.place_id,
                    response_data?.user?.email,
                    response_data?.user?.name,
                    response_data?.user?.role,
                    JSON.stringify(response_data?.lanes),
                    response_data?.token,
                    data.password
                ];
            } else {
                insertQuery = `INSERT INTO ${tableUsers} 
                    (id_, place_id, email, name, role, lanes, token, password, last_login, logged, lane_active, direction_active) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
                values = [
                    id_,
                    response_data?.user?.place_id,
                    response_data?.user?.email,
                    response_data?.user?.name,
                    response_data?.user?.role,
                    JSON.stringify(response_data?.lanes),
                    response_data?.token,
                    data.password,
                    new Date().toISOString(),
                    1,
                    lane, 
                    direction
                ];
            }
            console.log("🚀 ~ login ~ insertQuery:", insertQuery, values);
            const result = await db.runAsync(insertQuery, values);
            console.log(
                `ID ${tableUsers} INSERTADO: `, result?.lastInsertRowId,
                "CAMBIOS: ", result?.changes
            );
            fetch.status = 1
        } else {
            let updateQuery = ``;
            let values = null;
            if (login) {
                updateQuery = `UPDATE ${tableUsers} 
                    SET lanes = ?, token = ?, password = ?
                    WHERE id_ = ?;`;
                values = [
                    JSON.stringify(response_data?.lanes),
                    response_data?.token,
                    data?.password,
                    id_
                ];
            } else {
                updateQuery = `UPDATE ${tableUsers} 
                    SET lanes = ?, token = ?, password = ?, last_login = ?, logged = ?, lane_active = ?, direction_active = ?
                    WHERE id_ = ?;`;
                values = [
                    JSON.stringify(response_data?.lanes),
                    response_data?.token,
                    data?.password,
                    new Date().toISOString(),
                    1,
                    lane,
                    direction,
                    id_
                ];
            }
            console.log("🚀 ~ login ~ updateQuery:", updateQuery, values);
            const result = await db.runAsync(updateQuery, values);
            console.log(
                "ID ACTUALIZADO: ", result?.lastInsertRowId,
                "CAMBIOS: ", result?.changes
            );
            fetch.status = 1
        }

    } catch (error) {
        console.error("catch dataSaveLogin ~ error", error);
        // Agregar más detalles del error
        if (error.message) {
            console.error("Error message:", error.message);
        }
    } finally {
        //await db.closeAsync(); // Cerrar la conexión
        if (db) await db.closeAsync();
        return fetch;
    }
};

export const logout = async ({ id_, id }) => {
    const response = {};
    let db = null;
    try {

        db = await SQLite.openDatabaseAsync(dbName);
        console.log("🚀 ~ logout ~ db:", db);

        const tableCheck = await db.getAllAsync(
            `SELECT name FROM sqlite_master WHERE type='table' AND name=?;`,
            [tableUsers]
        );
        console.log("🚀 ~ Table exists:", tableCheck);

        if (tableCheck.length === 0) {
            throw new Error(`Table ${tableUsers} does not exist`);
        }

        console.log("🚀 ~ logout ~ id_:", id_);
        console.log("🚀 ~ logout ~ id:", id);
        console.log("🚀 ~ logout ~ tableUsers:", tableUsers);

        const deleteQuery = `DELETE FROM ${tableUsers};`;
        console.log("🚀 ~ logout ~ deleteQuery:", deleteQuery);

        await db.runAsync(deleteQuery);
        console.log("🚀 ~ Tabla vaciada exitosamente");

        response.status = true;
    } catch (error) {
        console.error("🚀 ~ logout ~ error:", error);
        response.status = false;
        response.error = error.message;
    } finally {
        if (db) {
            try {
                await db.closeAsync();
            } catch (closeError) {
                console.error("Error closing database:", closeError);
            }
        }
        return response;
    }
};



export const useAuthentificationLogged = () => {

    const login_offline = async ({ email, password, id_ }) => {
        const db = await SQLite.openDatabaseAsync(dbName);
        let fetch = { status: false }
        try {
            let data = { email, password };
            let condition = [{ name: "email", value: `'${email}'` }, { name: "password", value: `'${password}'` }];
            let query = simpleSelect({ condition, table: tableUsers, })
            console.log("🚀 ~ login_offline ~ query:", query)
            const [finder_user_obj] = await db.getAllAsync(query, []);
            console.log("🚀 ~ login_offline ~ finder_user_obj:", finder_user_obj)

            if (finder_user_obj) {
                const newObj = {
                    last_login: new Date().toISOString(),
                    logged: true,
                    id: finder_user_obj?.id
                }

                let sets = attributesStringOKOKUpdate({ obj: newObj, attributes: true, id: true })
                let values = attributesStringOKOKUpdate({ obj: newObj, values: true, id: true })
                query = `UPDATE ${tableUsers} SET ${sets};`
                await db.withTransactionAsync(async () => {
                    const result = await db.runAsync(query, values);
                    console.log(result?.lastInsertRowId, result?.changes);
                    console.log('ID INSERTADO: ', result?.lastInsertRowId, 'CAMBIOS: ', result?.changes);
                });
                let response_data = {
                    ...finder_user_obj,
                }
                fetch = { status: true, data: response_data }
            }
        } catch (error) {
            console.log("login_offline ~ error", error)
        } finally {
            return fetch
        }
    }

    const get_last_login = async () => {
        let fetch = { status: false }
        const db = await SQLite.openDatabaseAsync(dbName);
        try {
            let query = `SELECT id, id_, place_id, logged, last_login, email, password, lanes, MAX(last_login) FROM ${tableUsers} WHERE logged = 1;`
            const user_log_last = await db.getAllAsync(query, []);
            console.log("🚀 ~ get_last_login ~ user_log_last:", user_log_last)
            if (user_log_last[0]?.id) {
                fetch = { status: true, data: user_log_last[0] }
            } else console.log('No hay login')
        } catch (error) {
            console.error("get_last_login ~ error", error)
            fetch.status = 1
        } finally {
            if (db) await db.closeAsync();
            return fetch
        }
    }

    return {
        login_offline,
        get_last_login,
    };
};