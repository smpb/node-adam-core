import path   from "path";
import Timer  from "timers";
import Config from "Config";

/*
 * Worker class for generic out-of-band concurrent operations.
 *
 */

export default class Worker {
    constructor (options) {
        this.state = Object.assign({
            name : "anonymous",
            heart: {},
            heartbeat: 10000,
            action: () => { Config.logger.debug("[Worker] Triggered action from 'anonymous'."); }
        }, options);
        this._module = options._module || path.basename(__filename, ".js");
    }

    // methods
    get moduleName() { return this._module; }

    start() {
        Config.logger.info(`[${this.moduleName}] Starting '${this.state.name}'.`);
        this.state.heart = Timer.setInterval(this.state.action, this.state.heartbeat);
        this.state.action();
    }

    stop() {
        let Timeout = Timer.setInterval(() => {}, 0).constructor; // feed the next 'instanceof'
        if (this.state.heart instanceof Timeout) {
            Config.logger.info(`[${this.moduleName}] Stopping '${this.state.name}'.`);
            Timer.clearInterval( this.state.heart );
        } else {
            Config.logger.info(`[${this.moduleName}] '${this.state.name}' is not running; ignoring stop request.`);
        }
    }
}
