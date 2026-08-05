const YieldVault = require('../models/YieldVault');

exports.getExploreVaults = async (req, res) => {
  try {
    const { category } = req.query;
    // Build flexible dynamic filtering criteria
    const filter = {};
    if (category && category !== 'ALL') {
      filter.category = category;
    }

    const strategies = await YieldVault.find(filter);

    // Seed mock items to quickly start up testing fields if empty
    if (strategies.length === 0) {
      const fallbackData = await YieldVault.create([
        { name: 'Snake Yield', category: 'AGGRESSIVE', desc: 'Delta-neutral liquidity optimization strategy.', apy: 32.4, tvl: 42800000, risk: 3, pair: 'ETH / USDC', icon: 'fa-solid fa-bolt', themeColor: '#a64dff' },
        { name: 'Lending Pools', category: 'LENDING', desc: 'Institutional grade lending for stable yields.', apy: 8.12, tvl: 124500000, risk: 1, pair: 'USDT / DAI', icon: 'fa-solid fa-landmark', themeColor: '#00e0ff' },
        { name: 'Liquidity Prov.', category: 'AGGRESSIVE', desc: 'Market making strategies across DEX pools.', apy: 54.8, tvl: 12100000, risk: 4, pair: 'SOL / SNAKE', icon: 'fa-solid fa-droplet', themeColor: '#ff4d6d' }
      ]);
      return res.status(200).json({ success: true, strategies: fallbackData });
    }

    res.status(200).json({ success: true, strategies });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};