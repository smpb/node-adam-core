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
            _module: path.basename(__filename, ".js"),
            host: "127.0.0.1:23",
            username: "username",
            password: "password",
            timeout: 5000,
            loginPrompt: /Username[: ]+/i,
            passwordPrompt: /Password[: ]+/i,
            failedLoginMatch: /invalid/i,
            shellPrompt: /=>/i,
            comand: "hostmgr list"
        }, options);

        super(options);

        this.client = Telnet.client( this.host );

        this.client.subscribe(
            () => {},
            (error) => {
                this.clientExit();
                throw new Error( error );
            }
        );

        this.client.data.subscribe((data) => {
            if (data.match(this.loginPrompt)) {
                this.logger.debug(`[${this.moduleName}] Received login prompt`);
                this.client.sendln(this.username);
            } else if (data.match(this.passwordPrompt)) {
                this.logger.debug(`[${this.moduleName}] Received password prompt`);
                this.client.sendln(this.password);
            } else if (data.match(this.shellPrompt)) {
                this.logger.debug(`[${this.moduleName}] Received the shell prompt`);
                if ( this.client.communicating ) {
                    this.client.buffer = this.client.buffer.concat(data);
                    this.client.communicating = false;
                } else {
                    this.client.communicating = true;
                    this.client.buffer = "\r\n";
                    this.client.sendln(this.comand);
                }

                if ((this.client.buffer !== "") && (! this.client.communicating)) {
                    this.logger.info(`[${this.moduleName}] Active network devices collection complete.`);
                    this.logger.silly(`[${this.moduleName}] ${this.client.buffer}`);
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
                this.logger.debug(`[${this.moduleName}] Received some data`);
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
            this.logger.info(`[${this.moduleName}] Getting the active network devices...`);

            this.client.timer = Timer.setTimeout(() => {
                this.clientExit();
                reject(new Error(`[${this.moduleName}] Error: timeout after ${this.timeout} ms.`));
            }, this.timeout);

            this.client.callback = resolve;
            this.client.connect();
        });
    }
}
