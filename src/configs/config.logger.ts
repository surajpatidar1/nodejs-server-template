import { LoggerOptions } from "pino";
import {configFactory} from "./config.load.js";

export const configLoggerFactory : LoggerOptions = {
    level : configFactory.LOG_LEVEL ?? 'info'
}


