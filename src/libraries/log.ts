import chalk from "chalk";
import moment from "moment";

export default class Log {
  public static log = (args: any) => this.info(args);
  public static info = (args: any) =>
    console.log(
      chalk.blue(`[${moment().format("LLL")}] [INFO]`),
      typeof args === "string" ? chalk.blueBright(args) : args
    );
  public static success = (args: any) =>
    console.log(
      chalk.green(`[${moment().format("LLL")}] [SUCCESS]`),
      typeof args === "string" ? chalk.greenBright(args) : args
    );
  public static warning = (args: any) =>
    console.log(
      chalk.yellow(`[${moment().format("LLL")}] [WARN]`),
      typeof args === "string" ? chalk.yellowBright(args) : args
    );
  public static error = (args: any) =>
    console.log(
      chalk.red(`[${moment().format("LLL")}] [ERROR]`),
      typeof args === "string" ? chalk.redBright(args) : args
    );
}
