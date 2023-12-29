const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
      title: 'Express API with TypeScript',
      version: '1.0.0',
      description: 'This is a REST API application made with Express and TypeScript.',
    },
    servers: [
      {
        url: 'http://localhost:4111',
        description: 'Development server',
      },
    ],
  };

  
export const options = {
    swaggerDefinition,
    apis: ['./routes/*.ts'], 
};
  