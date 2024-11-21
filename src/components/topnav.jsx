import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import classNames from 'classnames';

const TabsComponent = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { name: 'Account Receivables', path: '/' },
    { name: 'Account Payables', path: '/account-payables' },
    { name: 'Expenses', path: '/expense' },
    { name: 'Bank balances', path: '/bankbalance' },
    { name: 'Exchange rates', path: '/rates' },
  ];

  const mainColor = '#087abc'; // Main color

  // Use useEffect to set active tab based on the current path
  useEffect(() => {
    const currentTab = tabs.findIndex(tab => tab.path === location.pathname);
    setActiveTab(currentTab !== -1 ? currentTab : 0);
  }, [location.pathname, tabs]);

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-center p-2" style={{ color: mainColor }}>
        FINANCE UPDATES
      </h2>
      <div className="flex justify-between border-b-2">
        {tabs.map((tab, index) => (
          <Link
            key={index}
            to={tab.path}
            className={classNames(
              'py-2 px-4 transition-all duration-300 ease-in-out', 
              {
                'text-[#087abc] border-b-2 border-[#087abc] font-bold': activeTab === index,
                'border-transparent text-gray-600 hover:text-[#087abc] hover:border-b-2 hover:border-[#087abc]': activeTab !== index
              }
            )}
            aria-selected={activeTab === index}
            role="tab"
          >
            {tab.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TabsComponent;
