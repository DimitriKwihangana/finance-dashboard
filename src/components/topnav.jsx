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

  const [selectedCompany, setSelectedCompany] = useState(() => {
    return localStorage.getItem('financeUpdate') || 'VanguardEconomics';
  });

  const mainColor = selectedCompany === 'VanguardEconomics' ? '#087abc' : '#12723a'; // Main color

  const handleChange = (event) => {
    const value = event.target.value;
    setSelectedCompany(value);
    localStorage.setItem('financeUpdate', value);
    window.location.reload();
  };

  // Use useEffect to set active tab based on the current path
  useEffect(() => {
    const currentTab = tabs.findIndex((tab) => tab.path === location.pathname);
    setActiveTab(currentTab !== -1 ? currentTab : 0);
  }, [location.pathname, tabs]);

  return (
    <div className="w-full">
      <div className="flex justify-center mb-4">
        <select
          value={selectedCompany} // Controlled component
          onChange={handleChange}
          className="text-2xl font-bold text-center p-2 appearance-none"
          style={{
            color: mainColor,
            background: 'none',
            border: 'none',
            outline: 'none',
          }}
        >
          <option value="VanguardEconomics">VANGUARD FINANCE UPDATES</option>
          <option value="Aflakiosk">AFLAKIOSK FINANCE UPDATES</option>
        </select>
      </div>
      <div className="flex justify-between border-b-2">
        {tabs.map((tab, index) => (
          <Link
            style={{ color: mainColor }}
            key={index}
            to={tab.path}
            className={classNames(
              'py-2 px-4 transition-all duration-300 ease-in-out',
              {
                [`border-b-2 border-[${mainColor}] font-bold`]: activeTab === index,
                [`border-transparent text-gray-600 hover:text-[${mainColor}] hover:border-b-2 hover:border-[${mainColor}]`]:
                  activeTab !== index,
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
