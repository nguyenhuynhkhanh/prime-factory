/**
 * POST /api/v1/installs — CLI install registration (deprecated).
 *
 * This endpoint has been superseded by the Admin API Key Management flow.
 * API keys are now provisioned by admins via the dashboard.
 * Returns 410 Gone for all requests.
 */

export async function POST(): Promise<Response> {
  return Response.json(
    { error: "Use admin dashboard to generate API keys." },
    { status: 410 }
  );
}
