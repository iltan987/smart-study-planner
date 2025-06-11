import { navChatbot } from '@/config/navItems';
import { CollapsibleContent } from '@radix-ui/react-collapsible';
import { Brain, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { type ComponentProps } from 'react';
import { Chats } from './chat/ChatMenuItems';
import { CreateChatSidebarMenuAction } from './chat/CreateChatSidebarMenuAction';
import { NavUser } from './NavUser';
import { SidebarMenuComponent } from './SidebarMenuItemComponent';
import { Collapsible, CollapsibleTrigger } from './ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from './ui/sidebar';

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <Brain className="h-5 w-5" />
                <span className="text-base font-semibold">
                  Smart Study Planner
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuComponent position={1} />
            <Collapsible className="group/collapsible" asChild>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className=" text-md  gap-y-4">
                    <navChatbot.icon />
                    <span>{navChatbot.title}</span>
                    <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CreateChatSidebarMenuAction />
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <Chats />
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarMenu>
            <SidebarMenuComponent position={2} />
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
