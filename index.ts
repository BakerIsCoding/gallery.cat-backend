import cors from "cors";
import express, { Express } from "express";
import http from "node:http";
import "reflect-metadata";

import { validationMetadatasToSchemas } from "class-validator-jsonschema";
import {
  Action,
  getMetadataArgsStorage,
  useContainer,
  useExpressServer,
} from "routing-controllers";
import { useContainer as useValidatorContainer } from "class-validator";
import { routingControllersToSpec } from "routing-controllers-openapi";
import swaggerUi from "swagger-ui-express";
import { AuthController } from "@controllers/auth/AuthController";
import { ConsolePatcher } from "@utils/ConsoleMethods";
import Container from "typedi";
import { GlobalErrorHandler } from "src/middlewares/GlobalErrorHandler";
import { rateLimiter } from "@config/rateLimiterInstance";
import Database from "config/db";
import { PostsController } from "@controllers/post/PostController";
import { UserRole } from "@interfaces/auth";
import { AuthMiddleware } from "src/middlewares/AuthMiddleware";
import envLoad from "@config/envLoader";

const app: Express = express();

const consolePatcher = new ConsolePatcher();
consolePatcher.patch();

const databaseConnection = Database.getInstance();
databaseConnection.testConnection();

const allowedDomains = [
  process.env.FRONTEND_URL,
  "http://127.0.0.1:5000",
  "http://localhost:5000",
  "http://gallery.cat",
  "https://gallery.cat",
];

const corsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) {
    if (!origin || allowedDomains.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("No permitido por el servidor."));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(rateLimiter.middleware);

useContainer(Container, { fallback: true });
useValidatorContainer(Container, { fallback: true, fallbackOnErrors: true });

const authorizationChecker = async (action: Action, roles: UserRole[]) => {
  const service = Container.get(AuthMiddleware);
  return service.authorizationChecker(action, roles);
};

const currentUserChecker = async (action: Action) => {
  const service = Container.get(AuthMiddleware);
  return service.currentUserChecker(action);
};

useExpressServer(app, {
  controllers: [AuthController, PostsController],
  validation: true,
  classTransformer: true,
  defaultErrorHandler: false,
  authorizationChecker: authorizationChecker,
  currentUserChecker: currentUserChecker,
});

app.use(GlobalErrorHandler);

const schemas = validationMetadatasToSchemas({
  refPointerPrefix: "#/components/schemas/",
});

const storage = getMetadataArgsStorage();
const swaggerSpec = routingControllersToSpec(
  storage,
  {
    controllers: [AuthController, PostsController],
    routePrefix: "",
  },
  {
    components: {
      schemas,
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  }
);

const swaggerUiOptions = {
  swaggerOptions: {},
  customCss: `
    #host-input {
      padding: 5px;
      border: 1px solid #ddd;
      margin-bottom: 10px;
      width: 300px;
    }
  `,
  customSiteTitle: "API gallery.cat",
};

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, swaggerUiOptions)
);

app.get("/api-docs.json", (_req, res) => res.json(swaggerSpec));

const httpServer = http.createServer(app);

httpServer
  .listen(envLoad("PORT") || 5000, () => {
    console.log("SERVER STARTED", `PORT: ${envLoad("PORT") || 5000}`);
  })
  .on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.error(`PORT ${envLoad("PORT")} is already in use`);
      process.exit(1);
    } else {
      throw err;
    }
  });

export { app };
