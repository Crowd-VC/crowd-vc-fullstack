'use client';

import { useQuery } from '@tanstack/react-query';
import { PitchMetadata } from '@/types/pitch';

const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

export function useFetchPitchData(cid: string | undefined) {
  return useQuery({
    queryKey: ['ipfs', cid],
    queryFn: async () => {
      if (!cid) throw new Error('No CID provided');
      
      const response = await fetch(`${IPFS_GATEWAY}${cid}`);
      if (!response.ok) {
        throw new Error('Failed to fetch pitch data from IPFS');
      }
      
      const data = await response.json();
      return data as PitchMetadata;
    },
    enabled: !!cid,
    staleTime: Infinity, // IPFS data is immutable
  });
}
