import { registerOTel } from '@vercel/otel'
import { trace } from "@opentelemetry/api";

// Next.js instrumentation function
export async function register() {
  const tracer = trace.getTracer('nextjs-app');

  // Example: Log every server-side request
  tracer.startActiveSpan('request-handler', (span) => {
    span.end();
  });
}