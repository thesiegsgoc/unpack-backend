import config from './config'

const { PORT } = config

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Upack API Documentation',
    version: '1.0.0',
    description: 'API documentation for the Upack Infrastracture.',
  },
  servers: [
    {
      url: `http://localhost:${PORT}`,
      description: 'Development server',
    },
  ],
}

export const options = {
  swaggerDefinition,
  apis: ['./routes/*.ts'],
}
