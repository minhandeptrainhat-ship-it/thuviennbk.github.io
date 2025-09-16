
import React from 'react';
import type { View } from '../types';
import { View as ViewEnum } from '../types';
import { HomeIcon, BookOpenIcon, UsersIcon, ArrowRightLeftIcon, LibraryIcon, SparklesIcon } from './icons/Icons';


interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  view: View;
  activeView: View;
  onClick: (view: View) => void;
}> = ({ icon, label, view, activeView, onClick }) => (
  <button
    onClick={() => onClick(view)}
    className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-colors duration-200 rounded-lg ${
      activeView === view
        ? 'bg-blue-600 text-white shadow-lg'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
    }`}
  >
    {icon}
    <span className="ml-4">{label}</span>
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  return (
    <aside className="flex flex-col w-64 h-full px-4 py-8 bg-white dark:bg-gray-800 border-r dark:border-gray-700 shadow-xl">
      <div className="flex items-center px-2 mb-10">
        <LibraryIcon className="w-8 h-8 text-blue-600" />
        <h2 className="ml-3 text-xl font-bold text-gray-800 dark:text-white">Thư Viện TM</h2>
      </div>

      <div className="flex flex-col justify-between flex-1">
        <nav className="space-y-3">
          <NavItem
            icon={<HomeIcon className="w-5 h-5" />}
            label="Bảng điều khiển"
            view={ViewEnum.DASHBOARD}
            activeView={activeView}
            onClick={setActiveView}
          />
          <NavItem
            icon={<BookOpenIcon className="w-5 h-5" />}
            label="Quản lý Sách"
            view={ViewEnum.BOOKS}
            activeView={activeView}
            onClick={setActiveView}
          />
          <NavItem
            icon={<UsersIcon className="w-5 h-5" />}
            label="Quản lý Học sinh"
            view={ViewEnum.STUDENTS}
            activeView={activeView}
            onClick={setActiveView}
          />
          <NavItem
            icon={<ArrowRightLeftIcon className="w-5 h-5" />}
            label="Mượn / Trả sách"
            view={ViewEnum.BORROW}
            activeView={activeView}
            onClick={setActiveView}
          />
           <NavItem
            icon={<SparklesIcon className="w-5 h-5" />}
            label="Trợ lý AI"
            view={ViewEnum.AI_ASSISTANT}
            activeView={activeView}
            onClick={setActiveView}
          />
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
