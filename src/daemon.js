import express from "express";
import Config  from "./Config";

/*
 * A. D. A. M. - Automations, Devices, and Alerts, Manager
 *
 */

let deviceManager = Config.deviceManager;
let adam = express();


// routes
adam.get("/", function (req, res) {
    res.send("A.D.A.M. : STATUS online");
});

adam.get("/devices", function (req, res) {
    deviceManager.getActiveDevices( (devices) => { res.json( devices ); } );
});

adam.listen( Config.port );
