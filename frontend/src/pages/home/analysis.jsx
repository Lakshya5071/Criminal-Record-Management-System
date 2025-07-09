import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Bar } from 'react-chartjs-2';
import { Dropdown } from 'flowbite-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

// Add CASE_TYPES constant at the top
const CASE_TYPES = [
    'CRIMINAL', 'CIVIL', 'FAMILY', 'PROPERTY', 'CYBERCRIME',
    'FINANCIAL_FRAUD', 'MURDER', 'ROBBERY', 'ASSAULT',
    'DOMESTIC_VIOLENCE', 'TRAFFIC_VIOLATION', 'NARCOTICS',
    'CORRUPTION', 'TERRORISM', 'WHITE_COLLAR', 'ENVIRONMENTAL',
    'INTELLECTUAL_PROPERTY', 'LABOR_DISPUTE', 'CONSTITUTIONAL',
    'PUBLIC_INTEREST'
];

function Analysis() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [trendingCases, setTrendingCases] = useState([]);
    const [caseTypes, setCaseTypes] = useState(null);
    const [locationData, setLocationData] = useState([]);
    const [selectedCaseType, setSelectedCaseType] = useState(null);
    const [typesData, setTypesData] = useState(null);

    const boxShadow = "drop-shadow-[0px_10px_20px_rgba(0,0,0,0.06)]";
    const glassEffect = "backdrop-blur-xl bg-white/70";

    // Process the time series data
    const processTimeSeriesData = (typeStats, selectedType = null) => {
        // Initialize data for all case types with empty arrays
        const casesByType = CASE_TYPES.reduce((acc, type) => {
            acc[type] = [];
            return acc;
        }, {});

        // Fill in the actual data
        typeStats.forEach(stat => {
            casesByType[stat.case_type] = stat.cases;
        });

        // Get all cases based on filter
        let relevantCases = [];
        if (selectedType) {
            relevantCases = casesByType[selectedType].map(c => ({
                date: new Date(c.date_filed),
                type: selectedType
            }));
        } else {
            relevantCases = Object.entries(casesByType).flatMap(([type, cases]) =>
                cases.map(c => ({
                    date: new Date(c.date_filed),
                    type: type
                }))
            );
        }

        // Sort by date
        relevantCases.sort((a, b) => a.date - b.date);

        // Group by month-year
        const groupedByMonth = relevantCases.reduce((acc, curr) => {
            const monthYear = curr.date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short'
            });
            acc[monthYear] = (acc[monthYear] || 0) + 1;
            return acc;
        }, {});

        return {
            labels: Object.keys(groupedByMonth),
            datasets: [{
                label: selectedType ? selectedType.replace(/_/g, ' ') : 'All Cases',
                data: Object.values(groupedByMonth),
                backgroundColor: 'rgba(0, 122, 255, 0.8)',
                borderColor: 'rgba(0, 122, 255, 1)',
                borderWidth: 1
            }]
        };
    };

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                const baseUrl = `http://${import.meta.env.VITE_BACKEND_URL}`;

                const [typesRes, trendingRes, locationRes] = await Promise.all([
                    fetch(`${baseUrl}/analytics/types`),
                    fetch(`${baseUrl}/analytics/trending`),
                    fetch(`${baseUrl}/analytics/location`)
                ]);

                if (!typesRes.ok || !trendingRes.ok || !locationRes.ok) {
                    throw new Error('One or more requests failed');
                }

                const [typesData, trendingData, locationData] = await Promise.all([
                    typesRes.json(),
                    trendingRes.json(),
                    locationRes.json()
                ]);

                setTypesData(typesData.type_statistics);
                setCaseTypes(processTimeSeriesData(typesData.type_statistics));

                // Process trending cases
                setTrendingCases(trendingData.trending_cases
                    .filter(caseItem => caseItem.news) // Only show cases with news
                    .map(caseItem => ({
                        id: caseItem.case_id,
                        bgColor: 'bg-blue-100', // Could vary based on case type or age
                        dotColor: 'bg-blue-500',
                        timeframe: formatDate(caseItem.relevant_date),
                        title: caseItem.case_name,
                        news: caseItem.news
                    }))
                );

                // Process location data
                setLocationData(locationData.location_cases.map(caseItem => ({
                    id: caseItem.case_id,
                    title: caseItem.case_name,
                    location: [caseItem.latitude, caseItem.longitude],
                    type: caseItem.case_type.replace(/_/g, ' '),
                    location_name: caseItem.incident_location,
                    latest_activity: formatDate(caseItem.latest_activity_date)
                })));

            } catch (err) {
                console.error('Fetch error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    // Update chart when case type filter changes
    useEffect(() => {
        if (typesData) {
            setCaseTypes(processTimeSeriesData(typesData, selectedCaseType));
        }
    }, [selectedCaseType, typesData]);

    // Helper functions for colors
    const getBgColorForStatus = (status) => {
        const colors = {
            'ACTIVE': 'bg-blue-100',
            'COMPLETED': 'bg-green-100',
            'PENDING': 'bg-yellow-100',
            'SUSPENDED': 'bg-red-100'
        };
        return colors[status] || 'bg-gray-100';
    };

    const getDotColorForStatus = (status) => {
        const colors = {
            'ACTIVE': 'bg-blue-500',
            'COMPLETED': 'bg-green-500',
            'PENDING': 'bg-yellow-500',
            'SUSPENDED': 'bg-red-500'
        };
        return colors[status] || 'bg-gray-500';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Chart options
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
            title: {
                display: true,
                text: 'Cases Filed Over Time'
            }
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: {
                        family: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif',
                        size: 10
                    }
                }
            },
            y: {
                grid: {
                    color: 'rgba(0, 0, 0, 0.06)',
                },
                ticks: {
                    font: {
                        family: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif',
                        size: 10
                    },
                    stepSize: 1
                }
            },
        },
    };

    // Update the marker icon definition
    const customIcon = new Icon({
        iconUrl: markerIconPng,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    if (error) {
        return <div className="flex items-center justify-center h-screen text-red-500">Error: {error}</div>;
    }

    return (
        <div className=" from-gray-50 to-white p-6 h-[90vh] flex flex-col font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif]">
            <div className="flex gap-6 w-full h-[75vh]">
                {/* Left side */}
                <div className="w-1/2 flex flex-col gap-10">
                    {/* Trending Cases */}
                    <div className="h-1/2 space-y-3">
                        <div className="flex justify-between items-center">
                            <h2 className="text-gray-900 text-lg font-medium tracking-tight">Trending Cases</h2>
                        </div>
                        {trendingCases.map(card => (
                            <Link to={`/cases/${card.id}`} key={card.id} className="cursor-pointer">
                                <div className={`flex items-center justify-between ${glassEffect} p-2 rounded-xl ${boxShadow} transition-all duration-200 hover:scale-[1.01] my-3`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 ${card.bgColor} rounded-full flex items-center justify-center`}>
                                            <div className={`w-5 h-5 ${card.dotColor} rounded-full`}></div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">{card.timeframe}</p>
                                            <p className="text-sm font-medium">{card.title}</p>
                                            <p className="text-xs text-gray-600 mt-1">{card.news}</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Case Types Chart */}
                    <div className={`h-1/2 ${glassEffect} p-4 rounded-xl ${boxShadow}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-gray-900 text-lg font-medium tracking-tight">Cases Filed Over Time</h2>
                            <Dropdown
                                label={selectedCaseType ? selectedCaseType.replace(/_/g, ' ') : 'All Case Types'}
                                className="bg-white"
                            >
                                <Dropdown.Item onClick={() => setSelectedCaseType(null)}>
                                    All Case Types
                                </Dropdown.Item>
                                {CASE_TYPES.map(type => (
                                    <Dropdown.Item
                                        key={type}
                                        onClick={() => setSelectedCaseType(type)}
                                    >
                                        {type.replace(/_/g, ' ')}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown>
                        </div>
                        <div className="h-[calc(100%-2.5rem)]">
                            {caseTypes && <Bar data={caseTypes} options={chartOptions} />}
                        </div>
                    </div>
                </div>

                {/* Right side - Map */}
                <div className="w-1/2">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <h2 className="text-gray-900 text-lg font-medium tracking-tight">Case Distribution</h2>
                            <div className="w-6 h-6 bg-blue-500/10 rounded-full flex items-center justify-center">
                                <span className="text-blue-500 text-xs">📍</span>
                            </div>
                        </div>
                    </div>
                    <div className={`${glassEffect} rounded-xl ${boxShadow} overflow-hidden h-[calc(100%-2.5rem)]`}>
                        <MapContainer
                            center={[20.5937, 78.9629]}
                            zoom={5}
                            style={{ height: '100%', width: '100%' }}
                            className="z-0"
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            {locationData.map(caseItem => (
                                <Marker
                                    key={caseItem.id}
                                    position={caseItem.location}
                                    icon={customIcon}
                                >

                                    <Popup>
                                        <Link to={`/cases/${caseItem.id}`} className="cursor-pointer">
                                            <div className="">
                                                <h3 className="text-lg font-bold">{caseItem.title}</h3>
                                                <span className="text-md text-gray-600">{caseItem.type}</span><br />
                                                <span className="text-sm text-gray-600">{caseItem.location_name}</span><br />
                                                <span className="text-sm text-gray-600">Last activity: {caseItem.latest_activity}</span>
                                            </div>
                                        </Link>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Analysis;