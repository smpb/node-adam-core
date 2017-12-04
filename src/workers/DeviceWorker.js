import Config  from "Config";
import Worker  from "Worker";
import Home    from "model/Home";
import Device  from "model/Device";
import Person  from "model/Person";


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
                    Home.getConnectedDevices(),
                    manager.getActiveDevices()
                ])
                .then(values => {
                    let [activeDevices, managerData] = values;
                    activeDevices.forEach(device => {
                        if (! managerData.devices.find(d => { return device.mac === d.mac; }) ) {
                            Promise.all([
                                Device.load(device),
                                Person.exists({ device: device.mac })
                            ])
                            .then(values => {
                                let [absentDevice, person] = values;

                                this.emit("deviceDisconnected",
                                    { device : absentDevice, time : managerData.time }
                                );

                                if ( person ) {
                                    this.emit("personExited",
                                        { person : person, time : managerData.time }
                                    );
                                }
                            });

                        }
                    });

                    managerData.devices.forEach(device => {
                        Promise.all([
                            Device.exists({ mac: device.mac }),
                            Home.isDeviceConnected({ mac: device.mac }),
                            Person.exists({ device: device.mac })
                        ])
                        .then(values => {
                            let [known, connected, person] = values;

                            if (! known) {
                                this.emit("newDevice",
                                    { device : device, time : managerData.time }
                                );
                            } else {
                                this.emit("deviceHeartbeat",
                                    { device : device, time : managerData.time }
                                );
                            }

                            if (! connected ) {
                                this.emit("deviceConnected",
                                    { device : device, time : managerData.time }
                                );
                            }

                            if ( person ) {
                                if (! connected) {
                                    this.emit("personEntered",
                                        { person : person, time : managerData.time }
                                    );
                                } else {
                                    this.emit("personHeartbeat",
                                        { person : person, time : managerData.time }
                                    );
                                }
                            }
                        });

                    });
                })
                .catch( error => { this.emit("error", error); });
            }
        });
    }
}