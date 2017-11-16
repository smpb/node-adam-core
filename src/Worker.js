import Config       from "Config";
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
            name: "Worker",
            heart: {},
            heartbeat: 10000,
            action: () => { Config.logger.debug("[Worker] Triggered action from 'anonymous'."); }
        }, options);

        Object.assign(this, options);
    }

    // methods
    start() {
        Config.logger.info(`[${this.name}] Starting worker.`);
        this.heart = Timer.setInterval(this.action, this.heartbeat);
        this.action();
    }

    stop() {
        let Timeout = Timer.setInterval(() => {}, 0).constructor; // feed the next 'instanceof'
        if (this.heart instanceof Timeout) {
            Config.logger.info(`[${this.name}] Stopping worker.`);
            Timer.clearInterval( this.heart );
        } else {
            Config.logger.info(`[${this.name}] Worker is not running; ignoring stop request.`);
        }
    }
}
