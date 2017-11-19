import Winston from "winston";

/*
 * A.D.A.M. configuration
 *
 */

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


// Logger configuration
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


// device manager configurations
env.development.manager = { logger: winston };
env.production.manager  = {
    logger:    winston,
    host:      (process.env.MANAGER_HOST   || "127.0.0.1") + ":" + (process.env.MANAGER_PORT || "23"),
    username:  (process.env.MANAGER_USER   || "username"),
    password:  (process.env.MANAGER_PASSWD || "password")
};


// Telegram
let telegram = {
    token: "<TELEGRAM.ORG BOT KEY>",
    trusted: [ 1 ]
};

// OpenWeatherMap
let weather = {
    token : "<OPENWEATHERMAP.ORG KEY>"
};

// Configuration object
let config = {
    env:            key,
    port:           8080,
    logger:         winston,
    telegram:       telegram,
    weather:        weather,
    database:       env[key].database,
    heartbeat:      env[key].heartbeat,
    deviceManager:  env[key].manager
};
export default config;
