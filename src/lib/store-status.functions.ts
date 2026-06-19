import { createServerFn } from "@tanstack/react-start";

const SHOPIFY_API_VERSION = "2025-07";
const SHOP_DOMAIN = "golden-grain-gateway-3b1vm.myshopify.com";

export interface StoreStatus {
  claimed: boolean;
  paymentsEnabled: boolean;
  planName: string | null;
  error: string | null;
}

/**
 * Public: returns whether the Shopify store is claimed and whether it can
 * accept real payments. Used to render a storefront banner. Returns only
 * boolean flags + plan name (non-sensitive).
 */
export const getStoreStatus = createServerFn({ method: "GET" }).handler(
  async (): Promise<StoreStatus> => {
    const token = process.env.SHOPIFY_ACCESS_TOKEN;
    if (!token) {
      return {
        claimed: false,
        paymentsEnabled: false,
        planName: null,
        error: "Shopify admin token not configured.",
      };
    }

    const query = `{
      shop {
        plan { displayName partnerDevelopment shopifyPlus }
      }
    }`;

    try {
      const res = await fetch(
        `https://${SHOP_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
        {
          method: "POST",
          headers: {
            "X-Shopify-Access-Token": token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query }),
        },
      );

      if (!res.ok) {
        return {
          claimed: false,
          paymentsEnabled: false,
          planName: null,
          error: `Shopify Admin API error (${res.status}).`,
        };
      }

      const json = (await res.json()) as {
        data?: {
          shop?: {
            plan?: {
              displayName?: string;
              partnerDevelopment?: boolean;
              shopifyPlus?: boolean;
            };
          };
        };
      };

      const plan = json.data?.shop?.plan;
      const isDev = !!plan?.partnerDevelopment;
      // Unclaimed dev stores cannot accept real payments.
      const claimed = !isDev;
      const paymentsEnabled = claimed;

      return {
        claimed,
        paymentsEnabled,
        planName: plan?.displayName ?? null,
        error: null,
      };
    } catch (e) {
      return {
        claimed: false,
        paymentsEnabled: false,
        planName: null,
        error: e instanceof Error ? e.message : "Unknown error",
      };
    }
  },
);
