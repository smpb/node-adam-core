import express from "express";
import Config  from "Config";
import Worker  from "Worker";

/*
 * A. D. A. M. - Automations, Devices, and Alerts, Manager
 *
 */

let database = Config.database;
let manager  = Config.deviceManager;
let logger   = Config.logger;
let adam     = express();


// init
database.set("active", []).write();
database.set("bootTime", Date.now()).write();


// workers
let devicesWorker = new Worker({
    name: "DevicesWorker",
    heartbeat: Config.heartbeat,
    action: () => {
        manager.getActiveDevices()
            .then( data => {
                database.get("active").value().forEach(device => {
                    if (! data.devices.find((d) => { return device.mac === d.mac; }) ) {
                        let absentDevice = database.get("devices").find({mac : device.mac}).value();
                        devicesWorker.emit("deviceDisconnected", { device : absentDevice, timestamp : data.timestamp });
                    }
                });

                data.devices.forEach(device => {
                    let known = database.get("devices").find({mac : device.mac}).value();

                    if (! known) {
                        devicesWorker.emit("newDevice", { device : device, timestamp : data.timestamp });
                    } else {
                        devicesWorker.emit("deviceHeartbeat", { device : device, timestamp : data.timestamp });
                    }

                    if (! database.get("active").find({ mac : device.mac}).value() ) {
                        devicesWorker.emit("deviceConnected", { device : device, timestamp : data.timestamp });
                    }
                });
            })
            .catch( error => { devicesWorker.emit("error", error); });
    }
});
devicesWorker.on("error", (error) => { logger.error(`[${devicesWorker.moduleName}] ${error}`); });

devicesWorker.on("newDevice", (data) => {
    logger.info(`[${devicesWorker.moduleName}] Device [${data.device.mac} / ${data.device.name}] is NEW.`);
    data.device.lastSeen = data.timestamp;
    database.get("devices").push(data.device).write();
});
devicesWorker.on("deviceHeartbeat", (data) => {
    logger.debug(`[${devicesWorker.moduleName}] Device [${data.device.mac} / ${data.device.name}] has IP '${data.device.ip}'.`);
    database.get("devices").find({ mac : data.device.mac }).assign({ lastSeen: data.timestamp }).write();
});
devicesWorker.on("deviceConnected", (data) => {
    logger.info(`[${devicesWorker.moduleName}] Device [${data.device.mac} / ${data.device.name}] has JOINED the network.`);
    database.get("active").push({ mac : data.device.mac, joinTime : data.timestamp }).write();
});
devicesWorker.on("deviceDisconnected", (data) => {
    logger.info(`[${devicesWorker.moduleName}] Device [${data.device.mac} / ${data.device.name}] has LEFT the network.`);
    database.get("active").remove({mac : data.device.mac}).write();
});
devicesWorker.start();


// routes
adam.get("/", (req, res) => {
    let serverTime = database.get("timestamp").value();
    let currentTime = Date.now();
    let elapsed = Math.round((currentTime - serverTime) / 1000);

    res.send(`A.D.A.M. : online for ${elapsed} seconds.`);
});

adam.get("/devices", (req, res) => {
    let devices = database.get("active").value();
    res.json( devices );
});

adam.listen( Config.port );
