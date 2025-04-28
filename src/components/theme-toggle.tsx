'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from './ui/button';

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  function handletheme(): void {
    if (resolvedTheme === 'dark') {
      setTheme('light');
    } else if (resolvedTheme === 'light') {
      setTheme('dark');
    }
  }

  return (
    // <DropdownMenu>
    //   <DropdownMenuTrigger asChild>
    //     {isSidebar ? (
    //       <SidebarMenuButton>
    //         <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
    //         <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    //         <span>Toggle theme</span>
    //       </SidebarMenuButton>
    //     ) : (
    //       <Button>
    //         <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
    //         <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    //         <span className="sr-only">Toggle theme</span>
    //       </Button>
    //     )}
    //   </DropdownMenuTrigger>
    //   <DropdownMenuContent align="end">
    //     <DropdownMenuItem onClick={() => setTheme('light')}>
    //       <Sun className="mr-2 h-4 w-4" />
    //       <span>Light</span>
    //     </DropdownMenuItem>
    //     <DropdownMenuItem onClick={() => setTheme('dark')}>
    //       <Moon className="mr-2 h-4 w-4" />
    //       <span>Dark</span>
    //     </DropdownMenuItem>
    //     <DropdownMenuItem onClick={() => setTheme('system')}>
    //       <Laptop className="mr-2 h-4 w-4" />
    //       <span>System</span>
    //     </DropdownMenuItem>
    //   </DropdownMenuContent>
    // </DropdownMenu>
    <Button
      variant="ghost"
      size="icon"
      className="data-[state=open]:bg-accent data-[state=open]:text-accent-foreground float-left"
      onClick={handletheme}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
