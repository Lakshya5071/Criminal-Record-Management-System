// src/people/index.jsx
import React, { useState, useEffect } from 'react'
import { Datepicker, Dropdown } from 'flowbite-react'
import { Link, useNavigate } from "react-router"
import { formatDate } from '../../utils/dateUtils'

function People() {
  const [peopleData, setPeopleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });


  const [nav, setNav] = useState(false)
  const navigate = useNavigate()

  const handleNav = () => {
    setNav(!nav)
  }

  const navigateTo = (url) => {
    navigate(url)
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    })
  }

  const fetchPeople = async (params = {}) => {
    try {
      setLoading(true);

      // Build query string
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);

      const queryString = queryParams.toString();
      const url = `http://${import.meta.env.VITE_BACKEND_URL}/persons/${queryString ? `?${queryString}` : ''}`;

      console.log('Fetching from:', url);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPeopleData(data.people);
      console.log("People:", data.people);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch data when search changes
  useEffect(() => {
    const params = {
      search: searchQuery
    };

    // Debounce search queries
    const timeoutId = setTimeout(() => {
      fetchPeople(params);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const sortData = (data, key, direction) => {
    if (!key) return data;

    return [...data].sort((a, b) => {
      if (key === 'person_dob') {
        const dateA = new Date(a[key]);
        const dateB = new Date(b[key]);
        return direction === 'asc' ? dateA - dateB : dateB - dateA;
      }

      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const sortedData = sortData(peopleData, sortConfig.key, sortConfig.direction);

  return (
    <div>
      {/* Hero / Search */}
      <div className="relative h-[calc(50vh-65px)]">
        <div className="absolute inset-0 bg-gray-200" />
        <div className="relative h-full flex flex-col items-center justify-center px-container-px md:px-container-px-md">
          <p
            className="pt-6 px-4 max-w-[500px] text-center text-black text-base md:text-lg font-light flex flex-col gap-4"
            style={{
              textShadow:
                '0 0 12px rgba(255, 255, 255, 1), 0 0 20px rgba(255, 255, 255, 0.8)',
            }}
          >
            <h2 className="font-bold text-2xl">
              Search for people by name, role, aadhaar, phone, or address
            </h2>
            <input
              type="text"
              placeholder="Search"
              className="w-full p-2 rounded-md border border-gray-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </p>
        </div>
      </div>

      {/* Filters and Table */}
      <div className="max-w-[1200px] mx-auto px-container-px md:px-container-px-md py-5">

        {/* Section Heading */}
        <h3 className="text-xl font-semibold mb-4 text-center text-gray-800">
          People Records
        </h3>

        {/* Table */}
        <div className="overflow-hidden rounded-3xl shadow-xl">
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">{error}</div>
          ) : (
            <table className="min-w-full table-auto bg-white">
              <thead>
                <tr className="bg-red-50 border-b border-gray-300">
                  <th className="px-6 py-3 text-left">
                    <button
                      className="font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1"
                      onClick={() => handleSort('person_name')}
                    >
                      Name {getSortIcon('person_name')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-gray-600 font-semibold">Gender</th>
                  <th className="px-6 py-3 text-left">
                    <button
                      className="font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1"
                      onClick={() => handleSort('person_dob')}
                    >
                      Date of Birth {getSortIcon('person_dob')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-gray-600 font-semibold">Aadhaar</th>
                  <th className="px-6 py-3 text-left text-gray-600 font-semibold">Phone</th>
                  <th className="px-6 py-3 text-left text-gray-600 font-semibold">Address</th>
                  <th className="px-6 py-3 text-left text-gray-600 font-semibold">Associated Cases</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedData?.map((person) => (
                  <tr key={person.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">{person.person_name}</td>
                    <td className="px-6 py-4">
                      {person.person_gender.charAt(0) + person.person_gender.slice(1).toLowerCase()}
                    </td>
                    <td className="px-6 py-4">
                      {formatDate(person.person_dob, false)}
                    </td>
                    <td className="px-6 py-4">{person.aadhaar_number}</td>
                    <td className="px-6 py-4">{person.phone_number}</td>
                    <td className="px-6 py-4">{person.person_address}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {person.case_associations?.map((association, index) => (
                          <div key={index} className="text-sm">
                            <Link
                              to={`/cases/${association.case_id}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                            >
                              {association.case_name}
                            </Link>
                            <div className="mt-1 text-gray-600">
                              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                                {association.role.replace(/_/g, ' ')}
                              </span>
                              {association.comments && (
                                <p className="mt-1 text-gray-500 italic">
                                  "{association.comments}"
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default People