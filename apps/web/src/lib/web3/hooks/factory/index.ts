/**
 * CrowdVC Factory Contract Hooks
 * Hooks for interacting with the CrowdVCFactory contract
 */

// User management hooks
export * from './useRegisterUser';
export * from './useGetUserProfile';

// Pitch management hooks
export * from './useSubmitPitch';
export * from './useGetPitchData';
export * from './useGetUserPitches';
export * from './useIsPitchApproved';

// Pool management hooks
export * from './useCreatePool';

// Factory view hooks
export * from './useGetAllPools';
export * from './useGetPlatformFee';
