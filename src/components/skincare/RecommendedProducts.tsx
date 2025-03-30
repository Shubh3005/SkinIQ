
import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

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
                </div>
                
                {product.product_description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {product.product_description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
