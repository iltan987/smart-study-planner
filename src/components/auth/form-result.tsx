'use client';

import clsx from 'clsx';

interface FormResultProps {
  message: string;
  type: 'success' | 'error';
}

export const FormResult = ({ message, type }: FormResultProps) => {
  if (!message) return null;

  return (
    <div
      className={clsx('p-4 rounded-md', {
        'bg-emerald-500/15 text-emerald-500': type === 'success',
        'bg-destructive/15 text-destructive': type === 'error',
      })}
    >
      {message}
    </div>
  );
};
