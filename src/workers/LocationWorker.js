import Worker from "Worker";
import path   from "path";
import axios  from "axios";

/*
 * Worker to update the conditions around A.D.A.M.'s location
 *
 */
export default class LocationWorker extends Worker {
    constructor (options={}) {
        let logger = options.logger;
        let database = options.database;
        let weatherToken = options.weatherToken;

        super({
            _module: path.basename(__filename, ".js"),
            heartbeat: 3600000,
            action: () => {
                let geo = axios.create({ baseURL: "https://ipapi.co/" });
                let weather = axios.create({ baseURL: "https://api.openweathermap.org/data/2.5/" });

                geo.get("/json")
                    .then( res => { return database.set("location", res.data).write(); })
                    .then( ( ) => {
                        let location = database.get("location").value();
                        return weather.get("/weather", {
                            params : {
                                APPID: weatherToken,
                                lat: location.latitude,
                                lon: location.longitude,
                                units: "metric"
                            }
                        });
                    })
                    .then( res => { return database.set("weather", res.data).write(); } )
                    .then( ( ) => {
                        logger.info(`[${this.moduleName}] Updated location information.`);
                    })
                    .catch( error => { logger.error(`[${this.moduleName}] ${error}`); } );
            }
        });
    }
}