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

    setActive: (device={ mac: Device.mac }, state=true, time=(new Date()).getTime()) => {
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

    exists: (device={ mac: Device.mac }) => {
        return Database.then(db => {
            return db.get("devices").find({ mac: device.mac }).value() ? true : false;
        });
    },

    load: (device={ mac: Device.mac }) => {
        return Database.then(db => {
            let dbDevice = Object.assign(
                (db.get("devices").find({ mac: device.mac }).value() || {}), device
            );
            return Object.assign({}, Device, dbDevice);
        });
    },

    save: (device={ mac: Device.mac }) => {
        return Database.then(db => {
            let search = db.get("devices").find({ mac: device.mac });

            if ( search.value() ) {
                return search.assign(device).write();
            } else {
                return db.get("devices").push(device).write();
            }
        });
    },

    delete: (device={ mac: Device.mac }) => {
        return Database.then(db => {
            return db.get("devices").remove({ mac: device.mac }).write();
        });
    }
};

export default Device;