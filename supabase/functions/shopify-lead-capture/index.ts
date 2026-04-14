import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, phone, source } = await req.json();

    if (!email && !phone) {
      return new Response(
        JSON.stringify({ error: "Email ou telefone é obrigatório." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const shopifyToken = Deno.env.get("SHOPIFY_ACCESS_TOKEN") || Deno.env.get("SHOPIFY_ADMIN_TOKEN");
    if (!shopifyToken) {
      throw new Error("Shopify admin token not configured");
    }

    const storeDomain = "efxqrr-1y.myshopify.com";
    const apiVersion = "2025-07";

    // Step 1: Create or find customer
    const customerData: Record<string, unknown> = {
      tags: "Popup",
      accepts_marketing: true,
      accepts_marketing_updated_at: new Date().toISOString(),
      marketing_opt_in_level: "single_opt_in",
    };

    if (email) customerData.email = email;
    if (phone) customerData.phone = phone;

    // Try to create customer
    const createRes = await fetch(
      `https://${storeDomain}/admin/api/${apiVersion}/customers.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": shopifyToken,
        },
        body: JSON.stringify({ customer: customerData }),
      }
    );

    const createBody = await createRes.json();

    if (createRes.ok && createBody.customer) {
      return new Response(
        JSON.stringify({ success: true, customerId: createBody.customer.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If customer already exists, find and update tags
    if (createBody.errors) {
      const errorMsg = JSON.stringify(createBody.errors);
      
      if (errorMsg.includes("has already been taken")) {
        // Search for existing customer
        const searchQuery = email
          ? `email:${email}`
          : `phone:${phone}`;

        const searchRes = await fetch(
          `https://${storeDomain}/admin/api/${apiVersion}/customers/search.json?query=${encodeURIComponent(searchQuery)}`,
          {
            headers: { "X-Shopify-Access-Token": shopifyToken },
          }
        );

        const searchBody = await searchRes.json();
        const existingCustomer = searchBody.customers?.[0];

        if (existingCustomer) {
          // Add "Popup" tag if not already present
          const currentTags = existingCustomer.tags || "";
          const tagsArray = currentTags.split(",").map((t: string) => t.trim()).filter(Boolean);
          
          if (!tagsArray.includes("Popup")) {
            tagsArray.push("Popup");
            
            await fetch(
              `https://${storeDomain}/admin/api/${apiVersion}/customers/${existingCustomer.id}.json`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  "X-Shopify-Access-Token": shopifyToken,
                },
                body: JSON.stringify({
                  customer: {
                    id: existingCustomer.id,
                    tags: tagsArray.join(", "),
                    accepts_marketing: true,
                  },
                }),
              }
            );
          }

          return new Response(
            JSON.stringify({ success: true, customerId: existingCustomer.id, existing: true }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      return new Response(
        JSON.stringify({ error: "Não foi possível processar o cadastro.", details: createBody.errors }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Lead capture error:", err);
    return new Response(
      JSON.stringify({ error: "Erro interno." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
