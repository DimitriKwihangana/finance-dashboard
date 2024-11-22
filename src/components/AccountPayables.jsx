import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAccountPayable, fetchBankBalances } from '../features/dataSlice';
import axios from '../api';

const AccountPayable = () => {
  const [data, setData] = useState([]);
  const [showReadOnlyModal, setShowReadOnlyModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentRow, setCurrentRow] = useState(null);
  const [formData, setFormData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const navigate = useNavigate();

  const handleCloseReadOnly = () => setShowReadOnlyModal(false);
  const handleCloseEdit = () => setShowEditModal(false);
  const handleCloseCreate = () => setShowCreateModal(false);
  const handleShowCreate = () => {
    setFormData({});
    setShowCreateModal(true);
  };

  const handleRowClick = (row) => {
    setCurrentRow(row);
    setShowReadOnlyModal(true);
  };

  const handleShowEdit = () => {
    setShowReadOnlyModal(false)
    setFormData(currentRow);
    setShowEditModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value, company:selectedCompany });
  };

  const handleCreate = async () => {
    try {
      await axios.post('/accountpayable/', formData);
      setShowCreateModal(false);
      window.location.reload();
    } catch (error) {
      console.error('Error creating data:', error);
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`accountpayable/${currentRow.id}/`, formData);
      setShowEditModal(false);
      window.location.reload();
    } catch (error) {
      console.error('Error updating data:', error);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete this entry?');
    if (confirmDelete) {
      try {
        await axios.delete(`accountpayable/${currentRow.id}/`);
        setShowReadOnlyModal(false);
        window.location.reload();
      } catch (error) {
        console.error('Error deleting data:', error);
      }
    }
  };

  const dispatch = useDispatch();

  const handleFetchProjects = useCallback(() => {
    dispatch(fetchAccountPayable());
    dispatch(fetchBankBalances());
  }, [dispatch]);

  useEffect(() => {
    handleFetchProjects();
  }, [handleFetchProjects]);

  const [selectedCompany, setSelectedCompany] = useState(() => {
    return localStorage.getItem("financeUpdate") || "VanguardEconomics";
  });

  const allAccountPayables = useSelector((state) => state.data.accountPayable);

  const accountPayables = allAccountPayables.filter((data) => data.company == selectedCompany)

  const mainColor = selectedCompany == "VanguardEconomics" ? '#087abc':'#12723a'; // Main color


  const totalaccountPayables = accountPayables.reduce(
    (total, item) => total + parseFloat(item.total_amount || 0),
    0
  );

  const balanceaccountPayables = accountPayables.reduce(
    (total, item) => total + parseFloat(item.balance || 0),
    0
  );

  const filteredData = accountPayables.filter((row) =>
    row.supplier_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const today = new Date();
  const formattedDate = `${today.getDate()}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

  return (
    <div className=" ">
    

      <main className="">
        <div className="bg-white rounded-lg shadow-lg p-4">
          <h2 className="text-xl font-bold mb-4 text-center" style={{color : mainColor}} >ACCOUNT  PAYABLES AGEING SUMMARY AS OF <span className="underline underline-offset-8">{formattedDate}</span>
</h2>
          
          <input
            type="text"
            placeholder="Search by Customer Name..."
            className="w-full p-2 mb-4 border border-gray-400 rounded"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead>
              <tr>
              <th className="px-6 py-3  text-left text-xs font-semibold text-white uppercase tracking-wider" style={{backgroundColor : mainColor}}>Invoice Date</th>
              <th className="px-6 py-3  text-left text-xs font-semibold text-white uppercase tracking-wider" style={{backgroundColor : mainColor}}>Invoice Number</th>
              <th className="px-6 py-3  text-left text-xs font-semibold text-white uppercase tracking-wider" style={{backgroundColor : mainColor}}>Supplier Name</th>
              <th className="px-6 py-3  text-left text-xs font-semibold text-white uppercase tracking-wider" style={{backgroundColor : mainColor}}>Total Amount</th>
              <th className="px-6 py-3  text-left text-xs font-semibold text-white uppercase tracking-wider" style={{backgroundColor : mainColor}}>Due Date</th>
              <th className="px-6 py-3  text-left text-xs font-semibold text-white uppercase tracking-wider" style={{backgroundColor : mainColor}}>Balance</th>
              <th className="px-6 py-3  text-left text-xs font-semibold text-white uppercase tracking-wider" style={{backgroundColor : mainColor}}>Service Type</th>
              <th className="px-6 py-3  text-left text-xs font-semibold text-white uppercase tracking-wider" style={{backgroundColor : mainColor}}>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => handleRowClick(row)}
                  className="hover:bg-gray-100 cursor-pointer border-t"
                >
                  <td className="px-3 py-2 max-w-18">{row.invoice_date}</td>
                  <td className="px-3 py-2 max-w-18">{row.invoice_number}</td>
                  <td className="px-3 py-2 max-w-18">{row.supplier_name}</td>
                  <td className="px-3 py-2 max-w-18">{row.total_amount ? parseFloat((row.total_amount)).toLocaleString() : 'N/A'}</td>
                  <td className="px-3 py-2 max-w-18">{row.due_date}</td>
                  <td className="px-3 py-2 max-w-18">{row.balance ? parseFloat((row.balance)).toLocaleString() : 'N/A' }</td>
                  <td className="px-3 py-2 max-w-18">{row.service_type}</td>
                  <td className="px-3 py-2 max-w-18">
                    {Math.round((row.balance / totalaccountPayables) * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
            <tr className="border-t border-gray-300">
              <td colSpan="3" className="py-2 text-left">
                <strong></strong>
              </td>
              <td className="px-3 py-2 text-left font-semibold">{totalaccountPayables ? totalaccountPayables.toLocaleString() : 'N/A'}</td>
              <td colSpan="1" className="py-2 text-center">
                <strong></strong>
              </td>
              <td className="px-3 py-2 text-left font-semibold">{balanceaccountPayables ? balanceaccountPayables.toLocaleString() : 'N/A'}</td>
            </tr>

            </tfoot>
          </table>
        </div>
        <div className=" inset-0 flex items-center justify-center p-5">

        <button
      onClick={handleShowCreate}
      className=" flex items-center justify-center w-12 h-12 hover:bg-blue-600 text-white rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300" style={{backgroundColor : mainColor}}
      >
      <span className="text-xl font-bold">+</span>
    </button>
      </div>
      </main>

      {showCreateModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white rounded-lg shadow-lg w-1/3 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold" style={{color : mainColor}}>Create New Entry</h3>
        <button
          onClick={handleCloseCreate}
          className="text-gray-500 hover:text-gray-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <form>
        {/* Invoice Date */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="invoice_date">
            Invoice Date
          </label>
          <input
            type="date"
            id="invoice_date"
            name="invoice_date"
            value={formData.invoice_date || ''}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        {/* Invoice Number */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="invoice_number">
            Invoice Number
          </label>
          <input
            type="text"
            id="invoice_number"
            name="invoice_number"
            value={formData.invoice_number || ''}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        {/* Supplier Name */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="supplier_name">
            Supplier Name
          </label>
          <input
            type="text"
            id="supplier_name"
            name="supplier_name"
            value={formData.supplier_name || ''}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        {/* Total Amount */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="total_amount">
            Total Amount
          </label>
          <input
            type="number"
            id="total_amount"
            name="total_amount"
            value={formData.total_amount || ''}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        {/* Due Date */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="due_date">
            Due Date
          </label>
          <input
            type="date"
            id="due_date"
            name="due_date"
            value={formData.due_date || ''}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        {/* Balance */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="balance">
            Balance
          </label>
          <input
            type="number"
            id="balance"
            name="balance"
            value={formData.balance || ''}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        {/* Service Type */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="service_type">
            Service Type
          </label>
          <select
            id="service_type"
            name="service_type"
            value={formData.service_type || ''}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Select Service Type</option>
            <option value="EXPORT OF SERVICES">EXPORT OF SERVICES</option>
            <option value="LOCAL SERVICE">LOCAL SERVICE</option>
          </select>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleCloseCreate}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleCreate}
            className="text-white px-4 py-2 rounded hover:bg-blue-700"
            style={{backgroundColor : mainColor}}
          >
            Create
          </button>
        </div>
      </form>
    </div>
  </div>
)}

{showEditModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white rounded-lg shadow-lg w-1/3 p-6">
      <h3 className="text-xl font-bold mb-4" style={{color : mainColor}}>Edit Account Payable</h3>
      <form onSubmit={(e) => e.preventDefault()}>
      <div className="mb-4">
          <label className="block text-gray-700">Invoice Date</label>
          <input
            type="date"
            name="invoice_date"
            value={formData.invoice_date || ''}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Supplier Name</label>
          <input
            type="text"
            name="supplier_name"
            value={formData.supplier_name || ''}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Invoice Number</label>
          <input
            type="text"
            name="invoice_number"
            value={formData.invoice_number || ''}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Total Amount</label>
          <input
            type="number"
            name="total_amount"
            value={formData.total_amount || ''}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Balance</label>
          <input
            type="number"
            name="balance"
            value={formData.balance || ''}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Due Date</label>
          <input
            type="date"
            name="due_date"
            value={formData.due_date || ''}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Service Type</label>
          <input
            type="text"
            name="service_type"
            value={formData.service_type || ''}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleCloseEdit}
            className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="text-white px-4 py-2 rounded"
            style={{backgroundColor : mainColor}}
          >
            Update
          </button>
        </div>
      </form>
    </div>
  </div>
)}

{showReadOnlyModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white rounded-lg shadow-lg w-1/3 p-6">
      <h3 className="text-xl font-bold mb-4" style={{color : mainColor}}>View Account Payable</h3>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium">Supplier Name:</label>
        <p className="text-gray-800">{currentRow?.supplier_name || 'N/A'}</p>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium">Invoice Number:</label>
        <p className="text-gray-800">{currentRow?.invoice_number || 'N/A'}</p>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium">Total Amount:</label>
        <p className="text-gray-800">{currentRow?.total_amount || 'N/A'}</p>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium">Date Created:</label>
        <p className="text-gray-800">{currentRow?.invoice_date || 'N/A'}</p>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium">Balance:</label>
        <p className="text-gray-800">{currentRow?.balance || 'N/A'}</p>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium">Due Date:</label>
        <p className="text-gray-800">{currentRow?.due_date || 'N/A'}</p>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium">Type Of Service:</label>
        <p className="text-gray-800">{currentRow?.service_type || 'N/A'}</p>
      </div>
      <div className="flex justify-end space-x-3">
        <button
          onClick={handleCloseReadOnly}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Close
        </button>
        <button
          onClick={handleShowEdit}
          className="text-white px-4 py-2 rounded"
          style={{backgroundColor : mainColor}}
        >

          edit
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
         Delete
        </button>
      </div>
    </div>
  </div>
)}


    </div>
  );
};

export default AccountPayable;
