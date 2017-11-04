import express from "express";
import Config  from "Config";

/*
 * A. D. A. M. - Automations, Devices, and Alerts, Manager
 *
 */

let deviceManager = Config.deviceManager;
let logger = Config.logger;
let adam = express();


// routes
adam.get("/", (req, res) => {
    res.send("A.D.A.M. : STATUS online");
});

adam.get("/devices", (req, res) => {
    deviceManager.getActiveDevices( (error, devices) => {
        if (error) { logger.error(`${error}`); }
        res.json( devices );
    });
});

adam.listen( Config.port );
