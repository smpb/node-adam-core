import DeviceManager  from "DeviceManager";
import Device         from "model/Device";
import Timer          from "timers";
import { Telnet }     from "telnet-rxjs";


/*
 * Device manager 'Technicolor TG784n v3'
 *
 */

export default class TG784n extends DeviceManager {
    constructor (options={}) {
        options = Object.assign({
            name: "TG784n",
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
                this.logger.debug(`[${this.name}] Received login prompt`);
                this.client.sendln(this.username);
            } else if (data.match(this.passwordPrompt)) {
                this.logger.debug(`[${this.name}] Received password prompt`);
                this.client.sendln(this.password);
            } else if (data.match(this.shellPrompt)) {
                this.logger.debug(`[${this.name}] Received the shell prompt`);
                if ( this.client.communicating ) {
                    this.client.buffer = this.client.buffer.concat(data);
                    this.client.communicating = false;
                } else {
                    this.client.communicating = true;
                    this.client.buffer = "\r\n";
                    this.client.sendln(this.comand);
                }

                if ((this.client.buffer !== "") && (! this.client.communicating)) {
                    this.logger.info(`[${this.name}] Active network devices collection complete.`);
                    this.logger.silly(`[${this.name}] ${this.client.buffer}`);
                    this.clientExit();

                    let devices = [];

                    this.client.buffer.split("\n").forEach((row) => {
                        if (row.match(/[:a-f0-9]{17}/i)) {
                            let column = row.split(/\s+/);
                            if ( column[2].match(/CD?L$/) ) {
                                devices.push({
                                    mac  : column[0],
                                    ip   : column[1],
                                    name : column[6]
                                });
                            }
                        }
                    });

                    Promise.all( devices.map(d => { return Device.load(d); }) )
                    .then(devices => {
                        this.info = { time : Date.now(), devices : devices };
                        return this.client.callback( this.info );
                    });
                }
            } else if ( this.client.communicating ) {
                this.logger.debug(`[${this.name}] Received some data`);
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
            this.logger.info(`[${this.name}] Getting the active network devices...`);

            this.client.timer = Timer.setTimeout(() => {
                this.clientExit();
                reject(new Error(`[${this.name}] Error: timeout after ${this.timeout} ms.`));
            }, this.timeout);

            this.client.callback = resolve;
            this.client.connect();
        });
    }
}
