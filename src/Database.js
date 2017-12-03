import Config     from "Config";
import lowDB      from "lowdb";
import FileAsync  from "lowdb/adapters/FileAsync";
import Memory     from "lowdb/adapters/Memory";


/*
 * Module that bridges access to the database.
 *
 */

let database = {};

let dbPromise = Promise.all([
    lowDB(new Memory()),
    lowDB(new FileAsync( Config.database )) ])
    .then(db => {
        database.shortTerm = db[0];
        database.shortTerm
            .set("network",  [])
            .set("denizens", [])
            .set("location", {})
            .set("weather",  {})
            .set("bootTime", Date.now())
            .write();

        database.longTerm = db[1];
        return database.longTerm.defaults({
            people:   [],
            devices:  [],
        }).write();
    })
    .then(() => {
        dbPromise = false;
        return database;
    });

export default Promise.resolve(dbPromise)
    .then( () => dbPromise ? dbPromise : database );