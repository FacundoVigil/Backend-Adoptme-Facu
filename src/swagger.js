
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerOptions = {
    definition: {
    openapi: '3.0.3',
    info: {
    title: 'Adoptme API',
        version: '1.0.0',
      description: 'Documentación de la API de Adoptme. Este paso documenta el módulo **Users**.',
    },
    servers: [
    { url: 'http://localhost:8080', description: 'Local' }
    ],
    components: {
        schemas: {
        User: {
            type: 'object',
            properties: {
            _id: { type: 'string', example: '66f1bf2c3b8e2f0012a34567' },
            first_name: { type: 'string', example: 'Ada' },
            last_name: { type: 'string', example: 'Lovelace' },
            email: { type: 'string', example: 'ada@example.com' },
            role: { type: 'string', example: 'user' },
            pets: {
                type: 'array',
                items: { type: 'string', example: '66f1bf2c3b8e2f0012a39999' }
            }
            }
        },
        UserInput: {
            type: 'object',
            properties: {
            first_name: { type: 'string', example: 'Grace' },
            last_name: { type: 'string', example: 'Hopper' },
            email: { type: 'string', example: 'grace@example.com' },
            role: { type: 'string', example: 'admin' }
            }
        },
        ErrorResp: {
            type: 'object',
            properties: {
            status: { type: 'string', example: 'error' },
            error: { type: 'string', example: 'User not found' }
            }
        }
        }
    },
    tags: [
        { name: 'Users', description: 'Operaciones sobre usuarios' }
    ]
    },
    apis: [
    path.join(__dirname, './routes/*.router.js'),
    path.join(__dirname, './routes/*.js')
    ]
};

export default swaggerOptions;
