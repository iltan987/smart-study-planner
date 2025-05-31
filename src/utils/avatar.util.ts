export const getInitials = (name: string): string => {
  if (!name?.trim()) return '';
  const words = name.trim().split(' ').filter(Boolean);
  if (words.length === 0) return '';
  if (words.length === 1) {
    const word = words[0];
    return word.length > 1
      ? word.substring(0, 2).toUpperCase()
      : word.toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

export const avatarBackgroundColors = [
  'bg-red-500',
  'bg-green-500',
  'bg-blue-500',
  'bg-yellow-400',
  'bg-indigo-500',
  'bg-purple-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-cyan-500',
  'bg-emerald-500',
  'bg-lime-400',
  'bg-pink-500',
  'bg-sky-500',
  'bg-rose-500',
  'bg-violet-500',
  'bg-fuchsia-500',
  'bg-amber-400',
  'bg-stone-500',
];

export const avatarTextColors: { [key: string]: string } = {
  'bg-yellow-400': 'text-yellow-900',
  'bg-lime-400': 'text-lime-900',
  'bg-amber-400': 'text-amber-900',
};

export const defaultAvatarTextColor = 'text-white';
