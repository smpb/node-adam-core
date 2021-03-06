import Database from "Database";


/*
 * Module that represents a person.
 *
 */

const Person = {
    firstName:  "",
    lastName:   "",
    email:      "",
    device:     "",
    karma:      0,
    firstSeen:  0,
    lastSeen:   0,
    trusted:    false,

    empathy: (k, x) => {
        if (x == 0) return x;
        return Math.round(k / (.1 * x));
    },

    exists: (key={ email: person.email }) => {
        return Database.then(db => {
            let found = db.longTerm.get("people").find( key ).value();
            return found ? found : false;
        });
    },

    load: (person=Person, key={ email: person.email }) => {
        return Database.then(db => {
            let dbPerson = Object.assign(
                (db.longTerm.get("people").find( key ).value() || {}), person
            );
            return Object.assign({}, Person, dbPerson);
        });
    },

    save: (person=Person, key={ email: person.email }) => {
        return Database.then(db => {
            let search = db.longTerm.get("people").find( key );

            if ( search.value() ) {
                return search.assign(person).write()
                    .then(() => { return person });
            } else {
                return db.longTerm.get("people").push(person).write()
                    .then(() => { return person });
            }
        });
    },

    delete: (person=Person, key={ email: person.email }) => {
        return Database.then(db => {
            return db.longTerm.get("people").remove( key ).write();
        });
    }
};

export default Person;