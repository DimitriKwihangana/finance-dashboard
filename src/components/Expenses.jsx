import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { fetchExpenses, fetchBankBalances } from "../features/dataSlice";
import axios from '../api';

const Expenses = () => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const dispatch = useDispatch();

  const [selectedCompany, setSelectedCompany] = useState(() => {
    return localStorage.getItem("financeUpdate") || "VanguardEconomics";
  });

  const allExpenses = useSelector((state) => state.data.expenses);

  const expenses = allExpenses.filter((data) => data.company == selectedCompany)

  const totalExpenses = expenses.reduce(
    (total, item) => total + parseFloat(item.amount || 0),
    0
  );

  const mainColor = selectedCompany == "VanguardEconomics" ? '#087abc':'#12723a'; // Main color


  const handleFetchProjects = useCallback(() => {
    dispatch(fetchExpenses());
    dispatch(fetchBankBalances());
  }, [dispatch]);

  useEffect(() => {
    handleFetchProjects();
  }, [handleFetchProjects]);

  const handleCloseEdit = () => setShowEditModal(false);
  const handleShowEdit = (row) => {
    setFormData(row);
    setShowEditModal(true);
  };

  const handleCloseCreate = () => {
    setFormData({});
    setShowCreateModal(false);
  };

  const handleShowCreate = () => setShowCreateModal(true);

  const handleCloseDetails = () => setShowDetailsModal(false);
  const handleShowDetails = (row) => {
    setFormData(row);
    setShowDetailsModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value, company:selectedCompany });
  };

  const handleCreate = async () => {
    try {
      await axios.post('/expense/', formData);
      setShowCreateModal(false);
      handleFetchProjects();
      window.location.reload();
    } catch (error) {
      console.error("Error creating data:", error);
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`expense/${formData.id}/`, formData);
      setShowEditModal(false);
      handleFetchProjects();
      window.location.reload();
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        await axios.delete(`expense/${id}/`);
        handleFetchProjects();
        window.location.reload();
      } catch (error) {
        console.error("Error deleting data:", error);
      }
    }
  };

  const filteredData = expenses.filter((row) =>
    row.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h2 className="text-xl font-bold mb-4  text-center" style={{color : mainColor}}>EXPENSES</h2>

      <input
        type="text"
        placeholder="Search by Description..."
        className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#087ABC]"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    <div>
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider" style={{backgroundColor : mainColor}}>
              Description
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider" style={{backgroundColor : mainColor}}>
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row) => (
            <tr
              key={row.id}
              onClick={() => handleShowDetails(row)}
              className="hover:bg-gray-100 cursor-pointer border-t"
            >
              <td className="px-3 py-2 max-w-18">{row.description}</td>
              <td className="px-3 py-2 max-w-18">{row.amount}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
        <tr className="border-t border-gray-300">
              <td  className="py-2 text-left">
                <strong></strong>
              </td>
              <td className="px-3 py-2 text-left font-semibold">{totalExpenses}</td>
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

      {/* Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4" style={{color : mainColor}}>Expense Details</h3>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-medium">Description:</label>
              <p className="text-gray-800">{formData?.description || 'N/A'}</p>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium">Amount:</label>
              <p className="text-gray-800">{formData?.amount || 'N/A'}</p>
            </div>            

            <div className="flex justify-end space-x-3">
            <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                onClick={handleCloseDetails}
              >
                Close
              </button>
              <button
                className="text-white px-4 py-2 rounded"
                onClick={() => { handleCloseDetails(); handleShowEdit(formData); }}
                style={{backgroundColor : mainColor}}
              >
                Edit
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded"
                onClick={() => { handleCloseDetails(); handleDelete(formData.id); }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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

        {/* Description*/}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="description">
          Description
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        {/* Amount */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="amount">
            Total Amount
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
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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
      <h3 className="text-xl font-bold mb-4" style={{color : mainColor}}>Edit Expense</h3>
      <form onSubmit={(e) => e.preventDefault()}>

        <div className="mb-4">
          <label className="block text-gray-700">Description</label>
          <input
            type="text"
            name="description"
            value={formData.description || ''}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Amount</label>
          <input
            type="number"
            name="amount"
            value={formData.amount || ''}
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



    </div>
  );
};

export default Expenses;
