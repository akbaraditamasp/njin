#!/usr/bin/env node
import { Command } from "commander";
import server from "./server.js";

const program = new Command();

program
  .name("njin")
  .description("CLI for running Njin Server")
  .version("1.0.0");

program
  .command("run")
  .description("Running the Njin Server")
  .argument("<ROOT>", "root path for client")
  .option("-p, --port <char>", "port server")
  .option("-a, --api <char>", "api path for client")
  .action((root, { port, api }) => {
    server(root, port, api);
  });

program.parse();
