import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import { fetchExpenses, fetchBankBalances, fetchRates } from "../features/dataSlice";
import axios from '../api';
import { Table, Button, Modal, Navbar, Nav, Form } from 'react-bootstrap';

const BankBalances = () => {
  const [data, setData] = useState([]);
  const [odB, setOdB] = useState(0);
  const [totalCurrentAsserts, setTotalCurrentAsserts] = useState(0);
  const [totalUG, setTotalUG] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentRow, setCurrentRow] = useState(null);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  const handleCloseEdit = () => setShowEditModal(false);
  const handleShowEdit = (row) => {
    setCurrentRow(row);
    setFormData(row);
    setShowDetailsModal(false);
    setShowEditModal(true);
  };

  const handleShowCreate = () => {
    setFormData({});
    setShowCreateModal(true);
  };

  const handleCloseCreate = () => setShowCreateModal(false);

  const handleCloseDetails = () => setShowDetailsModal(false);
  const handleShowDetails = (row) => {
    setCurrentRow(row);
    setShowDetailsModal(true);
  };

  const [selectedOption, setSelectedOption] = useState('');

  const handleChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`bankbalance/${currentRow.id}/`, formData);
      setShowEditModal(false);
      window.location.reload();
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  const handleCreate = async () => {
    try {
      await axios.post(`bankbalance/`, formData);
      setShowCreateModal(false);
      window.location.reload();
    } catch (error) {
      console.log(formData)
      console.error("Error creating data:", error);
    }
  };

  const dispatch = useDispatch();

  const handleFetchProjects = useCallback(() => {
    dispatch(fetchExpenses());
    dispatch(fetchBankBalances());
    dispatch(fetchRates())
  }, [dispatch]);

  useEffect(() => {
    handleFetchProjects();
  }, [handleFetchProjects]);

  const bankBalances = useSelector((state) => state.data.bankBalances);
  const rates = useSelector((state) => state.data.rates);
  const unutilizedGrant = bankBalances.filter((grants) => grants.type === 'Unutilized Grant');
  const currentAssets = bankBalances.filter((assets) => assets.type === 'Current Asset');
  const netCurrentAssets = bankBalances.filter((assets) => assets.type === 'NET CURRENT ASSET');

  useEffect(() => {
    setTotalCurrentAsserts(
      currentAssets.reduce(
        (total, tCurrentAssets) => total + parseFloat(tCurrentAssets.amount * tCurrentAssets.rwf_equivalent),
        0
      )
    );

    setTotalUG(
      unutilizedGrant.reduce(
        (total, tUG) => total + parseFloat(tUG.amount * tUG.rwf_equivalent),
        0
      )
    );

    const negativeEntry = bankBalances.find((entry) => entry.name === 'OD USAGE');
    const positiveEntry = bankBalances.find((entry) => entry.name === 'OD SECURITY(USD)');

    const negativeValue = negativeEntry
      ? parseFloat(negativeEntry.rwf_equivalent) * parseFloat(negativeEntry.amount)
      : 0;

    const positiveValue = positiveEntry
      ? parseFloat(positiveEntry.rwf_equivalent) * parseFloat(positiveEntry.amount)
      : 0;

    setOdB(positiveValue - negativeValue);
  }, [bankBalances]);

  const today = new Date();
  const formattedDate = `${today.getDate()}-${String(today.getMonth() + 1).padStart(2, "0")}-${today.getFullYear()}`;

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this entry?");
    if (confirmDelete) {
      try {
        await axios.delete(`bankbalance/${currentRow.id}/`);
        setShowDetailsModal(false);
        window.location.reload();
      } catch (error) {
        console.error("Error deleting data:", error);
      }
    }
  };

  return (
    <div>
      <div className="bg-white rounded-lg shadow-lg p-4">
        <h2 className="text-xl font-boTableld mb-4 text-[#087abc]  text-center">VANGUARD BANK BALANCES AS OF <span className="underline underline-offset-8">{formattedDate}</span></h2>

        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-[#087ABC] text-left text-xs font-semibold text-white uppercase tracking-wider">CASH AT BANK</th>
              <th className="px-6 py-3 bg-[#087ABC] text-left text-xs font-semibold text-white uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 bg-[#087ABC] text-left text-xs font-semibold text-white uppercase tracking-wider">Rate</th>
              <th className="px-6 py-3 bg-[#087ABC] text-left text-xs font-semibold text-white uppercase tracking-wider">Amount in RWF</th>
            </tr>
          </thead>
          <tbody>
            {currentAssets.map((row) => (
              <tr key={row.id} 
              onClick={() => handleShowDetails(row)
              }
              className="hover:bg-gray-100 cursor-pointer border-t"
              >
                <td className="px-3 py-2 max-w-18">{row.name}</td>
                <td className="px-3 py-2 max-w-18">{row.amount}</td>
                <td className="px-3 py-2 max-w-18">{row.rwf_equivalent}</td>
                <td className="px-3 py-2 max-w-18">{(row.amount * row.rwf_equivalent).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3" className="py-2 text-left"><strong>TOTAL CURRENT ASSETS</strong></td>
              <td className="py-2 text-left font-semibold">{totalCurrentAsserts}</td>
            </tr>
          </tfoot>
        </table>

        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="px-6 py-3  text-left text-xs font-semibold text-white uppercase tracking-wider"></th>
              <th className="px-6 py-3  text-left text-xs font-semibold text-white uppercase tracking-wider"></th>
              <th className="px-6 py-3  text-left text-xs font-semibold text-white uppercase tracking-wider"></th>
              <th className="px-6 py-3  text-left text-xs font-semibold text-white uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody>
            {netCurrentAssets.map((row) => (
              <tr key={row.id} 
              onClick={() => handleShowDetails(row)}
              className="hover:bg-gray-100 cursor-pointer border-t"
              >
                <td className="px-3 py-2 max-w-18">{row.name}</td>
                <td className="px-3 py-2 max-w-18">{row.amount}</td>
                <td className="px-3 py-2 max-w-18">{row.rwf_equivalent}</td>
                <td className="px-3 py-2 max-w-18">{(row.amount * row.rwf_equivalent).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3" className="py-2 text-left">BALANCE OF O/D</td>
              <td className="py-2 text-left font-semibold">{odB}</td>
            </tr>
            <tr>
              <td colSpan="3" className="py-2 text-left"><strong>NET CURRENT ASSETS/NET CASH IN BANK</strong></td>
              <td className="py-2 text-left font-semibold">{odB}</td>
            </tr>
          </tfoot>
        </table>

        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr>
            <th className="px-6 py-3  text-left text-xs font-semibold text-white uppercase tracking-wider"></th>
            <th className="px-6 py-3  text-left text-xs font-semibold text-white uppercase tracking-wider"></th>
            <th className="px-6 py-3  text-left text-xs font-semibold text-white uppercase tracking-wider"></th>
            <th className="px-6 py-3  text-left text-xs font-semibold text-white uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody>
            {unutilizedGrant.map((row) => (
              <tr key={row.id} 
              onClick={() => handleShowDetails(row)}
              className="hover:bg-gray-100 cursor-pointer border-t"
              >
                <td className="px-3 py-2 max-w-18">{row.name}</td>
                <td className="px-3 py-2 max-w-18">{row.amount}</td>
                <td className="px-3 py-2 max-w-18">{row.rwf_equivalent}</td>
                <td className="px-3 py-2 max-w-18">{(row.amount * row.rwf_equivalent).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3" className="py-2 text-left"><strong>TOTAL UNUTILIZED GRANT</strong></td>
              <td className="py-2 text-left font-semibold">{totalUG}</td>
            </tr>
          </tfoot>
        </table>
        <div className=" inset-0 flex items-center justify-center p-5">
            <button
            onClick={handleShowCreate}
            className=" flex items-center justify-center w-12 h-12 bg-[#087abc] hover:bg-blue-600 text-white rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
            <span className="text-xl font-bold">+</span>
            </button>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white rounded-lg shadow-lg w-1/3 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-boTableld mb-4 text-[#087abc]  text-center">Edit Bank Balance</h3>
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
            <div className="px-6 py-4">
              <form>
                <div className="mb-4">
                  <label
                    htmlFor="name"
                    className="block text-gray-700"                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    placeholder="Enter name"
                    className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="amount"
                    className="block text-gray-700"                  >
                    Amount
                  </label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount || ''}
                    onChange={handleInputChange}
                    placeholder="Amount"
                    className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>

                <div className="mb-4">
                  <label htmlFor="currency" 
                  className="block text-gray-700">
                    Currency
                  </label>
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency || ''}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">Select Currency</option>
                    {rates.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label htmlFor="type" 
                  className="block text-gray-700">
                    Category
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type || ''}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">Select Category</option>
                    <option value="Current Asset">Current Asset</option>
                    <option value="Unutilized Grant">Unutilized Grant</option>
                    <option value="NET CURRENT ASSET">Net Current Asset</option>
                  </select>
                </div>

              </form>
            </div>
            <div className="flex items-center justify-end px-6 py-4 border-t">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                onClick={handleCloseEdit}
              >
                Close
              </button>
              <button
                className="ml-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                onClick={handleUpdate}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}


        {showDetailsModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-1/3 p-6">
            <h3 className="text-xl font-boTableld mb-4 text-[#087abc]  text-center">View Bank Balance</h3>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium">Name:</label>
              <p className="text-gray-800">{currentRow?.name || 'N/A'}</p>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium">Amount:</label>
              <p className="text-gray-800">{currentRow?.amount || 'N/A'}</p>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium">Rate:</label>
              <p className="text-gray-800">{currentRow?.rwf_equivalent || 'N/A'}</p>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium">Amount In RWF:</label>
              <p className="text-gray-800">{(currentRow?.rwf_equivalent * currentRow?.amount) || 'N/A'}</p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCloseDetails}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Close
              </button>
              <button
                onClick={handleShowEdit}
                className="bg-blue-600 text-white px-4 py-2 rounded"
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white rounded-lg shadow-lg w-1/3 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Create Bank Balance</h3>
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
            <div className="px-6 py-4">
              <form>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="amount">
                  Amount
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount || ''}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

                <div className="mb-4">
                  <label htmlFor="currency" className="block text-gray-700 font-medium mb-2">
                    Currency
                  </label>
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency || ''}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">Select Currency</option>
                    {rates.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label htmlFor="type" className="block text-gray-700 font-medium mb-2">
                    Category
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type || ''}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">Select Category</option>
                    <option value="Current Asset">Current Asset</option>
                    <option value="Unutilized Grant">Unutilized Grant</option>
                    <option value="NET CURRENT ASSET">Net Current Asset</option>
                  </select>
                </div>
              </form>
            </div>
            <div className="flex items-center justify-end px-6 py-4 border-t">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                onClick={handleCloseCreate}
              >
                Close
              </button>
              <button
                className="ml-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                onClick={handleCreate}
              >
                Create Bank Balance
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BankBalances;
