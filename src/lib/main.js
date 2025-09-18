
import { Platform } from 'react-native';

export const os = Platform.OS === 'ios' ? 'iOS' : 'Android'
export const os_ = Platform.OS === 'ios';
export const version = "16-09-2025";

export const attributesStringOKCreate = ({ obj, id, values, attributes }) => {
    if (values) {
        let valuesArray = Object.keys(obj)./*filter(key => key !== 'id')*/map(key => obj[key]);
        /*if (id && obj.hasOwnProperty('id')) {
            valuesArray.push(obj.id);
        }*/
        return valuesArray;
    }

    if (attributes) {
        let attributesString = Object.keys(obj)
            //.filter(key => key !== 'id')
            .join(', ');
        /*if (id && obj.hasOwnProperty('id')) {
            attributesString += ', id';
        }*/
        return attributesString;
    }
};
export const attributesStringOKUpdate = ({ obj, id = false, values = false, attributes = false }) => {
    const keys = Object.keys(obj);
    if (values) {
        let valuesArray = keys.map(key => obj[key]);
        if (id && obj.hasOwnProperty('id')) {
            valuesArray.push(obj.id);
        }
        return valuesArray;
    }
    if (attributes) {
        let attributesString = keys
            .map(key => `${key} = ?`)
            .join(', ');
        if (id && obj.hasOwnProperty('id')) {
            attributesString += ` where id = ?`;
        }
        return attributesString;
    }
};
export const attributesStringOKOKUpdate = ({ obj, id = false, values = false, attributes = false }) => {
    const keys = Object.keys(obj);
    if (values) {
        let valuesArray = keys.filter(key => key !== 'id').map(key => obj[key]);
        if (id && obj.hasOwnProperty('id')) valuesArray.push(obj.id);
        return valuesArray;
    }
    if (attributes) {
        let attributesString = keys.filter(key => key !== 'id').map(key => `${key} = ?`).join(', ');
        if (id && obj.hasOwnProperty('id')) attributesString += ` where id = ?`;
        return attributesString;
    }
};

export const attributesStringOKOKCreate = ({ obj, values, attributes, ask }) => {
    const keys = Object.keys(obj);
    if (values) return Object.keys(obj).map(key => obj[key]);
    if (attributes) return Object.keys(obj).join(', ');
    if (ask) return new Array(keys.length).fill('?').join(', ')
};

export const insertTable = ({ table, obj }) => {
    const keys = Object.keys(obj);
    return {
        query: `INSERT INTO ${table} (${Object.keys(obj).join(', ')}) VALUES (${new Array(keys.length).fill('?').join(', ')});`,
        values: keys.map(key => obj[key])
        //Object.keys(obj).map(key => obj[key])

    }
};

export const updateTable = ({ obj, table }) => {
    const keys = Object.keys(obj);
    let set = keys.filter(key => key !== 'id').map(key => `${key} = ?`).join(', ');
    if (obj.hasOwnProperty('id')) set += ` where id = ?`;
    let values = keys.filter(key => key !== 'id').map(key => obj[key]);
    if (obj.hasOwnProperty('id')) values.push(obj.id);
    return {
        query: `UPDATE ${table} SET ${set};`,
        values
    }
};

export const createItem = ({ item, table }) => {
    console.log("🚀 ~ create ~ item:", JSON.stringify(item, null, 3))
    const attributes = Object.keys(item).filter(key => item[key] !== null).join(', ');
    const values = Object.keys(item).map(key => {
        if (item[key] === null) return;
        if (typeof item[key] === 'string') return `'${item[key]}'`;
        return item[key];
    }).filter(value => value !== undefined).join(', ');
    return `INSERT OR REPLACE INTO ${table} (${attributes}) VALUES (${values});`
};

export const maxSelectUpdatedCreated = ({ table, created_at, package_id, project_id, removed }) => {
    let column = 'updated_at';
    let condition = '';
    if (created_at) column = `created_at`;
    if (package_id) condition += `AND package_id = ${package_id}`;
    if (project_id) condition += ` AND project_id = ${project_id}`;
    if (removed) condition += ` AND removed = '${removed}'`;
    let query = `SELECT id, ${column} FROM ${table} WHERE ${column} = (SELECT MAX(${column}) FROM ${table}) ${condition} ORDER BY updated_at DESC LIMIT 1;`;
    console.log("🚀 ~ maxSelectUpdatedCreated ~ query:", query)
    return query;
}

export const deleteManyByID = ({ table, ids }) => {
    let query = `DELETE FROM ${table} WHERE id IN (${ids});`;
    console.log("📋📋📋 ~~ selectbyID query:", query + ";")
    return `${query};`;
}


export const selectbyID = ({ table, column, value }) => {
    let query = `SELECT ${column || 'id'} FROM ${table} WHERE ${column || 'id'} = ${value}`;
    console.log("📋📋📋 ~~ selectbyID query:", query + ";")
    return `${query};`;
}

export const simpleSelect = ({ table, condition, columns = [] }) => {
    let column = '*'
    if (columns.length >= 1) column = columns.join(', ');
    let query = `SELECT ${column} FROM ${table} WHERE ${condition[0]?.name} = ${condition[0]?.value}`;
    if (condition.length > 1) {
        for (let index = 1; index < condition.length; index++) {
            query += ` AND ${condition[index]?.name} = ${condition[index]?.value}`
        }
    }
    return `${query};`;
}

export const query = ({ table, condition = [], columns = [], order, column_order }) => {
    let column = '*'
    if (columns.length >= 1) column = columns.join(', ');
    let query = `SELECT ${column} FROM ${table}`;
    if (condition.length >= 1) {
        query += ` WHERE ${condition[0]?.name} ${condition[0]?.operador || '='} ${condition[0]?.value}`
        for (let index = 1; index < condition.length; index++) {
            query += ` AND ${condition[index]?.name} ${condition[1]?.operador || '='} ${condition[index]?.value}`
        }
    }
    if (order) query += ` ORDER BY ${column_order ? column_order : 'id'} ${orders[order]}`;
    console.log("📋📋📋 ~~ QUERY query:", query + ";")
    return `${query};`;
}