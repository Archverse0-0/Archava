import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/layout/PageHero";
import { ShoppingBag, ExternalLink } from "lucide-react";

export default function Merch() {
  useEffect(() => {
    // Auto-redirect to official White Rock Shopify Store
    window.location.href = "https://shops.whiterockbali.com/";
  }, []);

  return (
    <div className="bg-[hsl(222_47%_9%)] min-h-screen">
      <PageHero
        bgImage="/assets/whiterock/aerial.jpg"
        eyebrow="OFFICIAL MERCHANDISE"
        title="WHITE ROCK OFFICIAL STORE"
        subtitle="Redirecting to the official White Rock Beach Club merchandise store..."
        height="tall"
      >
        <div className="mt-8">
          <a href="https://shops.whiterockbali.com/" target="_blank" rel="noreferrer">
            <Button
              variant="luxury"
              size="lg"
              className="rounded-full px-8 py-4 text-xs font-bold uppercase tracking-wider shadow-lg hover:scale-105 transition-all duration-300"
            >
              <ShoppingBag className="h-4 w-4 mr-2" /> GO TO OFFICIAL STORE <ExternalLink className="h-4 w-4 ml-2 opacity-80" />
            </Button>
          </a>
        </div>
      </PageHero>
    </div>
  );
}
