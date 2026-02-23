import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import YAML from 'yaml';

const router = Router();

const file = fs.readFileSync('docs/openapi.yaml', 'utf8');
const spec = YAML.parse(file);

router.use('/', swaggerUi.serve, swaggerUi.setup(spec));

export default router;

