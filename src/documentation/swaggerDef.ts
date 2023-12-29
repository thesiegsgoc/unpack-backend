import jsYaml from 'js-yaml'
import fs from 'fs'
import path from 'path'
import config from '../config'

const { PORT } = config

// const swaggerSchemas = jsYaml.load(
//   fs.readFileSync('./documentation/swaggerDefinitions.yaml', 'utf8')
// )

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Upack API Documentation',
    version: '1.0.0',
    description: 'API documentation for the Upack Infrastructure.',
  },
  servers: [
    {
      url: `http://localhost:${PORT}`,
      description: 'Development server',
    },
  ],
  // components: {
  //   schemas: swaggerSchemas, // Use the loaded schemas
  // },
}

export const options = {
  swaggerDefinition,
  apis: ['./routes/*.ts'],
}
