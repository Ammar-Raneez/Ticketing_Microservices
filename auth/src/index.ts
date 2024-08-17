import express from 'express';
import { json } from 'body-parser';

const app = express();
app.use(json());

app.get('/api/users/current-user', (_, res) => {
  res.send("Hi There");
})

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
})
