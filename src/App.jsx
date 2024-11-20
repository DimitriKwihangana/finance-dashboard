import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import AccountReceivable from './components/AccountReceivables.jsx';
import Expenses from './components/Expenses.jsx';
import BankBalances from './components/BankBalances.jsx';
import CurrencyCrud from './components/Currencies.jsx';
import TabsComponent from './components/topnav.jsx';

function App() {
  return (
    <Router>
      <TabsComponent /> {/* Keep this inside Router */}
      <div className="p-5"> {/* Added Tailwind padding utility */}
        <Routes>
          <Route path="/account-receivables" element={<AccountReceivable />} />
          <Route path="/expense" element={<Expenses />} />
          <Route path="/bankbalance" element={<BankBalances />} />
          <Route path="/rates" element={<CurrencyCrud />} />
          <Route path="/" element={<AccountReceivable />} /> {/* Default route */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
