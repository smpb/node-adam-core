import Worker from "Worker";
import path   from "path";

/*
 * Network devices worker
 *
 */
export default class DeviceWorker extends Worker {
    constructor (options={}) {
        let manager  = options.manager;
        let database = options.database;

        super({
            _module: path.basename(__filename, ".js"),
            heartbeat: options.heartbeat,
            action: () => {
                manager.getActiveDevices()
                    .then( data => {
                        database.get("active").value().forEach(device => {
                            if (! data.devices.find((d) => { return device.mac === d.mac; }) ) {
                                let absentDevice = database.get("devices").find({mac : device.mac}).value();
                                this.emit("deviceDisconnected", { device : absentDevice, timestamp : data.timestamp });
                            }
                        });

                        data.devices.forEach(device => {
                            let known = database.get("devices").find({mac : device.mac}).value();

                            if (! known) {
                                this.emit("newDevice", { device : device, timestamp : data.timestamp });
                            } else {
                                this.emit("deviceHeartbeat", { device : device, timestamp : data.timestamp });
                            }

                            if (! database.get("active").find({ mac : device.mac}).value() ) {
                                this.emit("deviceConnected", { device : device, timestamp : data.timestamp });
                            }
                        });
                    })
                    .catch( error => { this.emit("error", error); });
            }
        });
    }
}