import { NodeSdk } from "@effect/opentelemetry";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { ConsoleSpanExporter } from "@opentelemetry/sdk-trace-base";

// Set up tracing with the OpenTelemetry SDK
export const NodeSdkLive = NodeSdk.layer(() => ({
  resource: {
    serviceName: "handedruck",
    attributes: {
      "handedruck.version": "1.0.0",
      "handedruck.environment": process.env.NODE_ENV,
      "handedruck.service": "handedruck",
    },
  },
  // Export span data to the console
  spanProcessor: new BatchSpanProcessor(new ConsoleSpanExporter()),
}));
