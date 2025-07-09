import React, { useState, useEffect, useCallback, act } from 'react';
import { Tabs } from 'flowbite-react';
import { toast } from 'react-hot-toast';
import { useLocation } from 'react-router';
import { renderCaseForm } from './CaseFormRenderer';
import { RequiredField } from './CaseFormComponents';
import debounce from 'lodash/debounce';

function Admin() {
    const [newCaseData, setNewCaseData] = useState(getInitialCaseState());
    const [editCaseData, setEditCaseData] = useState(getInitialCaseState());
    const [caseId, setCaseId] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('create');
    const [adminToken, setAdminToken] = useState(() => {
        // Try to get token from sessionStorage on initial load
        return sessionStorage.getItem('adminToken') || '';
    });
    const [isTokenValid, setIsTokenValid] = useState(false);
    const [validatingToken, setValidatingToken] = useState(false);

    const location = useLocation();

    // Verify token on initial load if it exists in sessionStorage
    useEffect(() => {
        if (adminToken) {
            verifyToken(adminToken);
        }
    }, []);

    // Cleanup effect when component unmounts
    useEffect(() => {
        return () => {
            // Reset all state when component unmounts
            setActiveTab('create');
            setCaseId('');
            setLoading(false);
            setNewCaseData(getInitialCaseState());
            setEditCaseData(getInitialCaseState());
        };
    }, [location.pathname]);

    // Helper function to get initial case state
    function getInitialCaseState() {
        return {
            case_name: '',
            case_status: 'PENDING',
            case_type: 'CRIMINAL',
            case_description: '',
            case_date_filed: new Date().toISOString().split('T')[0],
            case_date_closed: null,
            incident_id: null,
            sentence_id: null,
            incidents: [{
                incident_report_id: '',
                incident_date_from: '',
                incident_date_to: '',
                incident_location: '',
                incident_status: 'PENDING',
                latitude: null,
                longitude: null,
                victims: [],
                witnesses: [],
                report: {
                    document_name: '',
                    document_type: 'FIR',
                    document_date: '',
                    document_content_url: ''
                }
            }],
            evidences: [{
                evidence_name: '',
                evidence_description: '',
                evidence_date_found: '',
                evidence_location: ''
            }],
            sentences: [],
            investigating_authorities: [],
            proceedings: []
        };
    }

    // Updated handleInputChange to use the correct state setter and handle nested fields properly
    const handleInputChange = (e, arrayName = null, index = null, nestedField = null) => {
        const { name, value } = e.target;
        const setStateFunction = activeTab === 'create' ? setNewCaseData : setEditCaseData;

        setStateFunction(prev => {
            // Deep clone to avoid direct state mutations
            const newState = JSON.parse(JSON.stringify(prev));

            if (arrayName && index !== null) {
                if (!nestedField) {
                    // Direct array item field
                    if (newState[arrayName] && newState[arrayName][index]) {
                        newState[arrayName][index][name] = value;
                    }
                } else {
                    // Nested field (like victims.0.person)
                    const parts = nestedField.split('.');
                    if (parts.length === 1) {
                        // Simple nesting (e.g., 'report', 'authority')
                        if (!newState[arrayName][index][parts[0]]) {
                            newState[arrayName][index][parts[0]] = {};
                        }
                        newState[arrayName][index][parts[0]][name] = value;
                    } else {
                        // Complex nesting (e.g., 'victims.0.person')
                        let target = newState[arrayName][index];
                        for (let i = 0; i < parts.length - 1; i++) {
                            const part = parts[i];
                            const nextPart = parts[i + 1];

                            // If the part contains a number (array index)
                            if (part.includes('.')) {
                                const [arrayKey, arrayIndex] = part.split('.');
                                if (!target[arrayKey]) target[arrayKey] = [];
                                if (!target[arrayKey][parseInt(arrayIndex)]) {
                                    target[arrayKey][parseInt(arrayIndex)] = {};
                                }
                                target = target[arrayKey][parseInt(arrayIndex)];
                            } else {
                                // For nested objects
                                if (!target[part]) {
                                    if (nextPart && !isNaN(parseInt(nextPart))) {
                                        target[part] = [];
                                    } else {
                                        target[part] = {};
                                    }
                                }
                                target = target[part];
                            }
                        }

                        // Set the value at the final nested level
                        const lastPart = parts[parts.length - 1];
                        if (lastPart.includes('.')) {
                            const [arrayKey, arrayIndex] = lastPart.split('.');
                            if (!target[arrayKey]) target[arrayKey] = [];
                            if (!target[arrayKey][parseInt(arrayIndex)]) {
                                target[arrayKey][parseInt(arrayIndex)] = {};
                            }
                            target[arrayKey][parseInt(arrayIndex)][name] = value;
                        } else {
                            if (!target[lastPart]) target[lastPart] = {};
                            target[lastPart][name] = value;
                        }
                    }
                }
            } else {
                // Root level field
                newState[name] = value;
            }

            return newState;
        });
    };

    // Updated addArrayItem function to handle nested arrays
    const addArrayItem = (arrayName, parentIndex = null, childArrayName = null, defaultItem = {}) => {
        const setStateFunction = activeTab === 'create' ? setNewCaseData : setEditCaseData;

        setStateFunction(prev => {
            const newState = JSON.parse(JSON.stringify(prev));

            // Ensure new items don't have an ID
            const newItem = { ...defaultItem, id: null };

            if (parentIndex !== null && childArrayName) {
                if (!newState[arrayName][parentIndex][childArrayName]) {
                    newState[arrayName][parentIndex][childArrayName] = [];
                }
                newState[arrayName][parentIndex][childArrayName].push(newItem);
            } else {
                if (!newState[arrayName]) {
                    newState[arrayName] = [];
                }
                newState[arrayName].push(newItem);
            }
            return newState;
        });
    };

    // Updated removeArrayItem function to handle nested arrays
    const removeArrayItem = (arrayName, parentIndex = null, childArrayName = null, childIndex = null) => {
        const setStateFunction = activeTab === 'create' ? setNewCaseData : setEditCaseData;

        setStateFunction(prev => {
            const newState = JSON.parse(JSON.stringify(prev));

            if (parentIndex !== null && childArrayName && childIndex !== null) {
                // Removing from a nested array
                newState[arrayName][parentIndex][childArrayName] =
                    newState[arrayName][parentIndex][childArrayName].filter((_, i) => i !== childIndex);
            } else {
                // Removing from a root level array
                newState[arrayName] = newState[arrayName].filter((_, i) => i !== parentIndex);
            }
            return newState;
        });
    };

    // Update the getApiUrl function to handle non-admin endpoints
    const getApiUrl = (endpoint, requiresAdmin = true) => {
        const baseUrl = `http://${import.meta.env.VITE_BACKEND_URL}${requiresAdmin ? '/admin' : ''}${endpoint}`;
        return requiresAdmin ? `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}admin_token=${adminToken}` : baseUrl;
    };

    // Update the handleFetchCase function
    const handleFetchCase = async () => {
        if (!caseId) {
            toast.error('Please enter a case ID');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(getApiUrl(`/cases/${caseId}`, false));

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Transform the data to match our form structure while preserving IDs
            const transformedCase = {
                ...data.case,
                incidents: data.case.incidents.map(incident => ({
                    ...incident,
                    id: incident.id, // Preserve incident ID
                    victims: incident.victims.map(victim => ({
                        id: victim.id, // Preserve victim ID
                        person: {
                            id: victim.id, // Person ID is same as victim ID in this case
                            person_name: victim.person_name,
                            aadhaar_number: victim.aadhaar_number,
                            phone_number: victim.phone_number,
                            person_address: victim.person_address,
                            person_gender: victim.person_gender,
                            person_dob: victim.person_dob?.split('T')[0] || '',
                        },
                        comments: victim.comments
                    })),
                    witnesses: incident.witnesses.map(witness => ({
                        id: witness.id, // Preserve witness ID
                        person: {
                            id: witness.id, // Person ID is same as witness ID in this case
                            person_name: witness.person_name,
                            aadhaar_number: witness.aadhaar_number,
                            phone_number: witness.phone_number,
                            person_address: witness.person_address,
                            person_gender: witness.person_gender,
                            person_dob: witness.person_dob?.split('T')[0] || '',
                        },
                        comments: witness.comments
                    })),
                    incident_date_from: incident.incident_date_from?.split('T')[0] || '',
                    incident_date_to: incident.incident_date_to?.split('T')[0] || '',
                    report: {
                        ...incident.report,
                        document_date: incident.report?.document_date?.split('T')[0] || ''
                    }
                })),
                case_date_filed: data.case.case_date_filed?.split('T')[0] || '',
                case_date_closed: data.case.case_date_closed?.split('T')[0] || '',
                evidences: (data.case.evidences || []).map(evidence => ({
                    ...evidence,
                    evidence_date_found: evidence.evidence_date_found?.split('T')[0] || ''
                })),
                sentences: (data.case.sentences || []).map(sentence => ({
                    ...sentence,
                    sentence_date: sentence.sentence_date?.split('T')[0] || '',
                    sentenced_people: sentence.sentenced_people.map(person => ({
                        ...person,
                        person: {
                            ...person.person,
                            person_dob: person.person.person_dob?.split('T')[0] || ''
                        }
                    }))
                })),
                investigating_authorities: (data.case.investigating_authorities || []).map(auth => ({
                    ...auth,
                    date_from: auth.date_from?.split('T')[0] || '',
                    date_to: auth.date_to?.split('T')[0] || ''
                })),
                proceedings: (data.case.proceedings || []).map(proc => ({
                    ...proc,
                    date_started: proc.date_started?.split('T')[0] || '',
                    date_ended: proc.date_ended?.split('T')[0] || '',
                    transcript: proc.transcript ? {
                        ...proc.transcript,
                        document_date: proc.transcript.document_date?.split('T')[0] || ''
                    } : null,
                    judge: proc.judge ? {
                        ...proc.judge,
                        person_dob: proc.judge.person_dob?.split('T')[0] || ''
                    } : null,
                    defendants: (proc.defendants || []).map(def => ({
                        ...def,
                        person_dob: def.person_dob?.split('T')[0] || ''
                    })),
                    plaintiffs: (proc.plaintiffs || []).map(plt => ({
                        ...plt,
                        person_dob: plt.person_dob?.split('T')[0] || ''
                    })),
                    defendant_advocates: (proc.defendant_advocates || []).map(adv => ({
                        ...adv,
                        person_dob: adv.person_dob?.split('T')[0] || ''
                    })),
                    plaintiff_advocates: (proc.plaintiff_advocates || []).map(adv => ({
                        ...adv,
                        person_dob: adv.person_dob?.split('T')[0] || ''
                    }))
                }))
            };

            console.log('Transformed case data:', transformedCase);
            setEditCaseData(transformedCase);
            toast.success('Case details loaded successfully');
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to fetch case details');
        } finally {
            setLoading(false);
        }
    };

    // Updated submit handlers

    const handleCreateCase = async (e) => {
        e.preventDefault();
        if (!adminToken) {
            toast.error('Admin token is required');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(getApiUrl('/cases'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Wrap newCaseData under 'case' field
                body: JSON.stringify({ case: newCaseData })
            });
            const data = await response.json();

            if (response.ok) {
                toast.success('Case created successfully');
                setNewCaseData(getInitialCaseState()); // Reset form
            } else {
                toast.error(data.message || 'Error creating case');
            }
        } catch (error) {
            toast.error('Error creating case');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditCase = async (e) => {
        e.preventDefault();
        if (!adminToken) {
            toast.error('Admin token is required');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(getApiUrl(`/cases/${caseId}`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                // Wrap editCaseData under 'case' field
                body: JSON.stringify({ case: editCaseData })
            });
            const data = await response.json();

            if (response.ok) {
                toast.success('Case updated successfully');
            } else {
                toast.error(data.message || 'Error updating case');
            }
        } catch (error) {
            toast.error('Error updating case');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // ... rest of the code ...
    const handleDeleteCase = async (e) => {
        e.preventDefault();
        if (!adminToken) {
            toast.error('Admin token is required');
            return;
        }
        if (!caseId) {
            toast.error('Please enter a case ID');
            return;
        }

        if (!window.confirm('Are you sure you want to delete this case?')) {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(getApiUrl(`/cases/${caseId}`), {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            toast.success('Case deleted successfully!');
            setCaseId('');
            setEditCaseData(getInitialCaseState());
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to delete case');
        } finally {
            setLoading(false);
        }
    };

    // Verify token validity
    const verifyToken = async (token) => {
        if (!token) {
            setIsTokenValid(false);
            sessionStorage.removeItem('adminToken');
            return;
        }

        setValidatingToken(true);
        try {
            const response = await fetch(
                `http://${import.meta.env.VITE_BACKEND_URL}/admin/verify-token?admin_token=${token}`
            );
            const data = await response.json();
            setIsTokenValid(data.isValid);

            // Store token in sessionStorage only if valid
            if (data.isValid) {
                sessionStorage.setItem('adminToken', token);
            } else {
                sessionStorage.removeItem('adminToken');
            }
        } catch (error) {
            console.error('Error verifying token:', error);
            setIsTokenValid(false);
            sessionStorage.removeItem('adminToken');
            toast.error('Error verifying admin token');
        } finally {
            setValidatingToken(false);
        }
    };

    // Debounced version of verifyToken for onChange
    const debouncedVerify = useCallback(
        debounce((token) => verifyToken(token), 500),
        []
    );

    // Handle token input change
    const handleTokenChange = (e) => {
        const newToken = e.target.value;
        setAdminToken(newToken);
        debouncedVerify(newToken);
    };

    // Handle token input blur
    const handleTokenBlur = () => {
        verifyToken(adminToken);
    };

    // Update the tab selection logic
    const handleTabSelect = (tab) => {
        console.log("Tab", tab)
        switch (tab) {
            case 0:
                setActiveTab('create');
                break;
            case 1:
                setActiveTab('edit');
                break;
            case 2:
                setActiveTab('delete');
                break;
            default:
                setActiveTab('create');
        }
    };

    useEffect(() => {
        console.log("Current Active Tab: ", activeTab)
    }, [activeTab])

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-3xl font-semibold text-gray-900">Case Management System</h1>
                    <p className="mt-2 text-sm text-gray-600">Administrative interface for case management</p>
                </div>

                {/* Admin Token Input */}
                <div className="mb-8 bg-white rounded-lg shadow p-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Admin Token
                        <RequiredField />
                    </label>
                    <div className="relative">
                        <input
                            type="password"
                            value={adminToken}
                            onChange={handleTokenChange}
                            onBlur={handleTokenBlur}
                            placeholder="Enter your admin token"
                            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${isTokenValid
                                ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                                : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                                }`}
                            required
                        />
                        {validatingToken && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500"></div>
                            </span>
                        )}
                        {!validatingToken && adminToken && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2">
                                {isTokenValid ? (
                                    <span className="text-green-500">✓</span>
                                ) : (
                                    <span className="text-red-500">✗</span>
                                )}
                            </span>
                        )}
                    </div>
                    {adminToken && !isTokenValid && !validatingToken && (
                        <p className="mt-2 text-sm text-red-600">
                            Invalid admin token. Please check and try again.
                        </p>
                    )}
                </div>

                {/* Tabs Container - Only show if token is valid */}
                {isTokenValid ? (
                    <div className="bg-white rounded-lg shadow">
                        <Tabs
                            onActiveTabChange={handleTabSelect}
                            className="p-6"
                        >
                            <Tabs.Item
                                active
                                title={
                                    <span className="px-3 py-2 text-sm font-medium">
                                        Create New Case
                                    </span>
                                }
                            >
                                {renderCaseForm({
                                    caseData: newCaseData,
                                    handleInputChange,
                                    handleSubmit: handleCreateCase,
                                    isEdit: false,
                                    addArrayItem,
                                    removeArrayItem
                                })}
                            </Tabs.Item>

                            <Tabs.Item
                                title={
                                    <span className="px-3 py-2 text-sm font-medium">
                                        Edit Case
                                    </span>
                                }
                            >
                                <div className="mb-6 space-y-4">
                                    <div className="flex gap-4">
                                        <input
                                            type="text"
                                            value={caseId}
                                            onChange={(e) => setCaseId(e.target.value)}
                                            placeholder="Enter Case ID"
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        />
                                        <button
                                            onClick={handleFetchCase}
                                            disabled={loading}
                                            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                                        >
                                            {loading ? 'Loading...' : 'Load Case'}
                                        </button>
                                    </div>
                                </div>
                                {caseId && editCaseData ? (
                                    renderCaseForm({
                                        caseData: editCaseData,
                                        handleInputChange,
                                        handleSubmit: handleEditCase,
                                        isEdit: true,
                                        addArrayItem,
                                        removeArrayItem,
                                        loading
                                    })
                                ) : (
                                    <p className="text-gray-600 text-center">
                                        Please enter a Case ID and load the case to edit.
                                    </p>
                                )}
                            </Tabs.Item>

                            <Tabs.Item
                                title={
                                    <span className="px-3 py-2 text-sm font-medium">
                                        Delete Case
                                    </span>
                                }
                            >
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <input
                                            type="text"
                                            value={caseId}
                                            onChange={(e) => setCaseId(e.target.value)}
                                            placeholder="Enter Case ID"
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        />
                                        <button
                                            onClick={handleDeleteCase}
                                            disabled={loading}
                                            className="inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                                        >
                                            {loading ? 'Deleting...' : 'Delete Case'}
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-md border border-gray-200">
                                        ⚠️ Warning: This action cannot be undone. Please make sure you have the correct Case ID before proceeding.
                                    </p>
                                </div>
                            </Tabs.Item>
                        </Tabs>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <p className="text-gray-600">
                            Please enter a valid admin token to access the case management dashboard.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Admin;