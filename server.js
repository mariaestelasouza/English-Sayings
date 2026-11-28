import express from 'express';
import { accessSync, constants } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('./dist/', import.meta.url));
accessSync(new URL('./dist/index.html', import.meta.url), constants.R_OK);

const app = express();
app.disable('x-powered-by');
app.use(express.static(dist));

const port = Number(process.env.PORT ?? 3000);
app.listen(port, '0.0.0.0', () => {
  console.log(`English Sayings is listening on port ${port}`);
});
