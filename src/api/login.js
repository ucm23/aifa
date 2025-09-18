
import * as SQLite from 'expo-sqlite';
import * as Network from 'expo-network';
import { dbName, tablePlaces } from '../lib/__init_tables__';
import { SUPABASE_KEY, SUPABASE_URL } from './check_flight';
import axios from 'axios';
import { attributesStringOKOKCreate, attributesStringOKOKUpdate, selectbyID, simpleSelect } from '../lib/main';
import { getKnex } from '../lib/knexConfig';

export const login = async ({ id, dealership }) => {

    let fetch = { status: 0 };

    try {
        const db = await SQLite.openDatabaseAsync(dbName);
        console.log("🚀 ~ login ~ db:", db)
        //const knex = getKnex()
        const data = {
            _dealership: dealership,
            _id: id,
        };

        const response = await axios.post(
            `${SUPABASE_URL}/rest/v1/rpc/get_place_by_id_and_dealership`,
            data,
            {
                headers: {
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (response?.status === 200) {
            const response_data = response?.data[0];
            console.log("🚀 ~ login ~ response_data:", response_data);

            const placeId = response_data?.id;

            const row = await db.getFirstAsync(
                `SELECT * FROM places;`,
                []
            );
            console.log("🚀 ~ login ~ row:", row)

            // Buscar si ya existe en SQLite
            const selectQuery = `SELECT * FROM ${tablePlaces} WHERE id = ?;`;
            console.log("🚀 ~ login ~ selectQuery:", selectQuery, [placeId]);

            console.log("DB abierta:", db);

            const finder_user = await db.getAllAsync(selectQuery, placeId);
            console.log("🚀 ~ login ~ finder_user:", finder_user);

            if (!finder_user || finder_user.length === 0) {
                // INSERTAR nuevo registro
                const insertQuery = `
                    INSERT INTO ${tablePlaces} 
                    (id, place, dealership, last_login, logged) 
                    VALUES 
                    (?, ?, ?, ?, ?);
                `;

                const values = [
                    placeId,
                    response_data.name,
                    response_data.dealership,
                    new Date().toISOString(),
                    1 // logged = true (1)
                ];

                console.log("🚀 ~ login ~ insertQuery:", insertQuery, values);

                const result = await db.runAsync(insertQuery, values);
                console.log(
                    `ID ${tablePlaces} INSERTADO: `,
                    result?.lastInsertRowId,
                    "CAMBIOS: ",
                    result?.changes
                );
            } else {
                // ACTUALIZAR registro existente
                const updateQuery = `
                    UPDATE ${tablePlaces} 
                    SET last_login = ?, 
                    logged = ? 
                    WHERE id = ?;
                `;

                const values = [
                    new Date().toISOString(), // last_login
                    1, // logged = true (1)
                    placeId // id for WHERE clause
                ];

                console.log("🚀 ~ login ~ updateQuery:", updateQuery, values);

                const result = await db.runAsync(updateQuery, values);
                console.log(
                    "ID ACTUALIZADO: ",
                    result?.lastInsertRowId,
                    "CAMBIOS: ",
                    result?.changes
                );
            }

            fetch.status = 1;
        }
    } catch (error) {
        console.error("catch login ~ error", error);
        // Agregar más detalles del error
        if (error.message) {
            console.error("Error message:", error.message);
        }
    } finally {
        //await db.closeAsync(); // Cerrar la conexión
        return fetch;
    }
};

export const logout = async ({ id }) => {
    const response = {};
    try {
        const db = await SQLite.openDatabaseAsync(dbName);

        console.log("🚀 ~ logout ~ db:", db);
        console.log("🚀 ~ logout ~ id:", id);
        console.log("🚀 ~ logout ~ tablePlaces:", tablePlaces);

        /*await db.execAsync(`
        CREATE TABLE IF NOT EXISTS places (
            id INTEGER PRIMARY KEY,
            last_login TEXT,
            logged INTEGER
        );`);*/


        const row = await db.getFirstAsync(
            `SELECT * FROM places;`,
            []
        );
        console.log("🚀 Row antes del UPDATE:", row);

        const result = await db.runAsync(
            `UPDATE ${tablePlaces} SET last_login = ?, logged = ? WHERE id = ?;`,
            [new Date().toISOString(), 0, id]
        );

        console.log("🚀 ~ logout ~ result:", result);

        response.status = true;
    } catch (error) {
        console.error("🚀 ~ logout ~ error:", error);
        response.status = false;
    } finally {
        return response;
    }
};



export const useAuthentificationLogged = () => {

    const login_offline = async ({ id, dealership }) => {
        const db = await SQLite.openDatabaseAsync(dbName);
        let fetch = { status: false }
        try {
            let data = { id: id, dealership: dealership };

            let condition = [{ name: "id", value: `${data?.id}` }, { name: "dealership", value: `${data?.dealership}` }];
            let query = simpleSelect({ condition, table: tablePlaces, })
            const [finder_user_obj] = await db.getAllAsync(query, []);

            if (finder_user_obj) {
                const newObj = {
                    last_login: new Date().toISOString(),
                    logged: true,
                    id: finder_user_obj?.id
                }

                let sets = attributesStringOKOKUpdate({ obj: newObj, attributes: true, id: true })
                let values = attributesStringOKOKUpdate({ obj: newObj, values: true, id: true })
                query = `UPDATE ${tablePlaces} SET ${sets};`
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
            let query = `SELECT id, place, dealership, MAX(last_login) FROM ${tablePlaces} WHERE logged = 1;`
            const user_log_last = await db.getAllAsync(query, []);
            console.log("🚀 ~ get_last_login ~ user_log_last:", user_log_last)
            if (user_log_last[0]?.id) {
                fetch = { status: true, data: user_log_last[0] }
            } else console.log('No hay login')
        } catch (error) {
            console.error("get_last_login ~ error", error)
        } finally {
            return fetch
        }
    }

    return {
        login_offline,
        get_last_login,
    };
};