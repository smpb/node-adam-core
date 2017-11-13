import Config       from "Config";
import path         from "path";
import Timer        from "timers";
import EventEmitter from "events";


/*
 * Worker class for generic out-of-band concurrent operations.
 *
 */

export default class Worker extends EventEmitter {
    constructor (options={}) {
        super();

        options = Object.assign({
            _module: path.basename(__filename, ".js"),
            heart: {},
            heartbeat: 10000,
            action: () => { Config.logger.debug("[Worker] Triggered action from 'anonymous'."); }
        }, options);

        Object.assign(this, options);
    }

    // methods
    get moduleName() { return this._module; }

    start() {
        Config.logger.info(`[${this.moduleName}] Starting worker.`);
        this.heart = Timer.setInterval(this.action, this.heartbeat);
        this.action();
    }

    stop() {
        let Timeout = Timer.setInterval(() => {}, 0).constructor; // feed the next 'instanceof'
        if (this.heart instanceof Timeout) {
            Config.logger.info(`[${this.moduleName}] Stopping worker.`);
            Timer.clearInterval( this.heart );
        } else {
            Config.logger.info(`[${this.moduleName}] worker is not running; ignoring stop request.`);
        }
    }
}
