// src/app/(dashboard)/layout.tsx

'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import VerificationBanner from '@/components/dashboard/VerificationBanner';
import UnverifiedUserDialog from '@/components/dashboard/UnverifiedUserDialog';
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  Settings,
  LogOut,
  ShieldAlert,
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isVerificationDialogOpen, setVerificationDialogOpen] = useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, protected: false },
    { name: 'Clients', href: '/clients', icon: Users, protected: true },
    { name: 'Products', href: '/products', icon: Package, protected: true },
    { name: 'Invoices', href: '/invoices', icon: FileText, protected: true },
    { name: 'Settings', href: '/settings', icon: Settings, protected: true }, // Changed this line
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="px-4 py-2">
              <h1 className="text-xl font-bold text-slate-900">SwiftInvoice</h1>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigation.map((item) => {
                    const isProtectedAndUnverified = item.protected && !user?.isVerified;
                    
                    return (
                      <SidebarMenuItem key={item.name}>
                        {isProtectedAndUnverified ? (
                          <SidebarMenuButton
                            onClick={() => setVerificationDialogOpen(true)}
                            className="cursor-pointer text-slate-500"
                          >
                            <item.icon className="w-4 h-4" />
                            <span>{item.name}</span>
                            <ShieldAlert className="w-4 h-4 ml-auto text-yellow-500" />
                          </SidebarMenuButton>
                        ) : (
                          <SidebarMenuButton asChild>
                            <Link href={item.href}>
                              <item.icon className="w-4 h-4" />
                              <span>{item.name}</span>
                            </Link>
                          </SidebarMenuButton>
                        )}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <div className="flex items-center gap-3 px-2 py-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                    {user?.logoUrl ? (
                      <Image
                        src={user.logoUrl}
                        alt="Company Logo"
                        width={32}
                        height={32}
                        className="object-contain"
                      />
                    ) : (
                      <span className="text-blue-700 font-semibold text-sm">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 overflow-auto">
          <div className="sticky top-0 z-30 bg-white border-b">
            <div className="flex h-16 items-center px-4 lg:px-6">
              <SidebarTrigger />
            </div>
          </div>
          <div className="p-6 lg:p-8">
            <VerificationBanner />
            {children}
          </div>
        </main>
      </div>
      <UnverifiedUserDialog 
        isOpen={isVerificationDialogOpen}
        onClose={() => setVerificationDialogOpen(false)}
      />
    </SidebarProvider>
  );
}