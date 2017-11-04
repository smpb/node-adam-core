
/*
 * Abstract class representing the manager that scans, and keeps track,
 * of active network devices.
 *
 * As with any abstract class, you can't instantiate this directly.
 * You're supposed to use one of the provided managers, or build your own
 * according to your setup, by extending this and implementing the following:
 *
 *    getActiveDevices
 *      @param {function} a callback function that will be called once retrieval is done.
 *      @returns {object} the active data that will be passed as an argument to the callback;
 *                        it is expected to be in the format of the following example:
 *
 *          {
 *              timestamp : 1509740200000,
 *              devices   : [
 *                  {
 *                      mac  : "83:f1:f4:c2:34:b6",
 *                      ip   : "192.168.1.12",
 *                      name : "Johns-iPhone"
 *                  },
 *                  {
 *                      mac  : "62:e8:d4:12:f3:a9",
 *                      ip   : "192.168.1.45",
 *                      name : "Janes-iPhone"
 *                  }
 *              ]
 *          }
 *
 * Once implemented, you should configure and use it in the Configuration module.
 *
 */

export default class DeviceManager {
    constructor (options) {
        // Abstract class checks
        if (new.target === DeviceManager)
            throw new TypeError("Unable to instantiate an abstract 'DeviceManager'.");
        if (this.getActiveDevices === undefined)
            throw new TypeError("Derived class must override method 'getActiveDevices'");

        this.options = options;
        this.info    = { timestamp : 0, devices : [] };
    }
}
