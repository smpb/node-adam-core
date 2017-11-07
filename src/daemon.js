import Config    from "Config";
import Worker    from "Worker";
import lowDB     from "lowdb";
import FileAsync from "lowdb/adapters/FileAsync";
import express   from "express";

/*
 * A. D. A. M. - Automations, Devices, and Alerts, Manager
 *
 */
let database = Config.database;
let manager  = Config.deviceManager;
let logger   = Config.logger;
let adam     = express();


// setup
lowDB( new FileAsync( database ) )
    .then( db => {

        // workers
        let devicesWorker = new Worker({
            name: "DevicesWorker",
            heartbeat: Config.heartbeat,
            action: () => {
                manager.getActiveDevices()
                    .then( data => {
                        db.get("active").value().forEach(device => {
                            if (! data.devices.find((d) => { return device.mac === d.mac; }) ) {
                                let absentDevice = db.get("devices").find({mac : device.mac}).value();
                                devicesWorker.emit("deviceDisconnected", { device : absentDevice, timestamp : data.timestamp });
                            }
                        });

                        data.devices.forEach(device => {
                            let known = db.get("devices").find({mac : device.mac}).value();

                            if (! known) {
                                devicesWorker.emit("newDevice", { device : device, timestamp : data.timestamp });
                            } else {
                                devicesWorker.emit("deviceHeartbeat", { device : device, timestamp : data.timestamp });
                            }

                            if (! db.get("active").find({ mac : device.mac}).value() ) {
                                devicesWorker.emit("deviceConnected", { device : device, timestamp : data.timestamp });
                            }
                        });
                    })
                    .catch( error => { devicesWorker.emit("error", error); });
            }
        });
        devicesWorker.on("error", (error) => { logger.error(`[${devicesWorker.moduleName}] ${error}`); });

        devicesWorker.on("newDevice", (data) => {
            data.device.lastSeen = data.timestamp;
            db.get("devices").push(data.device).write().then(() => {
                logger.info(`[${devicesWorker.moduleName}] Device [${data.device.mac} / ${data.device.name}] is NEW.`);
            });
        });
        devicesWorker.on("deviceHeartbeat", (data) => {
            db.get("devices").find({ mac : data.device.mac }).assign({ lastSeen: data.timestamp })
                .write().then(() => {
                    logger.debug(`[${devicesWorker.moduleName}] Device [${data.device.mac} / ${data.device.name}] has IP '${data.device.ip}'.`);
                });
        });
        devicesWorker.on("deviceConnected", (data) => {
            db.get("active").push({ mac : data.device.mac, joinTime : data.timestamp })
                .write().then(() => {
                    logger.info(`[${devicesWorker.moduleName}] Device [${data.device.mac} / ${data.device.name}] has JOINED the network.`);
                });
        });
        devicesWorker.on("deviceDisconnected", (data) => {
            db.get("active").remove({mac : data.device.mac})
                .write().then(() => {
                    logger.info(`[${devicesWorker.moduleName}] Device [${data.device.mac} / ${data.device.name}] has LEFT the network.`);
                });
        });

        adam.set("devicesWorker", devicesWorker);

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

        return db.defaults({
            active:  [],
            people:  [],
            devices: [],
            bootTime: 0
        }).set("active", []).set("bootTime", Date.now()).write();
    })
    .then(() => {
        logger.debug(`[lowDB] Setup of flat file '${database}' complete.`);

        adam.get("devicesWorker").start();
        adam.listen( Config.port );
    });

