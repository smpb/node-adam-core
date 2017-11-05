import lowDB     from "lowdb";
import FileSync  from "lowdb/adapters/FileSync";
import Winston   from "winston";
import TG784n    from "managers/TG784n";


// Enviroment specific settings
let env = {
    development: {
        logLevel: "debug",
        database: "adam-dev.json"
    },
    production: {
        logLevel: "info",
        database: "adam.json"
    }
};
let key = process.env.NODE_ENV || "development";


// Database
let db = lowDB( new FileSync(env[key].database) );

db.defaults({
    active:  [],
    people:  [],
    devices: [],
    timestamp: 0
}).write();

// Logger
let winston = new Winston.Logger({
    level: env[key].logLevel,
    transports: [
        new (Winston.transports.Console)({
            timestamp: () => { let d = new Date(); return d.toISOString(); },
            formatter: (options) => {
                return `[${options.timestamp()}] ${options.level.toUpperCase()} : ${(options.message ? options.message : "")}`;
            }
        })
    ]
});


// Default device manager
let technicolor = new TG784n({
    logger: winston,
    timeout: 5000,
    host: (process.env.MANAGER_HOST || "127.0.0.1") + ":" + (process.env.MANAGER_PORT || "23"),
    loginPrompt: /Username[: ]+/i,
    passwordPrompt: /Password[: ]+/i,
    failedLoginMatch: /invalid/i,
    shellPrompt: /=>/i,
    username: (process.env.MANAGER_USER   || "username"),
    password: (process.env.MANAGER_PASSWD || "password"),
    comand: "hostmgr list"
});


// Unsafe resilience to "unexpected" interruptions
process
    .on("unhandledRejection", (reason, p) => {
        winston.error(reason, " : unhandled rejection at Promise ", p);
    })
    .on("uncaughtException", (err) => {
        winston.error(err, " : uncaught exception thrown.");
    });


// Configuration object
const config = {
    port: 8080,
    logger: winston,
    database: db,
    deviceManager: technicolor
};
export default config;
