const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerDefinition = require('../../docs/swaggerDef');

const router = express.Router();

const specs = swaggerJsdoc({
  swaggerDefinition,
  apis: [
    'src/routes/api/auth/*.js',
    'src/docs/*.yml',
    'src/routes/v1/*.js',
    'src/routes/boilerplate/*.js',
    'src/routes/web/client/*.js',
    'src/routes/web/master/*.js',
    'src/routes/web/privilege/*.js',
    'src/routes/web/zone/*.js',
  ],
});

router.use('/', swaggerUi.serve);
router.get(
  '/',
  swaggerUi.setup(specs, {
    explorer: true,
  }),
);

module.exports = router;
