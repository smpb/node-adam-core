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
database.set("timestamp", Date.now()).write();


// workers
let wName = "DevicesWorker";
let devicesWorker = new Worker({
    name: wName,
    heartbeat: Config.heartbeat,
    action: () => {
        manager.getActiveDevices( (error, data) => {
            if (error) { logger.error(`[${wName}] ${error}`); }
            else {
                let nActive = [];
                let currentTime = Date.now();

                database.get("active").value().forEach(device => {
                    if ( data.devices.find((d) => { return device.mac === d.mac; }) ) {
                        nActive.push(device);
                    } else {
                        let absentDevice = database.get("devices").find({mac : device.mac}).value();
                        logger.info(`[${wName}] Device [${absentDevice.mac} / ${absentDevice.name}] has LEFT the network.`);
                    }
                });

                data.devices.forEach(device => {
                    let known = database.get("devices").find({mac : device.mac}).value();

                    if (! known) { database.get("devices").push(device).write(); }

                    if (! (nActive.find( (d) => { return device.mac === d.mac; } )) ) {
                        nActive.push({ mac : device.mac, timestamp : currentTime });
                        logger.info(`[${wName}] Device [${device.mac} / ${device.name}] has JOINED the network.`);
                    }

                    let debugMessage = `[${wName}] Device [${device.mac} / ${device.name}] has IP '${device.ip}'`;
                    debugMessage = debugMessage + (known ? "." : " and I'm seeing it for the first time!");
                    logger.debug( debugMessage );
                });

                database.set("active", nActive).write();
            }
        });
    }
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
