import routes from '@/config/routes';
import { HomeIcon } from '@/components/icons/home';
import { FarmIcon } from '@/components/icons/farm';
import { PoolIcon } from '@/components/icons/pool';
import { ProfileIcon } from '@/components/icons/profile';
import { DiskIcon } from '@/components/icons/disk';
import { ExchangeIcon } from '@/components/icons/exchange';
import { VoteIcon } from '@/components/icons/vote-icon';
import { PlusCircle } from '@/components/icons/plus-circle';
import { CompassIcon } from '@/components/icons/compass';
import { LivePricing } from '@/components/icons/live-pricing';
import { LockIcon } from '@/components/icons/lock-icon';
import { TradingBotIcon } from '@/components/icons/trading-bot-icon';
import { HomeIcon as DashboardIcon } from '@/components/icons/home';

export const defaultMenuItems = [
  {
    name: 'Dashboard',
    icon: <DashboardIcon />,
    href: routes.home,
  },
  {
    name: 'My Pitches',
    icon: <DiskIcon />,
    href: routes.pitches,
  },
  {
    name: 'Investment Pools',
    icon: <PoolIcon />,
    href: routes.pools,
  },
  {
    name: 'Voting',
    icon: <VoteIcon />,
    href: routes.voting,
  },
  {
    name: 'Portfolio',
    icon: <LivePricing />,
    href: routes.portfolio,
  },
  {
    name: 'Submit Pitch',
    icon: <PlusCircle />,
    href: routes.submitPitch,
    // dropdownItems: [
    //   {
    //     name: 'Upload Deck',
    //     href: routes.submitDeck,
    //   },
    //   {
    //     name: 'Pitch Video',
    //     href: routes.submitVideo,
    //   },
    //   {
    //     name: 'Details Form',
    //     href: routes.submitDetails,
    //   },
    // ],
  },
  {
    name: 'Pitch Management',
    icon: <CompassIcon />,
    href: routes.managePitches,
    dropdownItems: [
      {
        name: 'Pending Review',
        href: routes.managePending,
      },
      {
        name: 'Approved',
        href: routes.manageApproved,
      },
      {
        name: 'In Pools',
        href: routes.manageInPools,
      },
    ],
  },
  {
    name: 'Funding Status',
    icon: <ExchangeIcon />,
    href: routes.fundingStatus,
    dropdownItems: [
      {
        name: 'Active Campaigns',
        href: routes.fundingActive,
      },
      {
        name: 'Completed',
        href: routes.fundingCompleted,
      },
      {
        name: 'Payouts',
        href: routes.fundingPayouts,
      },
    ],
  },
  {
    name: 'Admin',
    icon: <LockIcon className="w-[18px]" />,
    href: routes.admin,
    dropdownItems: [
      {
        name: 'Admin Overview',
        href: routes.admin,
      },
      {
        name: 'Pitch Management',
        href: routes.adminPitches,
      },
      {
        name: 'Pool Management',
        href: routes.adminPools,
      },
      {
        name: 'User Management',
        href: routes.adminUsers,
      },
      {
        name: 'Analytics',
        href: routes.adminAnalytics,
      },
    ],
  },
  {
    name: 'Settings',
    icon: <ProfileIcon />,
    href: routes.profile,
  },
];

export const MinimalMenuItems = [
  {
    name: 'Home',
    icon: <HomeIcon />,
    href: routes.home,
  },
  {
    name: 'Live Pricing',
    icon: <LivePricing />,
    href: routes.livePricing,
  },
  {
    name: 'Trading Bot',
    icon: <TradingBotIcon />,
    href: routes.tradingBot,
  },
  {
    name: 'NFTs',
    icon: <CompassIcon />,
    href: routes.search,
    dropdownItems: [
      {
        name: 'Explore NFTs',
        icon: <CompassIcon />,
        href: routes.search,
      },
      {
        name: 'Create NFT',
        icon: <PlusCircle />,
        href: routes.createNft,
      },
      {
        name: 'NFT Details',
        icon: <DiskIcon />,
        href: routes.nftDetails,
      },
    ],
  },
  {
    name: 'Farm',
    icon: <FarmIcon />,
    href: routes.farms,
  },
  {
    name: 'Swap',
    icon: <ExchangeIcon />,
    href: routes.swap,
  },
  {
    name: 'Pages',
    icon: <VoteIcon />,
    href: routes.pages,
    dropdownItems: [
      {
        name: 'Profile',
        icon: <ProfileIcon />,
        href: routes.profile,
      },
      {
        name: 'Liquidity',
        icon: <PoolIcon />,
        href: routes.liquidity,
      },
      {
        name: 'Vote',
        icon: <VoteIcon />,
        href: routes.vote,
        dropdownItems: [
          {
            name: 'Explore',
            href: routes.vote,
          },
          {
            name: 'Vote with criptic',
            href: routes.proposals,
          },
          {
            name: 'Create proposal',
            href: routes.createProposal,
          },
        ],
      },
      {
        name: 'Authentication',
        icon: <LockIcon className="w-[18px]" />,
        href: routes.signIn,
        dropdownItems: [
          {
            name: 'Sign in',
            href: routes.signIn,
          },
          {
            name: 'Sign up',
            href: routes.signUp,
          },
          {
            name: 'Reset pin',
            href: routes.resetPin,
          },
          {
            name: 'Forget password',
            href: routes.forgetPassword,
          },
        ],
      },
    ],
  },
];
