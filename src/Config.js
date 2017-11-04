import Winston from "winston";
import TG784n  from "./managers/TG784n";


// Enviroment specific settings
let env = {
    development: {
        logLevel: "debug"
    },
    production: {
        logLevel: "info"
    }
};
let key = process.env.NODE_ENV || "development";


// Logger
let winston = new Winston.Logger({
    level: env[key].logLevel,
    transports: [
        new (Winston.transports.Console)({
            timestamp: function() { let d = new Date(); return d.toISOString(); },
            formatter: function(options) {
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

// unsafe resilience to "unexpected" interruptions
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
    deviceManager: technicolor
};
export default config;
