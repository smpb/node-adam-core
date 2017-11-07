import path from "path";
import DeviceManager from "DeviceManager";

/*
 * Demo device manager
 *
 */

export default class DemoManager extends DeviceManager {
    constructor (options={}) {
        options._module = path.basename(__filename, ".js");
        super(options);
    }


    // methods
    getActiveDevices(callback) {
        return new Promise( (resolve, reject) => {
            this.options.logger.debug(`[${this.moduleName}] Getting the active network devices...`);

            let randomChance = Math.round(Math.random() * (100 - 1) + 1);
            if (randomChance > 80) {
                throw new Error("[${this.moduleName}] 'getActiveDevices' fake timeout for testing.");
            }

            let date = new Date();
            let info = { timestamp : date.getTime(), devices : [] };

            let assistant = { mac : "d4:87:e3:a2:12:b7", ip : "192.168.1.5",  name : "Home-Assistant" };
            let computer  = { mac : "34:c7:b1:90:17:ad", ip : "192.168.1.22", name : "Janes-Computer" };
            let tablet    = { mac : "f9:aa:3e:84:e3:5c", ip : "192.168.1.81", name : "Johns-Tablet"   };
            let phoneA    = { mac : "83:f1:f4:c2:34:b6", ip : "192.168.1.12", name : "Johns-Phone"    };
            let phoneB    = { mac : "62:e8:d4:12:f3:a9", ip : "192.168.1.45", name : "Janes-Phone"    };

            info.devices.push( assistant );
            info.devices.push( computer  );
            info.devices.push( tablet    );
            if ((date.getMinutes() % 5) !== 0) { info.devices.push( phoneA ); }
            if ((date.getMinutes() % 2) !== 0) { info.devices.push( phoneB ); }

            this.options.logger.debug(`[${this.moduleName}] Active network devices collection complete.`);

            resolve( info );
        });
    }
}
