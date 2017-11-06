import lowDB       from "lowdb";
import FileSync    from "lowdb/adapters/FileSync";
import Winston     from "winston";
import TG784n      from "managers/TG784n";
import DemoManager from "managers/DemoManager";


// Enviroment specific settings
let env = {
    development: {
        logLevel: "debug",
        heartbeat: 10000,
        database: "database/adam-dev.json"
    },
    production: {
        logLevel: "info",
        heartbeat: 60000,
        database: "database/adam.json"
    }
};
let key = process.env.NODE_ENV || "development";


// Database
let db = lowDB( new FileSync(env[key].database) );

db.defaults({
    active:  [],
    people:  [],
    devices: [],
    bootTime: 0
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


// device managers
let demoManager = new DemoManager({ logger: winston });
let technicolor = new TG784n({
    logger: winston,
    host:     (process.env.MANAGER_HOST   || "127.0.0.1") + ":" + (process.env.MANAGER_PORT || "23"),
    username: (process.env.MANAGER_USER   || "username"),
    password: (process.env.MANAGER_PASSWD || "password")
});
env.development.manager = demoManager;
env.production.manager  = technicolor;


// Configuration object
const config = {
    port: 8080,
    logger: winston,
    database: db,
    heartbeat: env[key].heartbeat,
    deviceManager: env[key].manager
};
export default config;
