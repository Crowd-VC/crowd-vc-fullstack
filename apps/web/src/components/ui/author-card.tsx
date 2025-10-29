import Avatar from '@/components/ui/avatar';
import cn from '@/utils/cn';
import type { StaticImageData } from 'next/image';

type AuthorCardProps = {
  image?: StaticImageData;
  name?: string;
  userRole?: string;
  onClick?: () => void;
};

export default function AuthorCard({
  image,
  name,
  userRole,
  onClick,
}: AuthorCardProps) {
  return (
    <div
      className={cn(
        'flex cursor-pointer items-center rounded-lg p-4',
        name
          ? 'bg-gray-100 dark:bg-light-dark'
          : 'ml-3 justify-center bg-none dark:mr-3 dark:bg-none',
      )}
      onClick={onClick ? () => onClick() : undefined}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.();
        }
      }}
    >
      {image ? (
        <Avatar
          image={image}
          alt={name ? name : ''}
          className="dark:border-gray-400"
        />
      ) : (
        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
      )}
      <div className="ltr:pl-3 rtl:pr-3">
        <h3 className="text-sm font-medium uppercase tracking-wide text-gray-900 dark:text-white">
          {name && name.length > 15
            ? `${name.slice(0, 5)}...${name.slice(-5)}`
            : name}
        </h3>
        <span className="mt-1 block text-xs text-gray-600 dark:text-gray-400">
          {userRole}
        </span>
      </div>
    </div>
  );
}
