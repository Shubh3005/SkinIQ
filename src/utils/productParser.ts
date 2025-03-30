
/**
 * Parses product information from AI response text
 */
export interface Product {
  product_name: string;
  product_link?: string;
  product_description?: string;
}

export const parseProductsFromText = (text: string): Product[] => {
  try {
    const products: Product[] = [];
    
    // Look for product patterns in the text
    // Pattern 1: Product name with Amazon link
    const amazonRegex = /\*\*([^*]+)\*\*\s*-\s*(?:\[Amazon\]\((https?:\/\/(?:www\.)?amazon\.com[^)]+)\)|\(?(https?:\/\/(?:www\.)?amazon\.com[^)]+)\)?)/g;
    let match;
    
    while ((match = amazonRegex.exec(text)) !== null) {
      products.push({
        product_name: match[1].trim(),
        product_link: match[2],
        product_description: ''
      });
    }
    
    // Pattern 2: Numbered list with product names
    const numberedListRegex = /\d+\.\s+([^:]+)(?::\s*([^(]+))?(?:\((https?:\/\/[^)]+)\))?/g;
    
    while ((match = numberedListRegex.exec(text)) !== null) {
      // Skip if we already have this product from the Amazon regex
      const productName = match[1].trim();
      if (!products.some(p => p.product_name === productName)) {
        products.push({
          product_name: productName,
          product_description: match[2] ? match[2].trim() : '',
          product_link: match[3] || undefined
        });
      }
    }
    
    // Pattern 3: Product name with description
    const productDescRegex = /-\s+([^:]+):\s+([^(]+)(?:\((https?:\/\/[^)]+)\))?/g;
    
    while ((match = productDescRegex.exec(text)) !== null) {
      // Skip if we already have this product
      const productName = match[1].trim();
      if (!products.some(p => p.product_name === productName)) {
        products.push({
          product_name: productName,
          product_description: match[2].trim(),
          product_link: match[3] || undefined
        });
      }
    }
    
    // Pattern 4: Markdown format
    const markdownProductRegex = /\*\*([^*]+)\*\*(?:\s*-\s*|\s*:\s*)([^(]*)(?:\((https?:\/\/[^)]+)\))?/g;
    
    while ((match = markdownProductRegex.exec(text)) !== null) {
      const productName = match[1].trim();
      if (!products.some(p => p.product_name === productName)) {
        products.push({
          product_name: productName,
          product_description: match[2] ? match[2].trim() : '',
          product_link: match[3] || undefined
        });
      }
    }
    
    // If no products found with the regexes, try a more general approach
    if (products.length === 0) {
      // Split by lines to find product-like entries
      const lines = text.split('\n');
      
      // Try to find lines that have product indicators
      for (const line of lines) {
        // Skip short lines and lines without product indicators
        if (line.length < 10 || (!line.includes('product') && !line.includes('recommend') && !line.match(/\b[A-Z][a-zA-Z\s]+\b/))) {
          continue;
        }
        
        // Look for product names in quotes, bold formatting, or capitalized words
        const linkMatch = line.match(/(https?:\/\/[^\s]+)/);
        const nameMatch = line.match(/\*\*([^*]+)\*\*|"([^"]+)"|'([^']+)'|([A-Z][a-zA-Z\s&]+\b[^,.:])/);
        
        if (nameMatch) {
          const name = nameMatch[1] || nameMatch[2] || nameMatch[3] || nameMatch[4];
          
          // Skip if it's not likely a product name or if we already have this product
          if (name && name.length > 3 && !products.some(p => p.product_name === name.trim())) {
            // Try to extract a description
            let description = '';
            if (line.includes(':')) {
              const parts = line.split(':');
              if (parts.length > 1) {
                description = parts[1].trim();
              }
            } else if (line.includes('-')) {
              const parts = line.split('-');
              if (parts.length > 1) {
                description = parts[1].trim();
              }
            }
            
            products.push({
              product_name: name.trim(),
              product_link: linkMatch ? linkMatch[1] : undefined,
              product_description: description || undefined
            });
          }
        }
      }
    }
    
    // Add default Amazon links for well-known products if they don't have links
    for (let product of products) {
      if (!product.product_link) {
        // Add Amazon search link based on product name
        const searchQuery = encodeURIComponent(product.product_name);
        product.product_link = `https://www.amazon.com/s?k=${searchQuery}`;
      }
    }
    
    console.log("Parsed products:", products);
    return products;
  } catch (error) {
    console.error('Error parsing products:', error);
    return [];
  }
};
