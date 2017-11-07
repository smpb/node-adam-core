import Config       from "Config";
import DeviceWorker from "workers/DeviceWorker";
import lowDB        from "lowdb";
import FileAsync    from "lowdb/adapters/FileAsync";
import express      from "express";

/*
 * A. D. A. M. - Automations, Devices, and Alerts, Manager
 *
 */
let database = Config.database;
let manager  = Config.deviceManager;
let logger   = Config.logger;
let adam     = express();


// setup
lowDB(new FileAsync( database ))
    .then( db => {

        // workers
        let deviceWorker = new DeviceWorker({
            heartbeat: Config.heartbeat,
            manager:   manager,
            database : db
        });

        deviceWorker.on("error", (error) => { logger.error(`[${deviceWorker.moduleName}] ${error}`); });
        deviceWorker.on("newDevice", (data) => {
            data.device.lastSeen = data.timestamp;
            db.get("devices").push(data.device).write().then(() => {
                logger.info(`[${deviceWorker.moduleName}] Device [${data.device.mac} / ${data.device.name}] is NEW.`);
            });
        });
        deviceWorker.on("deviceHeartbeat", (data) => {
            db.get("devices").find({ mac : data.device.mac }).assign({ lastSeen: data.timestamp })
                .write().then(() => {
                    logger.debug(`[${deviceWorker.moduleName}] Device [${data.device.mac} / ${data.device.name}] has IP '${data.device.ip}'.`);
                });
        });
        deviceWorker.on("deviceConnected", (data) => {
            db.get("active").push({ mac : data.device.mac, joinTime : data.timestamp })
                .write().then(() => {
                    logger.info(`[${deviceWorker.moduleName}] Device [${data.device.mac} / ${data.device.name}] has JOINED the network.`);
                });
        });
        deviceWorker.on("deviceDisconnected", (data) => {
            db.get("active").remove({mac : data.device.mac})
                .write().then(() => {
                    logger.info(`[${deviceWorker.moduleName}] Device [${data.device.mac} / ${data.device.name}] has LEFT the network.`);
                });
        });

        adam.set("deviceWorker", deviceWorker);

        // routes
        adam.get("/", (req, res) => {
            let serverTime = database.get("timestamp").value();
            let currentTime = Date.now();
            let elapsed = Math.round((currentTime - serverTime) / 1000);

            res.send(`A.D.A.M. : online for ${elapsed} seconds.`);
        });

        adam.get("/devices", (req, res) => {
            let devices = db.get("active").value();
            res.json( devices );
        });

        // database
        return db.defaults({
            active:  [],
            people:  [],
            devices: [],
            bootTime: 0
        }).set("active", []).set("bootTime", Date.now()).write();
    })
    .then(() => {
        adam.get("deviceWorker").start();
        adam.listen( Config.port );
    });

