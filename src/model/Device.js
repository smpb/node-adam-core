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

    isActive: () => {
    },

    setActive: (device=Device, state=true, time=(new Date()).getTime()) => {
        return Database.then(db => {
            if (state) {
                return db.get("active")
                    .push({ mac : device.mac, joinTime : time })
                    .write();
            } else {
                return db.get("active").remove({ mac : device.mac })
                    .write();
            }
        });
    },

    exists: (device=Device, key={ mac: device.mac }) => {
        return Database.then(db => {
            return db.get("devices").find( key ).value() ? true : false;
        });
    },

    load: (device=Device, key={ mac: device.mac }) => {
        return Database.then(db => {
            let dbDevice = Object.assign(
                (db.get("devices").find( key ).value() || {}), device
            );
            return Object.assign({}, Device, dbDevice);
        });
    },

    save: (device=Device, key={ mac: device.mac }) => {
        return Database.then(db => {
            let search = db.get("devices").find( key );

            if ( search.value() ) {
                return search.assign(device).write();
            } else {
                return db.get("devices").push(device).write();
            }
        });
    },

    delete: (device=Device, key={ mac: device.mac }) => {
        return Database.then(db => {
            return db.get("devices").remove( key ).write();
        });
    }
};

export default Device;