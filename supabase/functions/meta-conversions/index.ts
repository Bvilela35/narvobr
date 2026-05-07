import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { sendMetaServerEvent, type MetaServerEventName } from "../_shared/meta.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MetaEventRequest {
  event_name: MetaServerEventName;
  event_id: string;
  event_time?: number;
  event_source_url: string;
  custom_data?: Record<string, unknown>;
  user_data?: Record<string, unknown>;
  attribution_data?: Record<string, unknown>;
  test_event_code?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let body: MetaEventRequest;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON payload" }, 400);
  }

  if (!body?.event_name || !body?.event_id || !body?.event_source_url) {
    return json({ error: "Missing required fields: event_name, event_id, event_source_url" }, 400);
  }

  try {
    const result = await sendMetaServerEvent({
      event_name: body.event_name,
      event_id: body.event_id,
      event_time: body.event_time,
      event_source_url: body.event_source_url,
      custom_data: body.custom_data,
      user_data: body.user_data,
      attribution_data: body.attribution_data,
      test_event_code: body.test_event_code,
    }, req);

    return json(result, 200);
  } catch (error) {
    console.error("[meta-conversions] unexpected error:", error);
    return json({ error: "Internal server error" }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
