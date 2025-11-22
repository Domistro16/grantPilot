import { DataSource } from 'typeorm';
import { Chain } from '../../modules/chains/entities/chain.entity';
import { Category } from '../../modules/categories/entities/category.entity';
import { Grant, GrantStatus } from '../../modules/grants/entities/grant.entity';
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

  // Seed Sample Grants
  const grantRepository = dataSource.getRepository(Grant);
  const sampleGrants = [
    {
      chain: 'BNB Chain',
      category: 'Infra',
      title: 'BNB Chain Builder Grants',
      tag: 'Infra · DeFi · Tooling',
      amount: 'Up to $150k',
      status: GrantStatus.OPEN,
      deadline: 'Rolling',
      summary:
        'BNB Chain provides grants to developers building infrastructure, DeFi protocols, and developer tooling on the BNB Chain ecosystem.',
      focus:
        'Teams building scalable infrastructure, cross-chain bridges, or innovative DeFi protocols that enhance the BNB Chain ecosystem.',
      link: 'https://www.bnbchain.org/en/blog/bnb-chain-grants-program',
      source_url: 'https://www.bnbchain.org/en/blog/bnb-chain-grants-program',
    },
    {
      chain: 'Solana',
      category: 'DeFi',
      title: 'Solana Foundation Grants',
      tag: 'DeFi · Gaming · Consumer',
      amount: '$5k - $50k',
      status: GrantStatus.OPEN,
      deadline: 'Rolling',
      summary:
        'Solana Foundation supports projects building on Solana across DeFi, gaming, consumer apps, and infrastructure.',
      focus:
        'Early-stage projects with strong technical teams building innovative applications on Solana.',
      link: 'https://solana.org/grants',
      source_url: 'https://solana.org/grants',
    },
    {
      chain: 'Ethereum / L2s',
      category: 'Public Goods',
      title: 'Ethereum Foundation ESP Grants',
      tag: 'Public Goods · Infra · Tooling',
      amount: 'Varies by track',
      status: GrantStatus.OPEN,
      deadline: 'Rolling',
      summary:
        'The Ethereum Ecosystem Support Program provides grants for projects that strengthen Ethereum and its ecosystem, with focus on public goods.',
      focus:
        'Projects improving Ethereum developer experience, client diversity, security research, and community education.',
      link: 'https://esp.ethereum.foundation/',
      source_url: 'https://esp.ethereum.foundation/',
    },
    {
      chain: 'Base',
      category: 'Consumer',
      title: 'Base Builders Program',
      tag: 'Consumer · DeFi · Gaming',
      amount: 'Up to $100k',
      status: GrantStatus.UPCOMING,
      deadline: 'Q1 2026 (est.)',
      summary:
        'Base is seeking builders creating consumer applications, DeFi protocols, and games that bring the next billion users onchain.',
      focus:
        'Teams with proven track records building accessible, user-friendly applications on Base.',
      link: 'https://paragraph.xyz/@base/calling-based-builders',
      source_url: 'https://paragraph.xyz/@base/calling-based-builders',
    },
    {
      chain: 'Polygon',
      category: 'Ecosystem',
      title: 'Polygon Village Grants',
      tag: 'Ecosystem · Gaming · DeFi',
      amount: '$10k - $250k',
      status: GrantStatus.OPEN,
      deadline: 'Dec 30, 2025',
      summary:
        'Polygon Village provides funding for projects building on Polygon, with emphasis on gaming, DeFi, and ecosystem tools.',
      focus:
        'Established teams with clear roadmaps and strong potential for ecosystem growth.',
      link: 'https://polygon.technology/village/grants',
      source_url: 'https://polygon.technology/village/grants',
    },
  ];

  for (const grantData of sampleGrants) {
    const existing = await grantRepository.findOne({
      where: { title: grantData.title, link: grantData.link },
    });
    if (!existing) {
      const grant = grantRepository.create(grantData);
      await grantRepository.save(grant);
      console.log(`✅ Created grant: ${grantData.title}`);
    }
  }

  // Seed Grant Sources
  await seedGrantSources(dataSource);

  console.log('✨ Database seeding completed!');
}
