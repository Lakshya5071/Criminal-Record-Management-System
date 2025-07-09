import React, { useState, useEffect } from 'react'
import { Card, Datepicker, Dropdown } from "flowbite-react";
import { formatDate, getRelativeTime } from '../../utils/dateUtils';
import { Link } from 'react-router';

const CASE_TYPES = [
    'CRIMINAL', 'CIVIL', 'FAMILY', 'PROPERTY', 'CYBERCRIME',
    'FINANCIAL_FRAUD', 'MURDER', 'ROBBERY', 'ASSAULT',
    'DOMESTIC_VIOLENCE', 'TRAFFIC_VIOLATION', 'NARCOTICS',
    'CORRUPTION', 'TERRORISM', 'WHITE_COLLAR', 'ENVIRONMENTAL',
    'INTELLECTUAL_PROPERTY', 'LABOR_DISPUTE', 'CONSTITUTIONAL',
    'PUBLIC_INTEREST'
];

const CASE_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CLOSED'];

function Cases() {
    const [casesData, setCasesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState(null);
    const [caseTypeFilter, setCaseTypeFilter] = useState(null);
    const [caseStatusFilter, setCaseStatusFilter] = useState(null);

    const fetchCases = async (params = {}) => {
        try {
            setLoading(true);

            // Build query string from params
            const queryParams = new URLSearchParams();
            if (params.search) queryParams.append('search', params.search);
            if (params.type) queryParams.append('type', params.type);
            if (params.status) queryParams.append('status', params.status);
            if (params.date_after) queryParams.append('date_after', params.date_after);

            const queryString = queryParams.toString();
            const url = `http://${import.meta.env.VITE_BACKEND_URL}/cases/${queryString ? `?${queryString}` : ''}`;

            console.log('Fetching from:', url);
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setCasesData(data.cases);
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Effect to fetch data when filters change
    useEffect(() => {
        const params = {
            search: searchQuery,
            type: caseTypeFilter,
            status: caseStatusFilter,
            date_after: dateFilter ? dateFilter.toISOString().split('T')[0] : null
        };

        // Debounce search queries
        const timeoutId = setTimeout(() => {
            fetchCases(params);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, dateFilter, caseTypeFilter, caseStatusFilter]);

    return (
        <div>
            <div className="relative h-[calc(50vh-65px)] ">
                {/* Background container */}

                <div className="absolute inset-0 bg-gray-200">
                </div>

                {/* Content container */}
                <div className="relative h-full flex flex-col items-center justify-center px-container-px md:px-container-px-md">
                    <p className="pt-6 px-4 max-w-[500px] text-center text-black text-base md:text-lg font-light
                        flex flex-col gap-4"
                        style={{ textShadow: '0 0 12px rgba(255, 255, 255, 1), 0 0 20px rgba(255, 255, 255, 0.8)' }}
                    >

                        <h2 className='font-bold text-2xl'>Search for cases by names, dates, people involved, and more</h2>
                        <input type="text" placeholder="Search"
                            className="w-full p-2 rounded-md border border-gray-300"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="bg-blue-500 text-white px-4 py-2 rounded-md">Search</button>
                    </p>
                </div>
            </div>
            <div className="max-w-[900px] mx-auto px-container-px md:px-container-px-md py-5">
                {/* Filters */}
                <div className="flex justify-center items-center gap-4 flex-wrap">
                    <Datepicker
                        value={dateFilter}
                        onChange={(date) => setDateFilter(date)}
                        minDate={new Date(2023, 0, 1)}
                        maxDate={new Date()}
                    />
                    <Dropdown
                        label={caseTypeFilter || "Case Type"}
                        placement="bottom"
                        dismissOnClick={true}
                    >
                        <div className="max-h-48 overflow-y-auto">
                            <Dropdown.Item onClick={() => setCaseTypeFilter(null)}>
                                All Types
                            </Dropdown.Item>
                            {CASE_TYPES.map((type) => (
                                <Dropdown.Item
                                    key={type}
                                    onClick={() => setCaseTypeFilter(type)}
                                >
                                    {type.replace(/_/g, ' ')}
                                </Dropdown.Item>
                            ))}
                        </div>
                    </Dropdown>

                    <Dropdown
                        label={caseStatusFilter || "Case Status"}
                        placement="bottom"
                        dismissOnClick={true}
                    >
                        <div className="max-h-48 overflow-y-auto">
                            <Dropdown.Item onClick={() => setCaseStatusFilter(null)}>
                                All Statuses
                            </Dropdown.Item>
                            {CASE_STATUSES.map((status) => (
                                <Dropdown.Item
                                    key={status}
                                    onClick={() => setCaseStatusFilter(status)}
                                >
                                    {status.replace(/_/g, ' ')}
                                </Dropdown.Item>
                            ))}
                        </div>
                    </Dropdown>
                </div>

                {/* Filter the cases based on selected filters */}
                <div className="grid grid-cols-2 gap-2 py-10 items-start">
                    {loading ? (
                        <div>Loading...</div>
                    ) : error ? (
                        <div className="text-red-500">{error}</div>
                    ) : (
                        casesData?.map((c) => (
                            <Link to={`/cases/${c.id}`} key={c.id}>
                                <Card className="rounded-2xl max-w-sm h-full flex flex-col justify-between 
                                hover:bg-gray-100 hover:rounded-3xl transition-all duration-300">
                                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                                        {c.case_name}
                                    </h2>
                                    <p className="font-normal text-gray-700">
                                        {c.case_description}
                                    </p>
                                    <div className="font-normal text-gray-600 space-y-2">
                                        <p>
                                            <span className="font-semibold">Type: </span>
                                            {c.case_type.replace(/_/g, ' ')}
                                        </p>
                                        <p>
                                            <span className="font-semibold">Status: </span>
                                            {c.case_status.replace(/_/g, ' ')}
                                        </p>
                                        <p className="text-sm font-bold">
                                            {formatDate(c.case_date_filed, false)}
                                        </p>
                                    </div>
                                </Card>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

const regions = [
    "TN",
    "KA",
    "AP",
    "MH",
    "UP",
    "DL",

]
export default Cases