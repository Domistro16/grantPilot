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
    name: 'BNB Chain Grants & Programs',
    url: 'https://www.bnbchain.org/en/grants',
    chain_name: 'BNB Chain',
    scrape_strategy: 'static_html',
    is_active: true, // Focus on RWA incentives and TVL programs
  },
  {
    name: 'BNB Chain Programs List', 
    url: 'https://www.bnbchain.org/en/programs',
    chain_name: 'BNB Chain',
    scrape_strategy: 'static_html',
    is_active: true,
  },

  // Solana
  {
    name: 'Solana Grants & Funding',
    url: 'https://solana.org/grants-funding', // Updated from generic /grants
    chain_name: 'Solana',
    scrape_strategy: 'static_html',
    is_active: true, // Includes Convertible Grants & Validator Delegation
  },
  {
    name: 'Solana Ecosystem',
    url: 'https://solana.com/ecosystem',
    chain_name: 'Solana',
    scrape_strategy: 'static_html',
    is_active: true,
  },

  // Ethereum
  {
    name: 'Ethereum Foundation ESP (Applicants)',
    url: 'https://esp.ethereum.foundation/applicants',
    chain_name: 'Ethereum',
    scrape_strategy: 'static_html',
    is_active: true, // Reactivated: Now functions as a "Wishlist/RFP" portal rather than open drop-box
  },

  // Polygon
  {
    name: 'Polygon Grow (Village)',
    url: 'https://polygon.technology/grow', // Updated central hub for "Direct Track"
    chain_name: 'Polygon',
    scrape_strategy: 'static_html',
    is_active: true,
  },
  {
    name: 'Encode Club x Polygon (Allocator)',
    url: 'https://www.encodeclub.com/programmes/polygon-grants', // Added: Key "Grant Allocator" for AI/Web3
    chain_name: 'Polygon',
    scrape_strategy: 'static_html',
    is_active: true,
  },

  // Base
  {
    name: 'Base Builder Grants',
    url: 'https://paragraph.xyz/@grants.base.eth/calling-based-builders', // Updated to specific grant handle
    chain_name: 'Base',
    scrape_strategy: 'static_html',
    is_active: true, // Strict "Ship First" requirement
  },
  {
    name: 'Base Build Hub',
    url: 'https://www.base.org/build',
    chain_name: 'Base',
    scrape_strategy: 'static_html',
    is_active: true,
  },

  // Optimism
  {
    name: 'Optimism Retro Funding',
    url: 'https://app.optimism.io/retropgf',
    chain_name: 'Optimism',
    scrape_strategy: 'static_html',
    is_active: true, // Governance is moving to "Algorithmic" selection (Season 7)
  },
  {
    name: 'OP Atlas (Registry)',
    url: 'https://atlas.optimism.io/', // Added: Mandatory registry for grant eligibility
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
    is_active: true, // Focus on Enterprise & Trailblazer AI
  },

  // Near
  {
    name: 'Near DevHub',
    url: 'https://neardevhub.org/', // Updated: Replaces Foundation as primary funding engine
    chain_name: 'Near',
    scrape_strategy: 'static_html',
    is_active: true,
  },
  {
    name: 'Near Ecosystem Funding',
    url: 'https://pages.near.org/ecosystem/get-funding/',
    chain_name: 'Near',
    scrape_strategy: 'static_html',
    is_active: true,
  },

  // Aptos
  {
    name: 'Aptos Foundation Grants',
    url: 'https://aptosnetwork.com/grants',
    chain_name: 'Aptos',
    scrape_strategy: 'static_html',
    is_active: true,
  },
  {
    name: 'Aptos Project Registry',
    url: 'https://github.com/aptos-foundation/registry-projects', // Added: The "Request for Startups" list
    chain_name: 'Aptos',
    scrape_strategy: 'static_html',
    is_active: true,
  },

  // Sui
  {
    name: 'Sui Foundation RFPs',
    url: 'https://sui.io/request-for-proposals', // Updated: Primary entry point over generic grants page
    chain_name: 'Sui',
    scrape_strategy: 'static_html',
    is_active: true,
  },
  {
    name: 'Sui Ecosystem Hub',
    url: 'https://sui.io/ecosystem-hub',
    chain_name: 'Sui',
    scrape_strategy: 'static_html',
    is_active: true,
  },

  // Scroll
  {
    name: 'Scroll Community Grants',
    url: 'https://grants.scroll.io/programs/community-grants/', // Updated to specific subdomain
    chain_name: 'Scroll',
    scrape_strategy: 'static_html',
    is_active: true, // Tiered: Starter vs Launch
  },
];

  await grantSourceRepo.save(sources);
  console.log(`✓ Seeded ${sources.length} grant sources`);
}
