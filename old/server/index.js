import express from 'express';
import http from 'http';
const app = express();
import { resolve } from 'path';
import { argv } from 'process';
import setup from './server.js'
const __dirname = import.meta.dirname;

setup(app);

app.use(express.static(resolve(__dirname, '../client/dist')));

const args = {};
let i = 1;
let option;
while (i < argv.length - 1) {
  i++;
  let value = argv[i];
  if (value.startsWith('--')) {
    option = value.substring(2);
    if (Object.keys(args).includes(option)) {
      console.warn('option ' + option + ' specified multiple times.');
      continue;
    }
    args[option] = undefined;
  } else {
    if (option == '') {
      console.warn('unmatched parameter', value);
      continue;
    }
    args[option] = value;
    option = '';
  }
}

if (args.port) args.port = parseInt(args.port);

http.createServer(app).listen(args.port ?? 80, args.host ?? 'localhost', undefined, () => {
  console.log(`🚀 Server started on http://${args.host ?? 'localhost'}:${args.port ?? 80}`);
});
