import Config          from "Config";
import Database        from "Database";
import Device          from "model/Device";
import Home            from "model/Home";
import DeviceWorker    from "workers/DeviceWorker";
import LocationWorker  from "workers/LocationWorker";
import DemoManager     from "managers/DemoManager";
import TG784n          from "managers/TG784n";
import express         from "express";
import bodyParser      from "body-parser";


/*
 * A. D. A. M. - Automations, Devices, and Alerts, Manager
 *
 */
let logger   = Config.logger;
let adam     = express();


// workers
let deviceManager = (Config.env == "development") ?
    new DemoManager(Config.deviceManager) :
    new TG784n(Config.deviceManager);

let locationWorker = new LocationWorker();
let deviceWorker   = new DeviceWorker(deviceManager);

deviceWorker.on("error", (error) => { logger.error(`[${deviceWorker.name}] ${error}`); });
deviceWorker.on("newDevice", (data) => {
    data.device.firstSeen = data.time;
    data.device.lastSeen  = data.time;
    Device.save(data.device)
        .then(() => {
            logger.info(`[${deviceWorker.name}] Device [${data.device.mac} / ${data.device.name}] is NEW.`);
        })
        .catch( error => { logger.error(`[${deviceWorker.name}] ${error}`); });
});
deviceWorker.on("deviceHeartbeat", (data) => {
    Device.load({ mac: data.device.mac })
        .then(device => {
            device.lastSeen = data.time;
            return Device.save(device);
        })
        .then(() => {
            logger.debug(`[${deviceWorker.name}] Device [${data.device.mac} / ${data.device.name}] has IP '${data.device.ip}'.`);
        })
        .catch( error => { logger.error(`[${deviceWorker.name}] ${error}`); });
});
deviceWorker.on("deviceConnected", (data) => {
    Home.deviceConnected(data.device, data.time)
        .then(() => {
            logger.info(`[${deviceWorker.name}] Device [${data.device.mac} / ${data.device.name}] has JOINED the network.`);
        })
        .catch( error => { logger.error(`[${deviceWorker.name}] ${error}`); });
});
deviceWorker.on("deviceDisconnected", (data) => {
    Home.deviceDisconnected(data.device)
        .then(() => {
            logger.info(`[${deviceWorker.name}] Device [${data.device.mac} / ${data.device.name}] has LEFT the network.`);
        })
        .catch( error => { logger.error(`[${deviceWorker.name}] ${error}`); });
});


// express setup
adam.use( bodyParser.json() );                          // to support JSON-encoded bodies
adam.use( bodyParser.urlencoded({ extended: true }) );  // to support URL-encoded bodies

// express routes
adam.get("/", (req, res) => {
    Database
        .then(db => {
            let bootTime = db.shortTerm.get("bootTime").value();
            let currentTime = Date.now();
            let elapsed = Math.round((currentTime - bootTime) / 1000);

            res.send(`A.D.A.M. : online for ${elapsed} seconds.`);
        })
        .catch( error => { logger.error(`[ExpressJS] ${error}`); });
});

adam.get("/devices", (req, res) => {
    Home.getConnectedDevices()
        .then(devices => {
            res.json( devices );
        })
        .catch( error => { logger.error(`[ExpressJS] ${error}`); });
});


// start
locationWorker.start();
deviceWorker.start();
adam.listen( Config.port );
