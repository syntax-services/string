import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { PremiumHome } from "@/components/ui/custom-icons";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, UserPlus, Loader2, Store, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Business {
  id: string;
  company_name: string;
  logo_url: string | null;
  verified: boolean | null;
}

interface Product {
  id: string;
  name: string;
  business_id: string;
  price?: number | null;
  image_url?: string | null;
  description?: string | null;
}

interface Service {
  id: string;
  name: string;
  business_id: string;
  images?: string[] | null;
  price_min?: number | null;
  price_max?: number | null;
  description?: string | null;
}

interface DiscoverItem {
  id: string;
  name: string;
  price: number | string;
  image_url: string | null;
  description: string | null;
  business: Business;
  isService: boolean;
  aspectRatio: string;
}

export default function CustomerDiscover() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [items, setItems] = useState<DiscoverItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<DiscoverItem | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: businessList } = await supabase
          .from("public_businesses")
          .select(`
            id, company_name, logo_url, verified,
            products(id, name, business_id, price, image_url, description),
            services(id, name, business_id, images, price_min, price_max, description)
          `)
          .order("created_at", { ascending: false });

        if (businessList) {
          setBusinesses(businessList);
          
          // Flatten into DiscoverItems
          const flatItems: DiscoverItem[] = [];
          businessList.forEach((biz: any) => {
            if (biz.products) {
              biz.products.forEach((prod: any) => {
                flatItems.push({
                  id: prod.id,
                  name: prod.name,
                  price: prod.price || 0,
                  image_url: prod.image_url || null,
                  description: prod.description || null,
                  business: {
                    id: biz.id,
                    company_name: biz.company_name,
                    logo_url: biz.logo_url,
                    verified: biz.verified
                  },
                  isService: false,
                  aspectRatio: Math.random() > 0.5 ? "aspect-[3/4]" : "aspect-square"
                });
              });
            }
            if (biz.services) {
              biz.services.forEach((srv: any) => {
                flatItems.push({
                  id: srv.id,
                  name: srv.name,
                  price: srv.price_min ? `₦${Number(srv.price_min).toLocaleString()}` : "Contact",
                  image_url: srv.images?.[0] || null,
                  description: srv.description || null,
                  business: {
                    id: biz.id,
                    company_name: biz.company_name,
                    logo_url: biz.logo_url,
                    verified: biz.verified
                  },
                  isService: true,
                  aspectRatio: Math.random() > 0.5 ? "aspect-[4/5]" : "aspect-square"
                });
              });
            }
          });
          
          // Shuffle items for Pinterest feed vibe
          for (let i = flatItems.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [flatItems[i], flatItems[j]] = [flatItems[j], flatItems[i]];
          }
          
          setItems(flatItems);
        }
      } catch (err) {
        console.error("Error fetching discover items:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(item => 
      (item.name || "").toLowerCase().includes(q) || 
      (item.business?.company_name || "").toLowerCase().includes(q)
    );
  }, [items, search]);

  const handleAddToCart = (item: DiscoverItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    addToCart.mutate({
      businessId: item.business.id,
      productId: !item.isService ? item.id : undefined,
      serviceId: item.isService ? item.id : undefined,
      quantity: 1
    });
  };

  const handleFollowStore = async (businessId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!user) {
      toast({ title: "Please log in to follow stores" });
      return;
    }
    try {
      const { data: customer } = await supabase.from('customers').select('id').eq('user_id', user.id).maybeSingle();
      if (customer) {
        await supabase.from("saved_businesses").insert({
          customer_id: customer.id,
          business_id: businessId
        });
        toast({ title: "Store followed! ✨" });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to follow store" });
    }
  };

  return (
    <DashboardLayout>
      <div className="current-page-container min-h-screen bg-background pb-20 pt-20 px-4 md:px-6 animate-fade-in max-w-7xl mx-auto">
        
        {/* Search Header */}
        <div className="mb-6 sticky top-20 z-30 bg-background/80 backdrop-blur-md py-2">
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for products, stores, or ideas..."
              className="pl-11 h-12 rounded-[24px] bg-card border-border/40 text-[15px] font-medium shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Masonry Feed */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="font-semibold text-lg">No items found</p>
            <p className="text-sm">Try searching for something else.</p>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 pb-10">
            {filteredItems.map(item => (
              <div 
                key={item.id} 
                className="break-inside-avoid relative group bg-card rounded-[24px] overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-all cursor-pointer"
                onClick={() => setSelectedItem(item)}
              >
                {/* Image */}
                <div className={cn("w-full bg-muted overflow-hidden", item.aspectRatio)}>
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-accent/20 text-muted-foreground">
                      No Image
                    </div>
                  )}
                </div>

                {/* Overlays & Actions */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background shadow-sm" onClick={e => e.stopPropagation()}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/business/${item.business.id}`) }}>
                        <Store className="mr-2 h-4 w-4" /> Visit Store
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => handleFollowStore(item.business.id, e)}>
                        <UserPlus className="mr-2 h-4 w-4" /> Follow Store
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Info Bar */}
                <div className="p-3.5 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[13px] leading-tight text-foreground truncate">{item.name}</h3>
                      <p className="font-extrabold text-[14px] text-primary mt-0.5">
                        {typeof item.price === "number" ? `₦${item.price.toLocaleString()}` : item.price}
                      </p>
                    </div>
                    {/* Add to Cart Premium String Button */}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 shrink-0 rounded-full hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground"
                      onClick={(e) => handleAddToCart(item, e)}
                    >
                      <PremiumHome className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  {/* Store Name */}
                  <div className="flex items-center gap-1.5 opacity-80">
                    <div className="w-4 h-4 rounded-full bg-muted overflow-hidden shrink-0">
                      {item.business.logo_url && <img src={item.business.logo_url} alt="logo" className="w-full h-full object-cover" />}
                    </div>
                    <p className="text-[10px] font-semibold text-muted-foreground truncate hover:underline" onClick={(e) => { e.stopPropagation(); navigate(`/business/${item.business.id}`) }}>
                      {item.business.company_name}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Item Details Modal */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-md w-[95vw] rounded-[32px] p-0 overflow-hidden bg-background border-border/50 gap-0">
          {selectedItem && (
            <div className="flex flex-col max-h-[85vh]">
              <div className="relative w-full aspect-square bg-muted shrink-0">
                {selectedItem.image_url && (
                  <img src={selectedItem.image_url} alt={selectedItem.name} className="w-full h-full object-cover" />
                )}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm cursor-pointer" onClick={() => navigate(`/business/${selectedItem.business.id}`)}>
                  {selectedItem.business.logo_url && (
                    <img src={selectedItem.business.logo_url} className="w-5 h-5 rounded-full object-cover" />
                  )}
                  <span className="text-xs font-bold">{selectedItem.business.company_name}</span>
                  {selectedItem.business.verified && <span className="text-[10px] bg-primary text-white w-3.5 h-3.5 rounded-full flex items-center justify-center">✓</span>}
                </div>
              </div>
              
              <ScrollArea className="flex-1 p-5">
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h2 className="text-2xl font-black leading-tight">{selectedItem.name}</h2>
                      <p className="text-xl font-bold text-primary mt-1">
                        {typeof selectedItem.price === "number" ? `₦${selectedItem.price.toLocaleString()}` : selectedItem.price}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-full px-4 h-9 font-bold flex shrink-0" onClick={() => handleFollowStore(selectedItem.business.id)}>
                      <UserPlus className="w-3.5 h-3.5 mr-1.5" /> Follow
                    </Button>
                  </div>

                  <div className="prose prose-sm dark:prose-invert">
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {selectedItem.description || "No description provided for this item. Contact the store for more information."}
                    </p>
                  </div>
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-border/40 bg-card shrink-0 flex gap-3">
                <Button 
                  className="flex-1 h-12 rounded-full font-bold text-base shadow-premium"
                  onClick={() => { handleAddToCart(selectedItem); setSelectedItem(null); }}
                  disabled={addToCart.isPending}
                >
                  {addToCart.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <PremiumHome className="mr-2 h-6 w-6" />}
                  Add to Cart
                </Button>
                <Button variant="secondary" className="h-12 w-12 rounded-full p-0" onClick={() => navigate(`/business/${selectedItem.business.id}`)}>
                  <Store className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
