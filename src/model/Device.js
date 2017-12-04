import Database from "Database";


/*
 * Module that represents a device.
 *
 */

const Device = {
    ip:         "",
    mac:        "",
    name:       "",
    firstSeen:  0,
    lastSeen:   0,

    exists: (key={ mac: device.mac }) => {
        return Database.then(db => {
            let found = db.longTerm.get("devices").find( key ).value();
            return found ? found : false;
        });
    },

    load: (device=Device, key={ mac: device.mac }) => {
        return Database.then(db => {
            let dbDevice = Object.assign(
                (db.longTerm.get("devices").find( key ).value() || {}), device
            );
            return Object.assign({}, Device, dbDevice);
        });
    },

    save: (device=Device, key={ mac: device.mac }) => {
        return Database.then(db => {
            let search = db.longTerm.get("devices").find( key );

            if ( search.value() ) {
                return search.assign(device).write();
            } else {
                return db.longTerm.get("devices").push(device).write();
            }
        });
    },

    delete: (device=Device, key={ mac: device.mac }) => {
        return Database.then(db => {
            return db.longTerm.get("devices").remove( key ).write();
        });
    }
};

export default Device;