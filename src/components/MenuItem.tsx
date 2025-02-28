'use client';
interface MenubarItemProps {
  label: string;
  icon?: React.ReactNode;
  path: string;
}

export default function MenubarItem({ label, icon, path }: MenubarItemProps) {
  return (
    <button className="flex items-center p-2 w-auto text-left cursor-pointer hover:bg-purple-200 mb-2 px-4 rounded-lg">
      <span className="text-gray-500 pr-2 flex-shrink-0">{icon}</span>
      <span className="text-xl text-black font-normal flex-grow">{label}</span>
    </button>
  );
}
