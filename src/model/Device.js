import Database from "Database";


/*
 * Module that represents a device.
 *
 */

const Device = {
    ip:    "",
    mac:   "",
    name:  "",

    exists: (key={ mac: Device.mac }) => {
        return Database.then(db => {
            return db.get("devices").find( key ).value() ? true : false;
        });
    },

    load: (key={ mac: Device.mac }) => {
        return Database.then(db => {
            let dbDevice = db.get("devices").find( key ).value() || key;
            return Object.assign({}, Device, dbDevice);
        });
    },

    save: (key={ mac: Device.mac }) => {
        return Database.then( db => {
            let dbSearch = db.get("devices").find( key );

            if ( dbSearch.value() ) {
                return search.assign(Device).write();
            } else {
                return db.get("devices").push(Device).write();
            }
        });
    },

    delete: (key={ mac: Device.mac }) => {
        return Database.then( db => {
            return db.get("devices").remove( key ).write();
        });
    }
};

export default Device;