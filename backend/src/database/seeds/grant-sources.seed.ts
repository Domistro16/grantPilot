import { DataSource } from 'typeorm';
import { GrantSource } from '../../modules/scraper/entities/grant-source.entity';

export async function seedGrantSources(dataSource: DataSource): Promise<void> {
  const grantSourceRepo = dataSource.getRepository(GrantSource);

  // Check if sources already exist
  const count = await grantSourceRepo.count();
  if (count > 0) {
    console.log('Grant sources already seeded. Skipping...');
    return;
  }

  const sources = [
    // BNB Chain
    {
      name: 'BNB Chain Grants',
      url: 'https://www.bnbchain.org/en/bnb-chain-grants',
      chain_name: 'BNB Chain',
      scrape_strategy: 'static_html',
      is_active: true,
    },
    {
      name: 'BNB Chain Blog - Grants',
      url: 'https://www.bnbchain.org/en/blog',
      chain_name: 'BNB Chain',
      scrape_strategy: 'static_html',
      is_active: true,
    },

    // Solana
    {
      name: 'Solana Grants',
      url: 'https://solana.org/grants',
      chain_name: 'Solana',
      scrape_strategy: 'puppeteer',
      is_active: true,
    },
    {
      name: 'Solana Ecosystem',
      url: 'https://solana.com/ecosystem',
      chain_name: 'Solana',
      scrape_strategy: 'puppeteer',
      is_active: true,
    },

    // Ethereum
    {
      name: 'Ethereum Foundation ESP',
      url: 'https://esp.ethereum.foundation/',
      chain_name: 'Ethereum',
      scrape_strategy: 'static_html',
      is_active: true,
    },
    {
      name: 'Ethereum Blog - Grants',
      url: 'https://blog.ethereum.org/category/grants',
      chain_name: 'Ethereum',
      scrape_strategy: 'static_html',
      is_active: true,
    },

    // Polygon
    {
      name: 'Polygon Village Grants',
      url: 'https://polygon.technology/village/grants',
      chain_name: 'Polygon',
      scrape_strategy: 'puppeteer',
      is_active: true,
    },
    {
      name: 'Polygon Blog - Grants',
      url: 'https://polygon.technology/blog',
      chain_name: 'Polygon',
      scrape_strategy: 'static_html',
      is_active: true,
    },

    // Base
    {
      name: 'Base Builders',
      url: 'https://paragraph.xyz/@base/calling-based-builders',
      chain_name: 'Base',
      scrape_strategy: 'static_html',
      is_active: true,
    },
    {
      name: 'Base Ecosystem',
      url: 'https://base.org/ecosystem',
      chain_name: 'Base',
      scrape_strategy: 'puppeteer',
      is_active: true,
    },

    // Optimism
    {
      name: 'Optimism RetroPGF',
      url: 'https://app.optimism.io/retropgf',
      chain_name: 'Optimism',
      scrape_strategy: 'puppeteer',
      is_active: true,
    },
    {
      name: 'Optimism Governance',
      url: 'https://gov.optimism.io/',
      chain_name: 'Optimism',
      scrape_strategy: 'static_html',
      is_active: true,
    },

    // Arbitrum
    {
      name: 'Arbitrum Foundation Grants',
      url: 'https://arbitrum.foundation/grants',
      chain_name: 'Arbitrum',
      scrape_strategy: 'static_html',
      is_active: true,
    },
    {
      name: 'Arbitrum Forum - Grants',
      url: 'https://forum.arbitrum.foundation/c/grants/',
      chain_name: 'Arbitrum',
      scrape_strategy: 'static_html',
      is_active: true,
    },

    // Near
    {
      name: 'Near Ecosystem Funding',
      url: 'https://near.org/ecosystem/get-funding',
      chain_name: 'Near',
      scrape_strategy: 'puppeteer',
      is_active: true,
    },
    {
      name: 'Near Blog - Grants',
      url: 'https://near.org/blog',
      chain_name: 'Near',
      scrape_strategy: 'static_html',
      is_active: true,
    },

    // Aptos
    {
      name: 'Aptos Foundation Grants',
      url: 'https://aptosfoundation.org/grants',
      chain_name: 'Aptos',
      scrape_strategy: 'static_html',
      is_active: true,
    },
    {
      name: 'Aptos Labs Grants',
      url: 'https://aptoslabs.com/grants',
      chain_name: 'Aptos',
      scrape_strategy: 'static_html',
      is_active: true,
    },

    // Sui
    {
      name: 'Sui Grants',
      url: 'https://sui.io/grants',
      chain_name: 'Sui',
      scrape_strategy: 'static_html',
      is_active: true,
    },
    {
      name: 'Sui Ecosystem',
      url: 'https://sui.io/ecosystem',
      chain_name: 'Sui',
      scrape_strategy: 'puppeteer',
      is_active: true,
    },

    // Scroll
    {
      name: 'Scroll Grants',
      url: 'https://scroll.io/grants',
      chain_name: 'Scroll',
      scrape_strategy: 'static_html',
      is_active: true,
    },
  ];

  await grantSourceRepo.save(sources);
  console.log(`✓ Seeded ${sources.length} grant sources`);
}
