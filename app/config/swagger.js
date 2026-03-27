import swaggerJSDoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "News Blog API",
      version: "1.0.0",
      description: `
REST API for News Blog Application.

🔓 Public APIs:
- Read news with advanced filters
- Search by keyword
- Filter by category (slug or ID)
- Date range filtering
- Pagination & sorting

🔐 Protected APIs:
- Create / Update / Delete news
- Admin category & user management

🔑 Authentication:
- JWT (cookie + bearer supported)
      `,
    },

    servers: [
      {
        url: "https://news-blog-api.onrender.com",
        description: "Production (Render)",
      },
      {
        url: "http://localhost:5000",
        description: "Local development",
      },
    ],

    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "accessToken",
          description: "JWT stored in HTTP-only cookie",
        },

        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT sent in Authorization header",
        },
      },

      schemas: {
        News: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "6970fe385e98db8604b19118",
            },
            title: {
              type: "string",
              example: "AI is transforming development",
            },
            slug: {
              type: "string",
              example: "ai-is-transforming-development",
            },
            content: {
              type: "string",
              example: "Artificial Intelligence is changing software...",
            },

            category: {
              type: "object",
              properties: {
                _id: {
                  type: "string",
                  example: "65a9f2c3e8d9f10293ab4567",
                },
                name: {
                  type: "string",
                  example: "Technology",
                },
                slug: {
                  type: "string",
                  example: "technology",
                },
              },
            },

            image: {
              type: "object",
              properties: {
                url: {
                  type: "string",
                  example:
                    "https://res.cloudinary.com/demo/image/upload/sample.jpg",
                },
                public_id: {
                  type: "string",
                  example: "news_image/sample",
                },
              },
            },

            author: {
              type: "string",
              example: "696d048f89d9a5586629c452",
            },

            isPublished: {
              type: "boolean",
              example: true,
            },

            publishedAt: {
              type: "string",
              example: "2026-01-21T16:26:32.283Z",
            },

            createdAt: {
              type: "string",
              example: "2026-01-21T16:26:32.286Z",
            },

            updatedAt: {
              type: "string",
              example: "2026-01-21T16:26:32.286Z",
            },
          },
        },

        Category: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "65a9f2c3e8d9f10293ab4567",
            },
            name: {
              type: "string",
              example: "Technology",
            },
            slug: {
              type: "string",
              example: "technology",
            },
            description: {
              type: "string",
              example: "Tech related news",
            },
            isActive: {
              type: "boolean",
              example: true,
            },
            createdAt: {
              type: "string",
              example: "2026-01-01T10:00:00Z",
            },
            updatedAt: {
              type: "string",
              example: "2026-01-01T10:00:00Z",
            },
          },
        },

        User: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "696d048f89d9a5586629c452",
            },
            name: {
              type: "string",
              example: "Rahul Verma",
            },
            email: {
              type: "string",
              example: "rahul@test.com",
            },
            role: {
              type: "string",
              enum: ["user", "editor", "admin"],
              example: "admin",
            },
            isActive: {
              type: "boolean",
              example: true,
            },
            createdAt: {
              type: "string",
              example: "2026-01-01T10:00:00Z",
            },
          },
        },

        Pagination: {
          type: "object",
          properties: {
            page: {
              type: "integer",
              example: 1,
            },
            limit: {
              type: "integer",
              example: 10,
            },
            totalPages: {
              type: "integer",
              example: 5,
            },
            totalResults: {
              type: "integer",
              example: 50,
            },
          },
        },
      },
    },
  },

  apis: ["./app/routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
export default swaggerSpec;
