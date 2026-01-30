import express from 'express';
import cors from 'cors';
import { watch } from 'chokidar';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './routes/api.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GROWTH_OS_ROOT = path.resolve(__dirname, '../..');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api', apiRouter(GROWTH_OS_ROOT));

// File watcher for live updates (logs for now)
const watcher = watch([
  'KNOWLEDGE/target-pipeline.md',
  'KNOWLEDGE/partnership-pipeline.md',
  'KNOWLEDGE/roi-metrics.md',
  'WORK/weekly/**/*.md'
], {
  cwd: GROWTH_OS_ROOT,
  ignoreInitial: true
});

watcher.on('change', (filePath) => {
  console.log(`File changed: ${filePath}`);
});

app.listen(PORT, () => {
  console.log(`Growth OS Dashboard API running at http://localhost:${PORT}`);
  console.log(`Watching files in: ${GROWTH_OS_ROOT}`);
});
