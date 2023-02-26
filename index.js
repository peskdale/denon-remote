#! /usr/bin/env node

const colors = require('colors');
const Vorpal = require('vorpal');
const DenonClient = require('./lib/DenonClient');
const setupToolCommands = require('./lib/toolCommands');
const setupDenonCommands = require('./lib/denonCommands');

const denon = new DenonClient();
const cli = Vorpal();

denon.on('connect', ()=> {
  const address = denon.socket.remoteAddress;
  const port = denon.socket.remotePort;
  cli.log(colors.green(`Successfully connected to ${address}:${port}`));

  if (process.argv.length > 2) {
    for (i = 2; i < process.argv.length; i++) {
      cli.log(colors.blue('Sending command ' + process.argv[i]));
      cli.execSync('command ' + process.argv[i]);
    }
  cli.log(colors.red('All commands sent... exiting'));
  process.exit(0)
  }
});

denon.on('error', err => {
  cli.log(colors.red('Something went wrong'), err);
  denon.end();
});

denon.on('close', ()=> {
  cli.log(colors.red('Connection closed'));
});

denon.on('data', buffer => {
  cli.log(colors.magenta(buffer.toString().trim()));
});

cli
  .localStorage('denon-remote-v1')
  .history('denon-remote-v1')
  .delimiter('denon$')
  .show();

setupToolCommands(cli, denon);
setupDenonCommands(cli, denon);

cli.execSync('connect');
