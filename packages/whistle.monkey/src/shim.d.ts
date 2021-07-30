import { Log } from "./interface/log";

declare global {
  function sendLog(log: Log): void
}

