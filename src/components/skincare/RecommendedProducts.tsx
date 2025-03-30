
import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ExternalLink } from 'lucide-react';
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
  if (!products || products.length === 0) {
    return (
      <Card className="border-amber-100 shadow-sm h-full">
        <CardHeader className="bg-amber-50/50">
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <ShoppingBag className="h-5 w-5 text-amber-600" />
            {title}
          </CardTitle>
          <CardDescription className="text-slate-600">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 flex flex-col items-center justify-center text-center min-h-[200px]">
          <p className="text-slate-600 mb-2">
            No products have been recommended yet.
          </p>
          <p className="text-sm text-slate-500">
            Ask the AI about products for your skin type and concerns to see recommendations here.
          </p>
        </CardContent>
      </Card>
    );
  }

  const isAmazonLink = (link: string) => {
    return link && link.includes('amazon.com');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-amber-100 shadow-sm h-full">
        <CardHeader className="bg-amber-50/50">
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <ShoppingBag className="h-5 w-5 text-amber-600" />
            {title}
          </CardTitle>
          <CardDescription className="text-slate-600">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-3">
            {products.map((product, index) => (
              <div 
                key={index} 
                className="p-3 rounded-lg border border-amber-100 bg-white flex flex-col"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="h-6 w-6 rounded-full p-1 flex items-center justify-center bg-amber-50 text-amber-800 border-amber-200">
                      {index + 1}
                    </Badge>
                    <h3 className="font-medium text-slate-800">{product.product_name}</h3>
                  </div>
                  
                  {product.product_link && (
                    <a 
                      href={product.product_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-amber-600 hover:text-amber-800"
                    >
                      {isAmazonLink(product.product_link) ? (
                        <Badge variant="outline" className="flex items-center gap-1 text-xs bg-amber-50 text-amber-700 border-amber-200">
                          Amazon
                          <ExternalLink className="h-3 w-3" />
                        </Badge>
                      ) : (
                        <ExternalLink className="h-4 w-4" />
                      )}
                    </a>
                  )}
                </div>
                
                {product.product_description && (
                  <p className="text-sm text-slate-600 mt-1">
                    {product.product_description}
                  </p>
                )}
                
                {product.product_link && (
                  <div className="mt-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-xs border-amber-200 text-amber-700 hover:bg-amber-50"
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
