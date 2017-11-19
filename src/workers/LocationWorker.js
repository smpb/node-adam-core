import Config    from "Config";
import Worker    from "Worker";
import Database  from "Database";
import axios     from "axios";

/*
 * Worker to update the conditions around A.D.A.M.'s location
 *
 */
export default class LocationWorker extends Worker {
    constructor (options={}) {
        super({
            name: "LocationWorker",
            heartbeat: 3600000,
            action: () => {
                let ipAPI = axios.create({ baseURL: "https://ipapi.co/" });
                let owm   = axios.create({ baseURL: "https://api.openweathermap.org/data/2.5/" });

                let location;
                let weather;

                ipAPI.get("/json")
                    .then(res => {
                        location = res.data;
                        return owm.get("/weather", {
                            params : {
                                APPID: Config.weather.token,
                                lat:   location.latitude,
                                lon:   location.longitude,
                                units: "metric"
                            }
                        });
                    })
                    .then(res => {
                        weather = res.data;
                        return Database.then(db => {
                            db.shortTerm.set("location", location).set("weather", weather).write();
                        })
                    })
                    .then(() => {
                        Config.logger.info(`[${this.name}] Updated location information.`);
                    })
                    .catch(error => { Config.logger.error(`[${this.name}] ${error}`); });
            }
        });
    }
}