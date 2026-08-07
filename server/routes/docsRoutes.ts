import express from 'express';
import { getPostmanCollection, getSwaggerSpec } from '../controllers/docsController.js';

const router = express.Router();

router.get('/postman', getPostmanCollection);
router.get('/openapi.json', getSwaggerSpec);
router.get('/', (_req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>CookMantra API Documentation</title>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
        <script>
          SwaggerUIBundle({
            url: '/api/v1/docs/openapi.json',
            dom_id: '#swagger-ui',
          });
        </script>
      </body>
    </html>
  `);
});

export default router;
