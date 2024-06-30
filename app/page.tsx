"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { LucideIcon } from "lucide-react";

interface IconComponents {
  [key: string]: React.ComponentType<{ className?: string }>;
}

const LucideIcons: IconComponents = {
  UserPlus: dynamic(() => import("lucide-react").then((mod) => mod.UserPlus)),
  Users: dynamic(() => import("lucide-react").then((mod) => mod.Users)),
  Truck: dynamic(() => import("lucide-react").then((mod) => mod.Truck)),
  FileText: dynamic(() => import("lucide-react").then((mod) => mod.FileText)),
  CreditCard: dynamic(() =>
    import("lucide-react").then((mod) => mod.CreditCard)
  ),
  AlertTriangle: dynamic(() =>
    import("lucide-react").then((mod) => mod.AlertTriangle)
  ),
  PlusCircle: dynamic(() =>
    import("lucide-react").then((mod) => mod.PlusCircle)
  ),
  Eye: dynamic(() => import("lucide-react").then((mod) => mod.Eye)),
  User: dynamic(() => import("lucide-react").then((mod) => mod.User)),
};

interface HeaderButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  onClick: () => void;
}

const HeaderButton: React.FC<HeaderButtonProps> = ({
  icon: Icon,
  text,
  onClick,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-full px-3 py-2 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-md shadow-md hover:from-purple-500 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out"
    >
      {mounted && Icon && <Icon className="w-4 h-4 mr-1 sm:mr-2" />}
      <span className="hidden sm:inline">{text}</span>
    </button>
  );
};

interface SubMenuItem {
  text: string;
  icon: string;
  onClick: () => void;
}

interface SubMenuProps {
  items: SubMenuItem[];
}

const SubMenu: React.FC<SubMenuProps> = ({ items }) => (
  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">
    {items.map((item, index) => {
      const IconComponent = LucideIcons[item.icon];
      return (
        <button
          key={index}
          onClick={item.onClick}
          className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-colors duration-200"
        >
          {IconComponent && <IconComponent className="inline w-4 h-4 mr-2" />}
          {item.text}
        </button>
      );
    })}
  </div>
);

interface HeaderButton {
  text: string;
  icon: string;
  subItems?: SubMenuItem[];
  onClick?: () => void;
}

const DashboardLayout: React.FC = () => {
  const [activeSubMenu, setActiveSubMenu] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleSubMenu = (menu: number) => {
    setActiveSubMenu(activeSubMenu === menu ? null : menu);
  };

  const headerButtons = [
    {
      text: "Customers",
      icon: "User",
      subItems: [
        {
          text: "Add New",
          icon: "UserPlus",
          onClick: () => console.log("Add new customer"),
        },
        {
          text: "View",
          icon: "Eye",
          onClick: () => console.log("View customers"),
        },
      ],
    },
    {
      text: "Drivers",
      icon: "Truck",
      subItems: [
        {
          text: "Add New",
          icon: "UserPlus",
          onClick: () => console.log("Add new driver"),
        },
        {
          text: "View",
          icon: "Eye",
          onClick: () => console.log("View drivers"),
        },
      ],
    },
    {
      text: "Orders",
      icon: "FileText",
      onClick: () => console.log("Orders clicked"),
    },
    {
      text: "Reports",
      icon: "FileText",
      onClick: () => console.log("Reports clicked"),
    },
    {
      text: "Manager",
      icon: "User",
      subItems: [
        {
          text: "Add New",
          icon: "UserPlus",
          onClick: () => console.log("Add new manager"),
        },
        {
          text: "View",
          icon: "Eye",
          onClick: () => console.log("View managers"),
        },
      ],
    },
    {
      text: "Payments",
      icon: "CreditCard",
      onClick: () => console.log("Payments clicked"),
    },
    {
      text: "Penalty",
      icon: "AlertTriangle",
      subItems: [
        {
          text: "Add New",
          icon: "PlusCircle",
          onClick: () => console.log("Add new penalty"),
        },
        {
          text: "View",
          icon: "Eye",
          onClick: () => console.log("View penalties"),
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-gradient-to-r to-indigo-400 shadow-lg p-2.5">
        <div className="grid grid-cols-7 gap-[12px]">
          {headerButtons.map((button, index) => (
            <div key={index} className="relative">
              {mounted && (
                <HeaderButton
                  icon={LucideIcons[button.icon]}
                  text={button.text}
                  onClick={() =>
                    button.subItems ? toggleSubMenu(index) : button.onClick?.()
                  }
                />
              )}
              {button.subItems && activeSubMenu === index && (
                <SubMenu items={button.subItems} />
              )}
            </div>
          ))}
        </div>
      </header>
      <main className="flex-grow">
        <iframe
          src="http://localhost:3000/"
          className="w-full h-full border-none"
          title="Dashboard Content"
        />
      </main>
    </div>
  );
};

export default DashboardLayout;
