'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Search,
  FileText,
  BarChart2,
  Settings,
  Globe,
  Zap,
  ChevronDown,
  ChevronRight,
  Users,
  Bell,
  TestTube2,
  Lightbulb,
} from 'lucide-react';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function NavItem({ href, icon, label, active, onClick }: NavItemProps) {
  return (
    <Link
      href={href}
      className={`flex items-center px-3 py-2 text-sm rounded-md group ${
        active
          ? 'bg-primary-50 text-primary-700'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
      onClick={onClick}
    >
      <span className="mr-3">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

interface NavGroupProps {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function NavGroup({ label, icon, children, defaultOpen = false }: NavGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100"
      >
        <div className="flex items-center">
          <span className="mr-3">{icon}</span>
          <span>{label}</span>
        </div>
        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>
      {isOpen && <div className="pl-10 mt-1 space-y-1">{children}</div>}
    </div>
  );
}

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full px-3 py-4 bg-white border-r">
      <div className="mb-6">
        <Link href="/dashboard" className="flex items-center px-3">
          <span className="text-xl font-bold text-primary-600">Surge</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1">
        <NavItem
          href="/dashboard"
          icon={<LayoutDashboard size={20} />}
          label="Dashboard"
          active={pathname === '/dashboard'}
        />

        <NavGroup
          label="SEO Tools"
          icon={<Zap size={20} />}
          defaultOpen={pathname.includes('/dashboard/seo')}
        >
          <NavItem
            href="/dashboard/seo/keyword-research"
            icon={<Search size={18} />}
            label="Keyword Research"
            active={pathname === '/dashboard/seo/keyword-research'}
          />
          <NavItem
            href="/dashboard/seo/site-audit"
            icon={<Globe size={18} />}
            label="Site Audit"
            active={pathname === '/dashboard/seo/site-audit'}
          />
          <NavItem
            href="/dashboard/seo/content-analysis"
            icon={<FileText size={18} />}
            label="Content Analysis"
            active={pathname === '/dashboard/seo/content-analysis'}
          />
          <NavItem
            href="/dashboard/seo/rank-tracking"
            icon={<BarChart2 size={18} />}
            label="Rank Tracking"
            active={pathname === '/dashboard/seo/rank-tracking'}
          />
        </NavGroup>

        <NavGroup
          label="AI Strategy"
          icon={<Lightbulb size={20} />}
          defaultOpen={pathname.includes('/dashboard/strategy')}
        >
          <NavItem
            href="/dashboard/strategy/competitor-analysis"
            icon={<Users size={18} />}
            label="Competitor Analysis"
            active={pathname === '/dashboard/strategy/competitor-analysis'}
          />
          <NavItem
            href="/dashboard/strategy/content-planner"
            icon={<FileText size={18} />}
            label="Content Planner"
            active={pathname === '/dashboard/strategy/content-planner'}
          />
          <NavItem
            href="/dashboard/strategy/roadmap"
            icon={<BarChart2 size={18} />}
            label="SEO Roadmap"
            active={pathname === '/dashboard/strategy/roadmap'}
          />
        </NavGroup>

        <NavItem
          href="/dashboard/testing"
          icon={<TestTube2 size={20} />}
          label="A/B Testing"
          active={pathname === '/dashboard/testing'}
        />

        <NavItem
          href="/dashboard/notifications"
          icon={<Bell size={20} />}
          label="Notifications"
          active={pathname === '/dashboard/notifications'}
        />

        <NavItem
          href="/dashboard/settings"
          icon={<Settings size={20} />}
          label="Settings"
          active={pathname === '/dashboard/settings'}
        />
      </nav>

      <div className="pt-4 mt-6 border-t">
        <div className="px-3 py-2">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary-100 rounded-full"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Free Plan</p>
              <p className="text-xs text-gray-500">Upgrade for more features</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
