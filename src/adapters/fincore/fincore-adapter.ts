import { FinCoreClient } from "@fincore/sdk";

class FinCoreAdapter {
  private client: FinCoreClient;

  constructor(baseUrl: string, apiKey: string) {
    this.client = new FinCoreClient({
      baseUrl: baseUrl,
      apiKey: apiKey,
    });
  }

  async runDemo() {
    const demo = await this.client.demo({
      idempotencyKey: this.client.idempotencyKey("demo"),
      source: "sdk",
    });
    return demo.data;
  }

  async executeIntent(
    intentType: string,
    deploymentId: string,
    parameters: Record<string, string>
  ) {
    const execution = await this.client.execution.executeIntent({
      intentType,
      deploymentId,
      parameters,
    });
    return execution.data;
  }
}

export default FinCoreAdapter;
