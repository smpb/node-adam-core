import Database from "Database";


/*
 * Module that represents the home.
 *
 */

const Home = {

    personEntered: (person, time=(new Date()).getTime()) => {
        return Promise.all([ Database, Home.isPersonInside(person) ])
            .then(values => {
                let [db, inside] = values;

                if (! inside) {
                    return db.shortTerm.get("denizens")
                        .push({ person : person.email, enterTime : time })
                        .write();
                }
    });
    },

    personExited: (person, time=(new Date()).getTime()) => {
        return Database.then(db => {
            return db.shortTerm.get("denizens")
                .remove({ person : person.email })
                .write();
        });
    },

    getPeopleInside: () => {
        return Database.then(db => {
            return db.shortTerm.get("denizens").value();
        });
    },

    isPersonInside: (person, key={ email : person.email}) => {
        return Database.then(db => {
            return db.shortTerm.get("denizens").find( key ).value() ? true : false;
        });
    },

    deviceConnected: (device, time=(new Date()).getTime()) => {
        return Promise.all([ Database, Home.isDeviceConnected(device) ])
            .then(values => {
                let [db, connected] = values;

                if (! connected) {
                    return db.shortTerm.get("network")
                        .push({ mac : device.mac, joinTime : time })
                        .write();
                }
        });
    },

    deviceDisconnected: (device, time=(new Date()).getTime()) => {
        return Database.then(db => {
            return db.shortTerm.get("network")
                .remove({ mac : device.mac })
                .write();
        });
    },

    getConnectedDevices: () => {
        return Database.then(db => {
            return db.shortTerm.get("network").value();
        });
    },

    isDeviceConnected: (device, key={ mac : device.mac}) => {
        return Database.then(db => {
            return db.shortTerm.get("network").find( key ).value() ? true : false;
        });
    },
};

export default Home;