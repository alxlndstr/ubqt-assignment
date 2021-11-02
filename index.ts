import express from 'express';
import { startSocketServer } from './Components';
import path from 'path';
const app = express();

const PORT: Number = parseInt(process.env.PORT!) || 8080;

app.get('/', (req, res) => res.sendFile(path.resolve('./frontend/index.html')));

app.use('/', express.static('./frontend'));

const webServer = app.listen(PORT);
const io = startSocketServer(webServer);
