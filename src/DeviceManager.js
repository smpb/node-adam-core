import Config from "Config";

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
 *              time: 1509740200000,
 *              devices: [
 *                  Device.load({
 *                      ip:    "192.168.1.12",
 *                      mac:   "83:f1:f4:c2:34:b6",
 *                      name:  "Johns-Phone"
 *                  }),
 *                  Device.load({
 *                      ip:    "192.168.1.45",
 *                      mac:   "62:e8:d4:12:f3:a9",
 *                      name:  "Janes-Phone"
 *                  })
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
            throw new TypeError(`Unable to instantiate an abstract '${new.target}'.`);
        if (this.getActiveDevices === undefined)
            throw new TypeError(`'${new.target}' must override method 'getActiveDevices'.`);

        options = Object.assign({
            logger: Config.logger,
            info:   { time: 0, devices: [] }
        }, options);

        Object.assign(this, options);
    }
}
