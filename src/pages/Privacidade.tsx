import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { storefrontApiRequest } from "@/lib/shopify";

const SHOP_POLICY_QUERY = `
  query GetPrivacyPolicy {
    shop {
      privacyPolicy {
        title
        body
      }
    }
  }
`;

export default function Privacidade() {
  const [policy, setPolicy] = useState<{ title: string; body: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPolicy() {
      try {
        const data = await storefrontApiRequest(SHOP_POLICY_QUERY);
        const p = data?.data?.shop?.privacyPolicy;
        if (p) setPolicy(p);
      } catch (err) {
        console.error("Failed to fetch privacy policy:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPolicy();
  }, []);

  return (
    <section className="py-16 md:py-24 px-6 md:px-10">
      <div className="max-w-[700px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          {loading ? (
            <div className="space-y-4">
              <div className="h-8 w-48 bg-muted animate-pulse rounded" />
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
              <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
              <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
            </div>
          ) : policy ? (
            <>
              <h1 className="text-4xl md:text-5xl font-black mb-8 text-center">Política de Privacidade</h1>
              <div
                className="prose prose-sm prose-neutral dark:prose-invert max-w-none opacity-70 leading-relaxed [&_a]:underline [&_a]:hover:opacity-100"
                dangerouslySetInnerHTML={{ __html: policy.body }}
              />
            </>
          ) : (
            <>
              <h1 className="text-3xl font-light mb-8">Política de Privacidade</h1>
              <p className="text-sm opacity-60">Política de privacidade não encontrada. Certifique-se de que ela foi cadastrada nas configurações da loja.</p>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}
