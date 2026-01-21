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
- Pagination

🔐 Protected APIs:
- Create / Update / Delete news (Editor, Admin)
- User management (Admin only)

🔑 Authentication:
- JWT-based
- Stored in **HTTP-only cookies**
- Frontend must send requests with \`credentials: "include"\`
      `,
    },

    servers: [
      {
        url: "http://localhost:5000",
        description: "Local development server",
      },
      {
        url: "https://news-blog-api.onrender.com",
        description: "Production (Render)",
      },
    ],

    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "accessToken",
        },
      },

      schemas: {
        News: {
          type: "object",
          properties: {
            _id: { type: "string", example: "64fd123abc" },
            title: {
              type: "string",
              example: "India Wins Historic Test Match",
            },
            slug: { type: "string", example: "india-wins-historic-test-match" },
            content: {
              type: "string",
              example:
                "India secured a historic victory after an intense five-day match.",
            },
            category: {
              type: "string",
              enum: ["sports", "technology", "business", "politics", "health"],
              example: "sports",
            },
            isPublished: { type: "boolean", example: true },
            image: {
              type: "object",
              properties: {
                url: {
                  type: "string",
                  example: "https://res.cloudinary.com/demo/image.jpg",
                },
              },
            },
            author: { type: "string", example: "64fduser123" },
            createdAt: { type: "string", example: "2024-01-01T10:00:00Z" },
          },
        },

        User: {
          type: "object",
          properties: {
            _id: { type: "string", example: "64fduser123" },
            name: { type: "string", example: "Rahul Verma" },
            email: { type: "string", example: "rahul@test.com" },
            role: {
              type: "string",
              enum: ["user", "editor", "admin"],
              example: "editor",
            },
            isActive: { type: "boolean", example: true },
          },
        },
      },
    },
  },

  apis: ["./app/routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;
