import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import webPush from 'web-push';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PUBLIC_KEY =
  'BI1OyoLDOFsq-JL6uA2mWUq6IXSzT0kTZskQ8yKqeg8yJNhv22YLPI0tNpprzWaUQ1_G4oGk3JQv_ngw4QrmybQ';

webPush.setVapidDetails('mailto:feliven@gmail.com', PUBLIC_KEY, process.env.PRIVATE_KEY);

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
