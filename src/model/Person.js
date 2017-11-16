import Database from "Database";


/*
 * Module that represents a person.
 *
 */

const Person = {
    name:       "",
    email:      "",
    device:     "",
    karma:      0,
    firstSeen:  0,
    lastSeen:   0,

    empathy: (k, x) => {
        if (x == 0) return x;
        return Math.round(k / (.1 * x));
    },

    exists: (person={ email: Person.email }) => {
        return Database.then(db => {
            return db.get("people").find({ email: person.email }).value() ? true : false;
        });
    },

    load: (person={ email: Person.email }) => {
        return Database.then(db => {
            let dbPerson = Object.assign(
                (db.get("people").find({ email: person.email }).value() || {}), person
            );
            return Object.assign({}, Person, dbPerson);
        });
    },

    save: (person={ email: Person.email }) => {
        return Database.then(db => {
            let search = db.get("people").find({ email: person.email });

            if ( search.value() ) {
                return search.assign(person).write();
            } else {
                return db.get("people").push(person).write();
            }
        });
    },

    delete: (person={ email: Person.email }) => {
        return Database.then(db => {
            return db.get("people").remove({ email: person.email }).write();
        });
    }
};

export default Person;