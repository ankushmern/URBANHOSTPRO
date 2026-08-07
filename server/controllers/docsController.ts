import { Request, Response } from 'express';

/**
 * @desc    Get Swagger / OpenAPI 3.0 JSON Specification
 * @route   GET /api/v1/docs/openapi.json
 * @access  Public
 */
export const getSwaggerSpec = (req: Request, res: Response): void => {
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol || 'http';
  const serverUrl = `${protocol}://${host}/api/v1`;

  const swaggerSpec = {
    openapi: '3.0.3',
    info: {
      title: 'CookMantra REST API Documentation',
      version: '1.0.0',
      description: 'Production-ready RESTful APIs for CookMantra Home Chef Service platform',
      contact: {
        name: 'CookMantra Engineering Team',
        email: 'support@cookmantra.com',
      },
    },
    servers: [{ url: serverUrl, description: 'Current active server environment' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Validation failed' },
            code: { type: 'string', example: 'VALIDATION_ERROR' },
            requestId: { type: 'string', example: 'req_8f12a4b9' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            role: { type: 'string', enum: ['user', 'admin'] },
            location: { type: 'string' },
            totalBookings: { type: 'number' },
          },
        },
        Booking: {
          type: 'object',
          properties: {
            bookingId: { type: 'string' },
            name: { type: 'string' },
            phone: { type: 'string' },
            serviceDetail: { type: 'string' },
            date: { type: 'string' },
            time: { type: 'string' },
            status: { type: 'string' },
            totalAmount: { type: 'number' },
          },
        },
        Dish: {
          type: 'object',
          properties: {
            dishId: { type: 'string' },
            title: { type: 'string' },
            category: { type: 'string' },
            price: { type: 'number' },
            rating: { type: 'number' },
            isVeg: { type: 'boolean' },
          },
        },
      },
    },
    paths: {
      '/health': {
        get: {
          summary: 'Health check endpoint',
          responses: { 200: { description: 'Server operational' } },
        },
      },
      '/auth/register': {
        post: {
          summary: 'Register a new user account',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'phone'],
                  properties: {
                    name: { type: 'string', example: 'Rajesh Kumar' },
                    phone: { type: 'string', example: '9876543210' },
                    email: { type: 'string', example: 'rajesh@example.com' },
                    password: { type: 'string', example: 'password123' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'User registered successfully' },
            400: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      '/auth/login': {
        post: {
          summary: 'Login with phone & password',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['phone', 'password'],
                  properties: {
                    phone: { type: 'string' },
                    password: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Authentication successful' } },
        },
      },
      '/dishes': {
        get: {
          summary: 'Get all gourmet dishes with filtering & search',
          responses: { 200: { description: 'List of dishes' } },
        },
      },
      '/bookings': {
        post: {
          summary: 'Create a new chef booking',
          responses: { 201: { description: 'Booking created' } },
        },
      },
    },
  };

  res.json(swaggerSpec);
};

/**
 * @desc    Get Postman v2.1.0 Collection JSON for API testing
 * @route   GET /api/v1/docs/postman
 * @access  Public
 */
export const getPostmanCollection = (req: Request, res: Response): void => {
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol || 'http';
  const baseUrl = `${protocol}://${host}/api/v1`;

  const postmanCollection = {
    info: {
      name: 'CookMantra Backend REST APIs',
      description: 'Complete production-ready Postman collection for CookMantra Express + MongoDB backend',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    item: [
      {
        name: 'Authentication',
        item: [
          {
            name: 'Register User',
            request: {
              method: 'POST',
              header: [{ key: 'Content-Type', value: 'application/json' }],
              body: {
                mode: 'raw',
                raw: JSON.stringify(
                  {
                    name: 'Rajesh Kumar',
                    phone: '9876543210',
                    email: 'rajesh@example.com',
                    password: 'password123',
                  },
                  null,
                  2
                ),
              },
              url: { raw: `${baseUrl}/auth/register` },
            },
          },
          {
            name: 'Login User',
            request: {
              method: 'POST',
              header: [{ key: 'Content-Type', value: 'application/json' }],
              body: {
                mode: 'raw',
                raw: JSON.stringify({ phone: '9876543210', password: 'password123' }, null, 2),
              },
              url: { raw: `${baseUrl}/auth/login` },
            },
          },
        ],
      },
    ],
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="CookMantra_Postman_Collection.json"');
  res.json(postmanCollection);
};
