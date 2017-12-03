import Config  from "Config";
import Worker  from "Worker";
import Device  from "model/Device";
import Home    from "model/Home";


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
                            Device.load(device)
                                .then(absentDevice => {
                                    this.emit("deviceDisconnected",
                                        { device : absentDevice, time : managerData.time }
                                    );
                                });
                        }
                    });

                    managerData.devices.forEach(device => {
                        Device.exists(device)
                            .then(known => {
                                if (! known) {
                                    this.emit("newDevice",
                                        { device : device, time : managerData.time }
                                    );
                                } else {
                                    this.emit("deviceHeartbeat",
                                        { device : device, time : managerData.time }
                                    );
                                }
                            });

                        Home.isDeviceConnected(device)
                            .then(connected => {
                                if (! connected ) {
                                    this.emit("deviceConnected",
                                        { device : device, time : managerData.time }
                                    );
                                }
                            });
                    });
                })
                .catch( error => { this.emit("error", error); });
            }
        });
    }
}