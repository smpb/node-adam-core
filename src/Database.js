import Config     from "Config";
import lowDB      from "lowdb";
import FileAsync  from "lowdb/adapters/FileAsync";


/*
 * Module that bridges access to the database.
 *
 */

let database;

let dbPromise = lowDB(new FileAsync( Config.database ))
    .then(db => {
        database = db;
        return db.defaults({
            people:   [],
            devices:  [],
            location: {},
            weather:  {}
        }).set("active", []).set("bootTime", Date.now()).write();
    })
    .then(() => {
        dbPromise = false;
        return database;
    });

export default Promise.resolve(dbPromise)
    .then( () => dbPromise ? dbPromise : database );