import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import { fetchRates } from "../features/dataSlice";
import axios from '../api';

const CurrencyCrud = () => {
    const [currency, setCurrency] = useState({ currency_code: '', name: '', rwf_equivalent: '' });
    const [editing, setEditing] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Redux state for rates
    const rates = useSelector((state) => state.data.rates);

    // Fetch rates on component mount
    useEffect(() => {
        dispatch(fetchRates());
    }, [dispatch]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrency((prev) => ({ ...prev, [name]: value }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await axios.put(`currency/${currency.id}/`, currency);
                window.location.reload();
            } else {
                try {
                    await axios.post(`currency/`, currency);
                    window.location.reload();
                } catch (error) {
                    console.error("Error creating data:", error);
                }
            }
            setCurrency({ currency_code: '', name: '', rwf_equivalent: '' });
            setEditing(false);
        } catch (err) {
            setError('Error saving currency');
        }
    };

    // Handle edit button click
    const handleEdit = (currencyData) => {
        setCurrency(currencyData);
        setEditing(true);
    };

    return (
        <div>
            <h1 className="text-xl font-bold mb-4 text-[#087abc]  text-center">CURRENCY MANAGEMENT</h1>
            {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <input
                        type="text"
                        name="currency_code"
                        value={currency.currency_code}
                        onChange={handleChange}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#087ABC]"
                        placeholder="Currency Code"
                        required
                    />
                    <input
                        type="text"
                        name="name"
                        value={currency.name}
                        onChange={handleChange}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#087ABC]"
                        placeholder="Currency Name"
                        required
                    />
                    <input
                        type="text"
                        name="rwf_equivalent"
                        value={currency.rwf_equivalent}
                        onChange={handleChange}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#087ABC]"
                        placeholder="RWF Equivalent"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className={`w-full px-4 py-2 text-white rounded-md ${editing ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-500 hover:bg-blue-600'}`}
                >
                    {editing ? 'Update Currency' : 'Add Currency'}
                </button>
            </form>
            <h2 className="text-xl font-bold mb-4 text-[#087abc]  text-center">CURRENCY LIST</h2>
            <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md">
                {rates.map((currency) => (
                    <li key={currency.id} className="px-4 py-4 flex justify-between items-center">
                        <div>
                            {currency.currency_code}- RWF - <strong>{(parseFloat(currency.rwf_equivalent)).toFixed(4)}</strong> 
                        </div>
                        <div>
                            <button
                                className="px-4 py-2 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600"
                                onClick={() => handleEdit(currency)}
                            >
                                Edit
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CurrencyCrud;
