import Database from "Database";
import Device   from "model/Device";


/*
 * Module that represents a person.
 *
 */

const Person = {
    name:      "",
    email:     "",
    device:    "",
    karma:     0,
    lastSeen:  0,

    device() {
        return Promise.resolve( Device().load({ mac: Person.device }) );
    },

    empathy(k, x) {
        if (x == 0) return x;
        return Math.round(k / (.1 * x));
    },

    load: (key={}) => {
        return Database.then(db => {
            let dbPerson = db.get("people").find( key ).value() || key;
            return Object.assign({}, Person, dbPerson);
        });
    },

    save: (key={ email: Person.email }) => {
        return Database.then( db => {
            let dbSearch = db.get("people").find( key );

            if ( dbSearch.value() ) {
                return search.assign(Person).write();
            } else {
                return db.get("people").push(Person).write();
            }
        });
    },

    delete: (key={ email: Person.email }) => {
        return Database.then( db => {
            return db.get("people").remove( key ).write();
        });
    }
};

export default Person;