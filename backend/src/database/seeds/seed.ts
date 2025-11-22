import { DataSource } from 'typeorm';
import { Chain } from '../../modules/chains/entities/chain.entity';
import { Category } from '../../modules/categories/entities/category.entity';
import { seedGrantSources } from './grant-sources.seed';

export async function runSeeds(dataSource: DataSource) {
  console.log('🌱 Seeding database...');

  // Seed Chains
  const chainRepository = dataSource.getRepository(Chain);
  const chains = [
    {
      name: 'BNB Chain',
      website: 'https://www.bnbchain.org',
      description: 'Build N Build - A community-driven blockchain',
    },
    {
      name: 'Solana',
      website: 'https://solana.org',
      description: 'Fast, decentralized blockchain built for mass adoption',
    },
    {
      name: 'Ethereum / L2s',
      website: 'https://ethereum.org',
      description: 'The most widely used smart contract platform',
    },
    {
      name: 'Polygon',
      website: 'https://polygon.technology',
      description: 'Ethereum scaling and infrastructure development',
    },
    {
      name: 'Base',
      website: 'https://base.org',
      description: 'Coinbase L2 built on Optimism',
    },
    {
      name: 'Arbitrum',
      website: 'https://arbitrum.io',
      description: 'Ethereum Layer 2 scaling solution',
    },
    {
      name: 'Optimism',
      website: 'https://optimism.io',
      description: 'Fast, stable, and scalable L2 blockchain',
    },
    {
      name: 'Near',
      website: 'https://near.org',
      description: 'Simple, scalable, and secure blockchain',
    },
    {
      name: 'Aptos',
      website: 'https://aptosfoundation.org',
      description: 'Layer 1 blockchain built with Move',
    },
    {
      name: 'Sui',
      website: 'https://sui.io',
      description: 'High-performance blockchain with horizontal scaling',
    },
    {
      name: 'Scroll',
      website: 'https://scroll.io',
      description: 'zkEVM Layer 2 for Ethereum',
    },
    {
      name: 'TON',
      website: 'https://ton.org',
      description: 'The Open Network - ultra-fast blockchain',
    },
  ];

  for (const chainData of chains) {
    const existing = await chainRepository.findOne({
      where: { name: chainData.name },
    });
    if (!existing) {
      const chain = chainRepository.create(chainData);
      await chainRepository.save(chain);
      console.log(`✅ Created chain: ${chainData.name}`);
    }
  }

  // Seed Categories
  const categoryRepository = dataSource.getRepository(Category);
  const categories = [
    {
      name: 'Infra',
      slug: 'infra',
      description: 'Infrastructure and developer tools',
    },
    { name: 'DeFi', slug: 'defi', description: 'Decentralized Finance' },
    {
      name: 'Gaming',
      slug: 'gaming',
      description: 'Web3 gaming and metaverse',
    },
    {
      name: 'Consumer',
      slug: 'consumer',
      description: 'Consumer-facing applications',
    },
    {
      name: 'Public Goods',
      slug: 'public-goods',
      description: 'Public goods and community initiatives',
    },
    {
      name: 'Ecosystem',
      slug: 'ecosystem',
      description: 'Ecosystem growth and development',
    },
    { name: 'Tooling', slug: 'tooling', description: 'Developer tooling' },
    {
      name: 'ZK',
      slug: 'zk',
      description: 'Zero-knowledge proofs and privacy',
    },
    {
      name: 'L2 Infra',
      slug: 'l2-infra',
      description: 'Layer 2 infrastructure',
    },
    {
      name: 'Hackathons',
      slug: 'hackathons',
      description: 'Hackathon and competition grants',
    },
  ];

  for (const categoryData of categories) {
    const existing = await categoryRepository.findOne({
      where: { slug: categoryData.slug },
    });
    if (!existing) {
      const category = categoryRepository.create(categoryData);
      await categoryRepository.save(category);
      console.log(`✅ Created category: ${categoryData.name}`);
    }
  }

  // Seed Grant Sources
  await seedGrantSources(dataSource);

  console.log('✨ Database seeding completed!');
  console.log('📝 Note: No sample grants seeded. Run POST /api/scraper/run to fetch real grant data.');
}
