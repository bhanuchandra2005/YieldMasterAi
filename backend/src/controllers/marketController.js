export async function getMarketPrices(req, res, next) {
  try {
    const { location } = req.query;
    
    // Simulate real-ish market values in INR
    const basePrices = {
      Rice: 2200,   // Rs per quintal
      Wheat: 2125,
      Maize: 1850,
      Cotton: 6020,
      Sugarcane: 315,
      Soybean: 4600
    };
    
    // Add small randomized fluctuations to seem live
    const mockVariations = Object.entries(basePrices).map(([crop, price]) => {
        const fluctuation = (Math.random() * 0.1) - 0.05; // -5% to +5%
        const currentPrice = price + (price * fluctuation);
        const trend = fluctuation >= 0 ? 'up' : 'down';
        return {
           crop,
           pricePerQuintal: Math.round(currentPrice),
           trend,
           changePct: parseFloat(Math.abs(fluctuation * 100).toFixed(1))
        };
    });

    return res.json({ 
      location: location || 'Regional APMC', 
      prices: mockVariations, 
      lastUpdated: new Date().toISOString() 
    });
  } catch (err) {
    next(err);
  }
}
