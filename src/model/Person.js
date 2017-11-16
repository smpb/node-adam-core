import Database from "Database";


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

    empathy: (k, x) => {
        if (x == 0) return x;
        return Math.round(k / (.1 * x));
    },

    exists: (key={ email: Person.email }) => {
        return Database.then(db => {
            return db.get("people").find( key ).value() ? true : false;
        });
    },

    load: (key={ email: Person.email }) => {
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