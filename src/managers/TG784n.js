import path           from "path";
import Timer          from "timers";
import { Telnet }     from "telnet-rxjs";
import DeviceManager  from "DeviceManager";

/*
 * Device manager 'Technicolor TG784n v3'
 *
 */

export default class TG784n extends DeviceManager {
    constructor (options) {
        super(options);

        this.name   = path.basename(__filename, ".js");
        this.client = Telnet.client( options.host );

        this.client.subscribe(
            () => {},
            (error) => {
                this.clientExit();
                return this.client.callback( error, {} );
            }
        );

        this.client.data.subscribe((data) => {
            if (data.match(options.loginPrompt)) {
                this.options.logger.debug(`'${this.name}' received login prompt`);
                this.client.sendln( options.username );
            } else if (data.match(options.passwordPrompt)) {
                this.options.logger.debug(`'${this.name}' received password prompt`);
                this.client.sendln( options.password );
            } else if (data.match(options.shellPrompt)) {
                this.options.logger.debug(`'${this.name}' received the shell prompt`);
                if ( this.client.communicating ) {
                    this.client.buffer = this.client.buffer.concat(data);
                    this.client.communicating = false;
                } else {
                    this.client.communicating = true;
                    this.client.buffer = "\r\n";
                    this.client.sendln( options.comand );
                }

                if ((this.client.buffer !== "") && (! this.client.communicating)) {
                    this.options.logger.debug(`'${this.name}' device info collected`);
                    this.options.logger.silly(`'${this.name}' ${this.client.buffer}`);
                    this.clientExit();

                    let parsedInfo = { timestamp : Date.now(), devices : [] };

                    this.client.buffer.split("\n").forEach(function (row) {
                        if (row.match(/[:a-f0-9]{17}/i)) {
                            let column = row.split(/\s+/);
                            if ( column[2].match(/^[CD]+L$/) ) {
                                parsedInfo.devices.push({
                                    mac  : column[0],
                                    ip   : column[1],
                                    name : column[6]
                                });
                            }
                        }
                    });

                    this.info = parsedInfo;
                    return this.client.callback( null, this.info );
                }
            } else if ( this.client.communicating ) {
                this.options.logger.debug(`'${this.name}' received some data`);
                this.client.buffer = this.client.buffer.concat(data);
            }
        });

        // helper function
        this.clientExit = () => {
            let Timeout = Timer.setTimeout(function(){}, 0).constructor; // feed the next 'instanceof'
            if (this.client.timer instanceof Timeout) { Timer.clearTimeout( this.client.timer ); }
            this.client.disconnect();
        }
    }

    /* methods */

    getActiveDevices(callback) {
        this.options.logger.debug(`'${this.name}' is getting the active network devices...`);
        this.client.callback = callback;
        this.client.timer    = Timer.setTimeout(this.clientExit, this.options.timeout);
        this.client.connect();
    }
}
