import DeviceManager  from "DeviceManager";
import path           from "path";
import Timer          from "timers";
import { Telnet }     from "telnet-rxjs";

/*
 * Device manager 'Technicolor TG784n v3'
 *
 */

export default class TG784n extends DeviceManager {
    constructor (options={}) {
        options = Object.assign({
            timeout: 5000,
            loginPrompt: /Username[: ]+/i,
            passwordPrompt: /Password[: ]+/i,
            failedLoginMatch: /invalid/i,
            shellPrompt: /=>/i,
            comand: "hostmgr list"
        }, options);
        options._module = path.basename(__filename, ".js");
        super(options);

        this.client = Telnet.client( options.host );

        this.client.subscribe(
            () => {},
            (error) => {
                this.clientExit();
                throw new Error( error );
            }
        );

        this.client.data.subscribe((data) => {
            if (data.match(options.loginPrompt)) {
                this.options.logger.debug(`[${this.moduleName}] Received login prompt`);
                this.client.sendln( options.username );
            } else if (data.match(options.passwordPrompt)) {
                this.options.logger.debug(`[${this.moduleName}] Received password prompt`);
                this.client.sendln( options.password );
            } else if (data.match(options.shellPrompt)) {
                this.options.logger.debug(`[${this.moduleName}] Received the shell prompt`);
                if ( this.client.communicating ) {
                    this.client.buffer = this.client.buffer.concat(data);
                    this.client.communicating = false;
                } else {
                    this.client.communicating = true;
                    this.client.buffer = "\r\n";
                    this.client.sendln( options.comand );
                }

                if ((this.client.buffer !== "") && (! this.client.communicating)) {
                    this.options.logger.info(`[${this.moduleName}] Active network devices collection complete.`);
                    this.options.logger.silly(`[${this.moduleName}] ${this.client.buffer}`);
                    this.clientExit();

                    let parsedInfo = { timestamp : Date.now(), devices : [] };

                    this.client.buffer.split("\n").forEach((row) => {
                        if (row.match(/[:a-f0-9]{17}/i)) {
                            let column = row.split(/\s+/);
                            if ( column[2].match(/CD?L$/) ) {
                                parsedInfo.devices.push({
                                    mac  : column[0],
                                    ip   : column[1],
                                    name : column[6]
                                });
                            }
                        }
                    });

                    this.info = parsedInfo;
                    return this.client.callback( this.info );
                }
            } else if ( this.client.communicating ) {
                this.options.logger.debug(`[${this.moduleName}] Received some data`);
                this.client.buffer = this.client.buffer.concat(data);
            }
        });

        // clean exit helper
        this.clientExit = () => {
            let Timeout = Timer.setTimeout(() => {}, 0).constructor; // feed the next 'instanceof'
            if (this.client.timer instanceof Timeout) { Timer.clearTimeout( this.client.timer ); }
            this.client.disconnect();
        }
    }


    // methods
    getActiveDevices() {
        return new Promise( (resolve, reject) => {
            this.options.logger.info(`[${this.moduleName}] Getting the active network devices...`);

            this.client.timer = Timer.setTimeout(() => {
                this.clientExit();
                reject(new Error(`[${this.moduleName}] Error: timeout after ${this.options.timeout} ms.`));
            }, this.options.timeout);

            this.client.callback = resolve;
            this.client.connect();
        });
    }
}
