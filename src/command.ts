import { Command } from "commander";
import server from "./server";

const program = new Command();

program
  .name("njin")
  .description("CLI for running Njin Server")
  .version("1.0.0");

program
  .command("run")
  .description("Running the Njin Server")
  .option("-p", "--port <char>", "port server")
  .option("-r", "--root <char>", "root path for client")
  .option("-a", "--api <char>", "api path for client")
  .action(({ port, root, api }) => {
    server(root, port, api);
  });

program.parse();
