
import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Link2, ExternalLink } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Product {
  product_name: string;
  product_link?: string;
  product_description?: string;
}

interface RecommendedProductsProps {
  products: Product[];
  title?: string;
  description?: string;
}

export const RecommendedProducts = ({ 
  products, 
  title = "Recommended Products",
  description = "Products that may help with your skin concerns"
}: RecommendedProductsProps) => {
  if (!products.length) return null;

  const isAmazonLink = (link: string) => {
    return link && link.includes('amazon.com');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-2 border-primary/20 shadow-lg shadow-primary/10 h-full">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
          <CardDescription>
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4">
            {products.map((product, index) => (
              <div 
                key={index} 
                className="p-4 rounded-lg border border-primary/10 bg-muted/50 flex flex-col"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="h-6 w-6 rounded-full p-1 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <h3 className="font-medium">{product.product_name}</h3>
                  </div>
                  
                  {product.product_link && (
                    <a 
                      href={product.product_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80"
                    >
                      {isAmazonLink(product.product_link) ? (
                        <Badge variant="outline" className="flex items-center gap-1 text-xs">
                          Amazon
                          <ExternalLink className="h-3 w-3" />
                        </Badge>
                      ) : (
                        <Link2 className="h-4 w-4" />
                      )}
                    </a>
                  )}
                </div>
                
                {product.product_description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {product.product_description}
                  </p>
                )}
                
                {product.product_link && (
                  <div className="mt-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-xs"
                      asChild
                    >
                      <a 
                        href={product.product_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1"
                      >
                        <ShoppingBag className="h-3 w-3" />
                        View Product
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
