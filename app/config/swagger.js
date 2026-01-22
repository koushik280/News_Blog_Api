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
- Read news
- Filter by category
- Pagination (query-based & payload-based)

🔐 Protected APIs:
- Create / Update / Delete news (Editor, Admin)
- User management (Admin only)

🔑 Authentication:
- JWT-based authentication
- Supports BOTH:
  • HTTP-only cookies (browser-based apps)
  • Authorization header (Bearer token)
- Frontend using cookies must send requests with credentials: "include"
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
              example:
                "Artificial Intelligence Is Transforming Modern Software Development",
            },
            slug: {
              type: "string",
              example:
                "artificial-intelligence-is-transforming-modern-software-development",
            },
            content: {
              type: "string",
              example:
                "Artificial Intelligence is rapidly changing the way software applications are built.",
            },
            category: {
              type: "string",
              enum: [
                "sports",
                "technology",
                "business",
                "politics",
                "health",
                "entertainment",
              ],
              example: "technology",
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
