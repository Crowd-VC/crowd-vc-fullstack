'use client';

import { useEffect, useState } from 'react';
import Image from '@/components/ui/image';
import { useAccount } from 'wagmi';
import { useCopyToClipboard } from 'react-use';
import { Check } from '@/components/icons/check';
import { Copy } from '@/components/icons/copy';
import Button from '@/components/ui/button';
import type { Pitch } from '@/db/schema/pitches';
import type { User } from '@/db/schema/users';
import {
  Wallet,
  FileText,
  TrendingUp,
  Users,
  Calendar,
  Globe,
  Briefcase,
  MapPin,
  Pencil,
  X,
  Mail,
  User as UserIcon,
} from 'lucide-react';
import Link from 'next/link';
import routes from '@/config/routes';
import ProfileTabs from './_components/profile-tabs';

// Cover image placeholder
import CoverImage from '@/assets/images/profile-cover.jpg';

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const [user, setUser] = useState<User | null>(null);
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copyButtonStatus, setCopyButtonStatus] = useState(false);
  const [_, copyToClipboard] = useCopyToClipboard();

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserData() {
      if (!address) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Fetch user and pitches in parallel
        const [userResponse, pitchesResponse] = await Promise.all([
          fetch(`/api/users/${address}`),
          fetch(`/api/pitches/user/${address}`),
        ]);

        const userResult = await userResponse.json();
        const pitchesResult = await pitchesResponse.json();

        if (userResult.success && userResult.data) {
          setUser(userResult.data);
          setEditName(userResult.data.name || '');
          setEditEmail(userResult.data.email || '');
        }

        if (pitchesResult.success) {
          setPitches(pitchesResult.data);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserData();
  }, [address]);

  function handleCopyToClipboard() {
    if (address) {
      copyToClipboard(address);
      setCopyButtonStatus(true);
      setTimeout(() => {
        setCopyButtonStatus(false);
      }, 2500);
    }
  }

  function openEditModal() {
    setEditName(user?.name || '');
    setEditEmail(user?.email || '');
    setSaveError(null);
    setIsEditModalOpen(true);
  }

  async function handleSaveProfile() {
    if (!address) return;

    // Basic validation
    if (!editEmail.trim()) {
      setSaveError('Email is required');
      return;
    }

    if (!editEmail.includes('@')) {
      setSaveError('Please enter a valid email');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const response = await fetch(`/api/users/${address}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editName.trim() || null,
          email: editEmail.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setUser(result.data);
        setIsEditModalOpen(false);
      } else {
        setSaveError(result.error || 'Failed to save profile');
      }
    } catch (err) {
      setSaveError('Failed to save profile');
      console.error('Error saving profile:', err);
    } finally {
      setIsSaving(false);
    }
  }

  // Calculate stats
  const totalPitches = pitches.length;
  const activePitches = pitches.filter(
    (p) => p.status === 'approved' || p.status === 'in-pool'
  ).length;
  const totalFundingGoal = pitches.reduce((sum, p) => sum + p.fundingGoal, 0);
  const pendingPitches = pitches.filter((p) => p.status === 'pending').length;

  // Get the first pitch for company details
  const primaryPitch = pitches[0];

  // Format wallet address for display
  const shortenedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : '';

  // Get display name
  const displayName = user?.name || 'Unnamed User';
  const userInitial = user?.name?.charAt(0)?.toUpperCase() || address?.charAt(2)?.toUpperCase() || 'U';

  if (!isConnected) {
    return (
      <div className="min-h-screen">
        <main className="container px-4 py-8">
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-16 dark:border-gray-700 dark:bg-gray-800/50">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
              <Wallet className="h-10 w-10 text-white" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
              Connect Your Wallet
            </h2>
            <p className="mb-8 max-w-md text-center text-gray-600 dark:text-gray-400">
              Connect your wallet to view your profile and manage your startup
              pitches on CrowdVC.
            </p>
            <w3m-button />
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Edit Profile
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name Field */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                  <UserIcon className="h-4 w-4" />
                  Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                  <Mail className="h-4 w-4" />
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                />
              </div>

              {/* Error Message */}
              {saveError && (
                <p className="text-sm text-red-500">{saveError}</p>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex-1 rounded-lg bg-gray-900 px-4 py-3 font-medium text-white transition hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cover Image */}
      <div className="relative h-36 w-full overflow-hidden rounded-lg sm:h-44 md:h-64 xl:h-80 2xl:h-96 3xl:h-[448px]">
        <Image
          src={CoverImage}
          placeholder="blur"
          quality={100}
          className="!h-full w-full !object-cover"
          alt="Cover Image"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      <div className="mx-auto flex w-full shrink-0 flex-col md:px-4 xl:px-6 3xl:max-w-[1700px] 3xl:px-12">
        {/* Avatar */}
        <div className="z-10 mx-auto -mt-12 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-orange-400 to-pink-500 dark:border-gray-900 sm:-mt-14 md:mx-0 md:-mt-16 md:h-28 md:w-28 xl:mx-0 xl:h-32 xl:w-32 3xl:-mt-20 3xl:h-36 3xl:w-36">
          <span className="text-3xl font-bold text-white md:text-4xl xl:text-5xl">
            {userInitial}
          </span>
        </div>

        {/* Profile Content */}
        <div className="flex w-full flex-col pt-4 md:flex-row md:pt-10 lg:flex-row 3xl:pt-12">
          {/* Left Sidebar */}
          <div className="shrink-0 border-dashed border-gray-200 dark:border-gray-700 md:w-72 ltr:md:border-r md:ltr:pr-7 rtl:md:border-l md:rtl:pl-7 lg:ltr:pr-10 lg:rtl:pl-10 2xl:w-80 3xl:w-96 3xl:ltr:pr-14 3xl:rtl:pl-14">
            <div className="text-center ltr:md:text-left rtl:md:text-right">
              {/* Name with Edit Button */}
              <div className="flex items-center justify-center gap-2 md:justify-start">
                <h2 className="text-xl font-medium tracking-tighter text-gray-900 dark:text-white xl:text-2xl">
                  {displayName}
                </h2>
                <button
                  onClick={openEditModal}
                  className="rounded-full p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
                  title="Edit Profile"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>

              {/* Email */}
              {user?.email && !user.email.includes('@placeholder') && (
                <div className="mt-1 flex items-center justify-center gap-1 text-sm font-medium tracking-tighter text-gray-600 dark:text-gray-400 md:justify-start xl:mt-2">
                  <Mail className="h-3.5 w-3.5" />
                  {user.email}
                </div>
              )}

              {/* User Type Badge */}
              <div className="mt-2 text-sm font-medium tracking-tighter text-gray-600 dark:text-gray-400 xl:mt-3">
                {user?.userType === 'startup'
                  ? 'Startup Founder'
                  : user?.userType === 'investor'
                    ? 'Investor'
                    : user?.userType === 'admin'
                      ? 'Admin'
                      : 'CrowdVC Member'}
              </div>

              {/* Wallet Address */}
              <div className="md:max-w-auto mx-auto mt-5 flex h-9 max-w-sm items-center rounded-full bg-white shadow-card dark:bg-light-dark md:mx-0 xl:mt-6">
                <div className="inline-flex h-full shrink-0 grow-0 items-center rounded-full bg-gray-900 px-4 text-xs text-white sm:text-sm">
                  <Wallet className="mr-1.5 h-3 w-3" />
                  Wallet
                </div>
                <div className="text truncate text-ellipsis bg-center text-xs text-gray-500 ltr:pl-4 rtl:pr-4 dark:text-gray-300 sm:text-sm">
                  {shortenedAddress}
                </div>
                <div
                  title="Copy Address"
                  className="flex cursor-pointer items-center px-4 text-gray-500 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  onClick={() => handleCopyToClipboard()}
                >
                  {copyButtonStatus ? (
                    <Check className="h-auto w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-auto w-3.5" />
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 border-y border-dashed border-gray-200 py-5 text-center dark:border-gray-700 md:justify-start ltr:md:text-left rtl:md:text-right xl:mt-12 xl:gap-8 xl:py-6">
              <div>
                <div className="mb-1.5 text-lg font-medium tracking-tighter text-gray-900 dark:text-white">
                  {totalPitches}
                </div>
                <div className="text-sm tracking-tighter text-gray-600 dark:text-gray-400">
                  Total Pitches
                </div>
              </div>
              <div>
                <div className="mb-1.5 text-lg font-medium tracking-tighter text-gray-900 dark:text-white">
                  {activePitches}
                </div>
                <div className="text-sm tracking-tighter text-gray-600 dark:text-gray-400">
                  Active
                </div>
              </div>
              <Link href={routes.submitPitch}>
                <Button
                  color="white"
                  className="shadow-card dark:bg-light-dark md:h-10 md:px-5 xl:h-12 xl:px-7"
                >
                  New Pitch
                </Button>
              </Link>
            </div>

            {/* Funding Overview */}
            <div className="border-y border-dashed border-gray-200 py-5 text-center dark:border-gray-700 ltr:md:text-left rtl:md:text-right xl:py-6">
              <div className="mb-2 text-sm font-medium uppercase tracking-wider text-gray-900 dark:text-white">
                Funding Overview
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <TrendingUp className="h-4 w-4" />
                    Total Goal
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${totalFundingGoal.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <FileText className="h-4 w-4" />
                    Pending Review
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {pendingPitches}
                  </span>
                </div>
              </div>
            </div>

            {/* Company Details (from first pitch) */}
            {primaryPitch && (
              <div className="border-y border-dashed border-gray-200 py-5 dark:border-gray-700 xl:py-6">
                <div className="mb-3 text-sm font-medium uppercase tracking-wider text-gray-900 dark:text-white">
                  Company Details
                </div>
                <div className="space-y-2 text-sm">
                  {primaryPitch.location && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4" />
                      {primaryPitch.location}
                    </div>
                  )}
                  {primaryPitch.industry && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Briefcase className="h-4 w-4" />
                      {primaryPitch.industry}
                    </div>
                  )}
                  {primaryPitch.teamSize && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Users className="h-4 w-4" />
                      Team of {primaryPitch.teamSize}
                    </div>
                  )}
                  {primaryPitch.website && (
                    <a
                      href={primaryPitch.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-600 transition hover:text-gray-900 hover:underline dark:text-gray-400 dark:hover:text-white"
                    >
                      <Globe className="h-4 w-4" />
                      Website
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Member Since */}
            <div className="border-y border-dashed border-gray-200 py-5 dark:border-gray-700 xl:py-6">
              <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-gray-900 dark:text-white">
                <Calendar className="h-4 w-4" />
                {user?.createdAt
                  ? `Member since ${new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
                  : 'New Member'}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="grow pb-9 pt-6 md:-mt-2.5 md:pb-0 md:pt-1.5 md:ltr:pl-7 md:rtl:pr-7 lg:ltr:pl-10 lg:rtl:pr-10 3xl:ltr:pl-14 3xl:rtl:pr-14">
            <ProfileTabs pitches={pitches} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </>
  );
}
