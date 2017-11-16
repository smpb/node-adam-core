import DeviceManager  from "DeviceManager";
import Device         from "model/Device";


/*
 * Demo device manager
 *
 */

export default class DemoManager extends DeviceManager {
    constructor (options={}) {
        options.name = "DemoManager";
        super(options);
    }


    // methods
    getActiveDevices() {
        return new Promise(resolve => {
            this.logger.debug(`[${this.name}] Getting the active network devices...`);

            let randomChance = Math.round(Math.random() * (100 - 1) + 1);
            if (randomChance > 80) {
                throw new Error(`[${this.name}] 'getActiveDevices' fake timeout for testing.`);
            }

            let date = new Date();
            let info = { time: date.getTime(), devices: [] };

            Promise.all([
                Device.load(
                    { mac: "d4:87:e3:a2:12:b7", ip: "192.168.1.5",  name: "Home-Assistant" }
                ),
                Device.load(
                    { mac: "34:c7:b1:90:17:ad", ip: "192.168.1.22", name: "Janes-Computer" }
                ),
                Device.load(
                    { mac: "f9:aa:3e:84:e3:5c", ip: "192.168.1.81", name: "Johns-Tablet"   }
                ),
                Device.load(
                    { mac: "83:f1:f4:c2:34:b6", ip: "192.168.1.12", name: "Johns-Phone"    }
                ),
                Device.load(
                    { mac: "62:e8:d4:12:f3:a9", ip: "192.168.1.45", name: "Janes-Phone"    }
                )
            ])
            .then(devices => {
                let [assistant, computer, tablet, phoneA, phoneB] = devices;

                info.devices.push( assistant );
                info.devices.push( computer  );
                info.devices.push( tablet    );
                if ((date.getMinutes() % 5) !== 0) { info.devices.push( phoneA ); }
                if ((date.getMinutes() % 2) !== 0) { info.devices.push( phoneB ); }

                this.logger.debug(`[${this.name}] Active network devices collection complete.`);

                return resolve( info );
            })
            .catch(error => { this.logger.error(`[${this.name}] ${error}.`); });
        });
    }
}
