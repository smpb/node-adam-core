import Config    from "Config";
import Worker    from "Worker";
import Database  from "Database";

/*
 * Network devices worker
 *
 */
export default class DeviceWorker extends Worker {
    constructor (manager) {
        if ((manager === undefined) || (manager.getActiveDevices === undefined))
            throw new Error("[DeviceWorker] requires a valid 'DeviceManager'.");

        super({
            name: "DeviceWorker",
            heartbeat: Config.heartbeat,
            action: () => {
                Promise.all([
                    Database,
                    manager.getActiveDevices()
                ])
                .then(values => {
                    let [db, data] = values;
                    db.get("active").value().forEach(device => {
                        if (! data.devices.find((d) => { return device.mac === d.mac; }) ) {
                            let absentDevice = db.get("devices").find({mac : device.mac}).value();
                            this.emit("deviceDisconnected",
                                { device : absentDevice, time : data.time }
                            );
                        }
                    });

                    data.devices.forEach(device => {
                        let known = db.get("devices").find({mac : device.mac}).value();

                        if (! known) {
                            this.emit("newDevice",
                                { device : device, time : data.time }
                            );
                        } else {
                            this.emit("deviceHeartbeat",
                                { device : device, time : data.time }
                            );
                        }

                        if (! db.get("active").find({ mac : device.mac}).value() ) {
                            this.emit("deviceConnected",
                                { device : device, time : data.time }
                            );
                        }
                    });
                })
                .catch( error => { this.emit("error", error); });
            }
        });
    }
}