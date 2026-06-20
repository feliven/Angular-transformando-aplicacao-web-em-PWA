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

const subscriptions = [];

app.post('/subscribe', (req, res, next) => {
  const subscription = req.body;

  subscriptions.push(subscription);

  res.status(201).json({});
});

app.post('/send-notification', async (req, res, next) => {
  const { title, body } = req.body;

  const notifications = subscriptions.map((sub) => {
    return webPush.sendNotification(sub, JSON.stringify({ title, body }));
  });

  try {
    await Promise.all(notifications);

    res.status(200).json({ message: 'Notificações enviadas com sucesso' });
  } catch (error) {
    const errorMsg = 'Erro ao enviar notificações';
    console.error(errorMsg, error);
    res.status(500).json({ error: errorMsg });
  }
});

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
