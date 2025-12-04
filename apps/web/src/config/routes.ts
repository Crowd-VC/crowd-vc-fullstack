const routes = {
  home: "/dashboard",

  // CrowdVC routes
  profile: "/dashboard/profile",
  notifications: "/dashboard/notifications",
  pitches: "/dashboard/pitches",
  pitchDetails: (id: string) => `/dashboard/pitches/${id}`,
  pools: "/dashboard/pools",
  voting: "/dashboard/voting",
  submitPitch: "/dashboard/pitches/submit-pitch",
  managePitches: "/dashboard/manage",
  managePending: "/dashboard/manage/pending",
  manageApproved: "/dashboard/manage/approved",
  manageInPools: "/dashboard/manage/pools",
  fundingStatus: "/dashboard/funding",
  fundingActive: "/dashboard/funding/active",
  fundingCompleted: "/dashboard/funding/completed",
  fundingPayouts: "/dashboard/funding/payouts",
  admin: "/dashboard/admin",
  adminPitches: "/dashboard/admin/pitches",
  adminPools: "/dashboard/admin/pools",
  adminUsers: "/dashboard/admin/users",
  adminAnalytics: "/dashboard/admin/analytics",
};

export default routes;
