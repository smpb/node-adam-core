import path from "path";

/*
 * Abstract class representing the manager that scans, and keeps track,
 * of active network devices.
 *
 * As with any abstract class, you can't instantiate this directly.
 * You're supposed to use one of the provided managers, or build your own
 * according to your setup, by extending this and implementing the following:
 *
 *    getActiveDevices
 *      @returns {Promise}  A Promise that resolves with the list of active devices;
 *                          Active device data is expected to be in the following format:
 *
 *          {
 *              timestamp : 1509740200000,
 *              devices   : [
 *                  {
 *                      mac  : "83:f1:f4:c2:34:b6",
 *                      ip   : "192.168.1.12",
 *                      name : "Johns-Phone"
 *                  },
 *                  {
 *                      mac  : "62:e8:d4:12:f3:a9",
 *                      ip   : "192.168.1.45",
 *                      name : "Janes-Phone"
 *                  }
 *              ]
 *          }
 *
 * Once implemented, you should configure and use it in the Configuration module.
 *
 */

export default class DeviceManager {
    constructor (options={}) {
        // Abstract class checks
        if (new.target === DeviceManager)
            throw new TypeError("Unable to instantiate an abstract 'DeviceManager'.");
        if (this.getActiveDevices === undefined)
            throw new TypeError("Derived class must override method 'getActiveDevices'");

        this.options = options;
        this._module = options._module || path.basename(__filename, ".js");
        this.info    = { timestamp : 0, devices : [] };
    }

    // methods
    get moduleName() { return this._module; }
}
