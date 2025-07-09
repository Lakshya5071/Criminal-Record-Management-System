import React from 'react';
import {
    RequiredField,
    DocumentInput,
    PersonInput,
    CASE_TYPES,
    CASE_STATUSES,
    INCIDENT_STATUSES,
    PROCEEDING_TYPES,
    AUTHORITY_TYPES,
    COURT_TYPES,
    SENTENCE_TYPES,
    COMPLIANCE_STATUSES,
    SUPERVISION_LEVELS,
    REHABILITATION_STATUSES,
    APPEAL_STATUSES
} from './CaseFormComponents';

export const renderCaseForm = ({
    caseData,
    handleInputChange,
    handleSubmit,
    isEdit,
    addArrayItem,
    removeArrayItem
}) => {
    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Case Information */}
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">Basic Case Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Case Name
                            <RequiredField />
                        </label>
                        <input
                            type="text"
                            name="case_name"
                            value={caseData.case_name || ''}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Case Type
                            <RequiredField />
                        </label>
                        <select
                            name="case_type"
                            value={caseData.case_type || ''}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                        >
                            <option value="">Select Case Type</option>
                            {CASE_TYPES.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                            <RequiredField />
                        </label>
                        <select
                            name="case_status"
                            value={caseData.case_status || ''}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                        >
                            <option value="">Select Status</option>
                            {CASE_STATUSES.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Filing Date
                            <RequiredField />
                        </label>
                        <input
                            type="date"
                            name="case_date_filed"
                            value={caseData.case_date_filed || ''}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Closed Date
                        </label>
                        <input
                            type="date"
                            name="case_date_closed"
                            value={caseData.case_date_closed || ''}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                            <RequiredField />
                        </label>
                        <textarea
                            name="case_description"
                            value={caseData.case_description || ''}
                            onChange={handleInputChange}
                            rows={4}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                        />
                    </div>
                </div>
            </div>

            {/* Investigating Authorities Section */}
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900">Investigating Authorities</h2>
                {(caseData.investigating_authorities || []).map((auth, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-medium text-gray-900">Authority {index + 1}</h3>
                            <button
                                type="button"
                                onClick={() => removeArrayItem('investigating_authorities', index)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                                Remove Authority
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Authority Name
                                    <RequiredField />
                                </label>
                                <input
                                    type="text"
                                    name="authority_name"
                                    value={auth.authority?.authority_name || ''}
                                    onChange={(e) => handleInputChange(e, 'investigating_authorities', index, 'authority')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Authority Type
                                    <RequiredField />
                                </label>
                                <select
                                    name="authority_type"
                                    value={auth.authority?.authority_type || ''}
                                    onChange={(e) => handleInputChange(e, 'investigating_authorities', index, 'authority')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                >
                                    <option value="">Select Type</option>
                                    {AUTHORITY_TYPES.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Global ID
                                    <RequiredField />
                                </label>
                                <input
                                    type="text"
                                    name="global_id"
                                    value={auth.authority?.global_id || ''}
                                    onChange={(e) => handleInputChange(e, 'investigating_authorities', index, 'authority')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date From
                                    <RequiredField />
                                </label>
                                <input
                                    type="date"
                                    name="date_from"
                                    value={auth.date_from?.split('T')[0] || ''}
                                    onChange={(e) => handleInputChange(e, 'investigating_authorities', index)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date To
                                </label>
                                <input
                                    type="date"
                                    name="date_to"
                                    value={auth.date_to?.split('T')[0] || ''}
                                    onChange={(e) => handleInputChange(e, 'investigating_authorities', index)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={() => addArrayItem('investigating_authorities', undefined, undefined, { authority: {} })}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Add Authority
                </button>
            </div>

            {/* Incidents Section */}
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900">Incidents</h2>
                {(caseData.incidents || []).map((incident, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-medium text-gray-900">Incident {index + 1}</h3>
                            <button
                                type="button"
                                onClick={() => removeArrayItem('incidents', index)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                                Remove Incident
                            </button>
                        </div>

                        {/* Basic Incident Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Incident Report ID
                                    <RequiredField />
                                </label>
                                <input
                                    type="text"
                                    name="incident_report_id"
                                    value={incident.incident_report_id || ''}
                                    onChange={(e) => handleInputChange(e, 'incidents', index)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                />
                            </div> */}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Investigation Status
                                    <RequiredField />
                                </label>
                                <select
                                    name="incident_status"
                                    value={incident.incident_status || ''}
                                    onChange={(e) => handleInputChange(e, 'incidents', index)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                >
                                    <option value="">Select Status</option>
                                    {INCIDENT_STATUSES.map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Location
                                    <RequiredField />
                                </label>
                                <input
                                    type="text"
                                    name="incident_location"
                                    value={incident.incident_location || ''}
                                    onChange={(e) => handleInputChange(e, 'incidents', index)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date From
                                    <RequiredField />
                                </label>
                                <input
                                    type="date"
                                    name="incident_date_from"
                                    value={incident.incident_date_from || ''}
                                    onChange={(e) => handleInputChange(e, 'incidents', index)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date To
                                    <RequiredField />
                                </label>
                                <input
                                    type="date"
                                    name="incident_date_to"
                                    value={incident.incident_date_to || ''}
                                    onChange={(e) => handleInputChange(e, 'incidents', index)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Latitude
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        name="latitude"
                                        value={incident.latitude || ''}
                                        onChange={(e) => handleInputChange(e, 'incidents', index)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        placeholder="e.g., 12.9716"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Longitude
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        name="longitude"
                                        value={incident.longitude || ''}
                                        onChange={(e) => handleInputChange(e, 'incidents', index)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        placeholder="e.g., 77.5946"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Incident Report Document */}
                        <div className="border-t border-gray-200 pt-6">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Incident Report</h4>
                            <DocumentInput
                                document={incident.report || {}}
                                onChange={(e) => handleInputChange(e, 'incidents', index, 'report')}
                                label="Incident Report"
                                required={true}
                            />
                        </div>

                        {/* Victims Section */}
                        <div className="border-t border-gray-200 pt-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <h4 className="text-lg font-medium text-gray-900">Victims</h4>
                                <button
                                    type="button"
                                    onClick={() => addArrayItem('incidents', index, 'victims', { person: {}, comments: '' })}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    Add Victim
                                </button>
                            </div>
                            {(incident.victims || []).map((victim, victimIndex) => (
                                <div key={victimIndex} className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-md">
                                    <PersonInput
                                        person={victim.person || {}}
                                        onChange={(e) => handleInputChange(e, 'incidents', index, `victims.${victimIndex}.person`)}
                                        label={`Victim ${victimIndex + 1}`}
                                        required={true}
                                    />
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Comments
                                        </label>
                                        <textarea
                                            name="comments"
                                            value={victim.comments || ''}
                                            onChange={(e) => handleInputChange(e, 'incidents', index, `victims.${victimIndex}`)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            rows={3}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeArrayItem('incidents', index, 'victims', victimIndex)}
                                        className="mt-4 text-sm font-medium text-red-600 hover:text-red-800"
                                    >
                                        Remove Victim
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Witnesses Section */}
                        <div className="border-t border-gray-200 pt-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <h4 className="text-lg font-medium text-gray-900">Witnesses</h4>
                                <button
                                    type="button"
                                    onClick={() => addArrayItem('incidents', index, 'witnesses', {
                                        person: {
                                            person_name: '',
                                            aadhaar_number: '',
                                            phone_number: '',
                                            person_address: '',
                                            person_gender: 'MALE', // Default value
                                            person_dob: ''
                                        },
                                        comments: ''
                                    })}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                                >
                                    Add Witness
                                </button>
                            </div>
                            {(incident.witnesses || []).map((witness, witnessIndex) => (
                                <div key={witnessIndex} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-md">
                                    <PersonInput
                                        person={witness.person || {}}
                                        onChange={(e) => handleInputChange(e, 'incidents', index, `witnesses.${witnessIndex}.person`)}
                                        label={`Witness ${witnessIndex + 1}`}
                                        required={true}
                                    />
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Comments
                                        </label>
                                        <textarea
                                            name="comments"
                                            value={witness.comments || ''}
                                            onChange={(e) => handleInputChange(e, 'incidents', index, `witnesses.${witnessIndex}`)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            rows={3}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeArrayItem('incidents', index, 'witnesses', witnessIndex)}
                                        className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-800"
                                    >
                                        Remove Witness
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Add Incident Button */}
                <button
                    type="button"
                    onClick={() => addArrayItem('incidents')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Add Incident
                </button>
            </div>

            {/* Evidences Section */}
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900">Evidences</h2>
                {(caseData.evidences || []).map((evidence, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-medium text-gray-900">Evidence {index + 1}</h3>
                            <button
                                type="button"
                                onClick={() => removeArrayItem('evidences', index)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                                Remove Evidence
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Evidence Name
                                    <RequiredField />
                                </label>
                                <input
                                    type="text"
                                    name="evidence_name"
                                    value={evidence.evidence_name || ''}
                                    onChange={(e) => handleInputChange(e, 'evidences', index)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Location Found
                                    <RequiredField />
                                </label>
                                <input
                                    type="text"
                                    name="evidence_location"
                                    value={evidence.evidence_location || ''}
                                    onChange={(e) => handleInputChange(e, 'evidences', index)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date Found
                                    <RequiredField />
                                </label>
                                <input
                                    type="date"
                                    name="evidence_date_found"
                                    value={evidence.evidence_date_found || ''}
                                    onChange={(e) => handleInputChange(e, 'evidences', index)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                    <RequiredField />
                                </label>
                                <textarea
                                    name="evidence_description"
                                    value={evidence.evidence_description || ''}
                                    onChange={(e) => handleInputChange(e, 'evidences', index)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    rows={3}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={() => addArrayItem('evidences')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Add Evidence
                </button>
            </div>

            {/* Sentences Section */}
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900">Sentences</h2>
                {(caseData.sentences || []).map((sentence, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-medium text-gray-900">Sentence {index + 1}</h3>
                            <button
                                type="button"
                                onClick={() => removeArrayItem('sentences', index)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                                Remove Sentence
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Sentence Type
                                    <RequiredField />
                                </label>
                                <select
                                    name="sentence_type"
                                    value={sentence.sentence_type || ''}
                                    onChange={(e) => handleInputChange(e, 'sentences', index)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                >
                                    <option value="">Select Type</option>
                                    {SENTENCE_TYPES.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Duration (days)
                                    <RequiredField />
                                </label>
                                <input
                                    type="number"
                                    name="sentence_duration"
                                    value={sentence.sentence_duration || ''}
                                    onChange={(e) => handleInputChange(e, 'sentences', index)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Sentence Date
                                    <RequiredField />
                                </label>
                                <input
                                    type="date"
                                    name="sentence_date"
                                    value={sentence.sentence_date?.split('T')[0] || ''}
                                    onChange={(e) => handleInputChange(e, 'sentences', index)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                />
                            </div>
                        </div>

                        {/* Sentenced People Section */}
                        <div className="border-t border-gray-200 pt-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <h4 className="text-lg font-medium text-gray-900">Sentenced People</h4>
                                <button
                                    type="button"
                                    onClick={() => addArrayItem('sentences', index, 'sentenced_people', {
                                        person: {},
                                        compliance_status: 'PENDING',
                                        compliance_notes: '',
                                        supervision_level: 'MEDIUM',
                                        rehabilitation_status: 'NOT_STARTED',
                                        appeal_status: 'NONE'
                                    })}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                                >
                                    Add Sentenced Person
                                </button>
                            </div>
                            {(sentence.sentenced_people || []).map((person, personIndex) => (
                                <div key={personIndex} className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded-r-md space-y-4">
                                    <PersonInput
                                        person={person.person || {}}
                                        onChange={(e) => handleInputChange(e, 'sentences', index, `sentenced_people.${personIndex}.person`)}
                                        label={`Sentenced Person ${personIndex + 1}`}
                                        required={true}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Compliance Status
                                                <RequiredField />
                                            </label>
                                            <select
                                                name="compliance_status"
                                                value={person.compliance_status || ''}
                                                onChange={(e) => handleInputChange(e, 'sentences', index, `sentenced_people.${personIndex}`)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                required
                                            >
                                                <option value="">Select Status</option>
                                                {COMPLIANCE_STATUSES.map(status => (
                                                    <option key={status} value={status}>{status}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Supervision Level
                                                <RequiredField />
                                            </label>
                                            <select
                                                name="supervision_level"
                                                value={person.supervision_level || ''}
                                                onChange={(e) => handleInputChange(e, 'sentences', index, `sentenced_people.${personIndex}`)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                required
                                            >
                                                <option value="">Select Level</option>
                                                {SUPERVISION_LEVELS.map(level => (
                                                    <option key={level} value={level}>{level}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Rehabilitation Status
                                                <RequiredField />
                                            </label>
                                            <select
                                                name="rehabilitation_status"
                                                value={person.rehabilitation_status || ''}
                                                onChange={(e) => handleInputChange(e, 'sentences', index, `sentenced_people.${personIndex}`)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                required
                                            >
                                                <option value="">Select Status</option>
                                                {REHABILITATION_STATUSES.map(status => (
                                                    <option key={status} value={status}>{status}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Appeal Status
                                                <RequiredField />
                                            </label>
                                            <select
                                                name="appeal_status"
                                                value={person.appeal_status || ''}
                                                onChange={(e) => handleInputChange(e, 'sentences', index, `sentenced_people.${personIndex}`)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                required
                                            >
                                                <option value="">Select Status</option>
                                                {APPEAL_STATUSES.map(status => (
                                                    <option key={status} value={status}>{status}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Compliance Notes
                                            </label>
                                            <textarea
                                                name="compliance_notes"
                                                value={person.compliance_notes || ''}
                                                onChange={(e) => handleInputChange(e, 'sentences', index, `sentenced_people.${personIndex}`)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                rows={3}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => removeArrayItem('sentences', index, 'sentenced_people', personIndex)}
                                        className="mt-4 text-sm font-medium text-red-600 hover:text-red-800"
                                    >
                                        Remove Person
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={() => addArrayItem('sentences')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Add Sentence
                </button>
            </div>

            {/* Proceedings Section */}
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900">Proceedings</h2>
                {(caseData.proceedings || []).map((proceeding, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-medium text-gray-900">Proceeding {index + 1}</h3>
                            <button
                                type="button"
                                onClick={() => removeArrayItem('proceedings', index)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                                Remove Proceeding
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Proceeding Type
                                    <RequiredField />
                                </label>
                                <select
                                    name="proceeding_type"
                                    value={proceeding.proceeding_type || ''}
                                    onChange={(e) => handleInputChange(e, 'proceedings', index)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                >
                                    <option value="">Select Type</option>
                                    {PROCEEDING_TYPES.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Proceeding Status
                                    <RequiredField />
                                </label>
                                <select
                                    name="proceeding_status"
                                    value={proceeding.proceeding_status || ''}
                                    onChange={(e) => handleInputChange(e, 'proceedings', index)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                >
                                    <option value="">Select Status</option>
                                    <option value="SCHEDULED">SCHEDULED</option>
                                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                                    <option value="COMPLETED">COMPLETED</option>
                                    <option value="ADJOURNED">ADJOURNED</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date Started
                                    <RequiredField />
                                </label>
                                <input
                                    type="date"
                                    name="date_started"
                                    value={proceeding.date_started?.split('T')[0] || ''}
                                    onChange={(e) => handleInputChange(e, 'proceedings', index)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date Ended
                                </label>
                                <input
                                    type="date"
                                    name="date_ended"
                                    value={proceeding.date_ended?.split('T')[0] || ''}
                                    onChange={(e) => handleInputChange(e, 'proceedings', index)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Proceeding Notes
                                    <RequiredField />
                                </label>
                                <textarea
                                    name="proceeding_notes"
                                    value={proceeding.proceeding_notes || ''}
                                    onChange={(e) => handleInputChange(e, 'proceedings', index)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    rows={3}
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Presiding Officers
                                    <RequiredField />
                                </label>
                                <input
                                    type="text"
                                    name="presiding_officers"
                                    value={proceeding.presiding_officers || ''}
                                    onChange={(e) => handleInputChange(e, 'proceedings', index)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                />
                            </div>
                        </div>

                        {/* Court Authority */}
                        <div className="border-t border-gray-200 pt-6">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Court Authority</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Authority Name
                                        <RequiredField />
                                    </label>
                                    <input
                                        type="text"
                                        name="authority_name"
                                        value={proceeding.court_authority?.authority_name || ''}
                                        onChange={(e) => handleInputChange(e, 'proceedings', index, 'court_authority')}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Authority Type
                                        <RequiredField />
                                    </label>
                                    <select
                                        name="authority_type"
                                        value={proceeding.court_authority?.authority_type || ''}
                                        onChange={(e) => handleInputChange(e, 'proceedings', index, 'court_authority')}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        required
                                    >
                                        <option value="">Select Type</option>
                                        {COURT_TYPES.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Global ID
                                        <RequiredField />
                                    </label>
                                    <input
                                        type="text"
                                        name="global_id"
                                        value={proceeding.court_authority?.global_id || ''}
                                        onChange={(e) => handleInputChange(e, 'proceedings', index, 'court_authority')}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Judge Details */}
                        <div className="border-t border-gray-200 pt-6">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Judge</h4>
                            <PersonInput
                                person={proceeding.judge || {}}
                                onChange={(e) => handleInputChange(e, 'proceedings', index, 'judge')}
                                label="Judge Details"
                                required={true}
                            />
                        </div>

                        {/* Transcript */}
                        <div className="border-t border-gray-200 pt-6">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Transcript</h4>
                            <DocumentInput
                                document={proceeding.transcript || {}}
                                onChange={(e) => handleInputChange(e, 'proceedings', index, 'transcript')}
                                label="Proceeding Transcript"
                                required={true}
                            />
                        </div>

                        {/* Advocates Sections */}
                        <div className="space-y-6">
                            {/* Prosecution Advocates */}
                            <div className="border-t border-gray-200 pt-6 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-lg font-medium text-gray-900">Prosecution Advocates</h4>
                                    <button
                                        type="button"
                                        onClick={() => addArrayItem('proceedings', index, 'prosecution_advocates', { person: {} })}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                        Add Prosecution Advocate
                                    </button>
                                </div>
                                {(proceeding.prosecution_advocates || []).map((advocate, advocateIndex) => (
                                    <div key={advocateIndex} className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-md">
                                        <PersonInput
                                            person={advocate.person || {}}
                                            onChange={(e) => handleInputChange(e, 'proceedings', index, `prosecution_advocates.${advocateIndex}.person`)}
                                            label={`Prosecution Advocate ${advocateIndex + 1}`}
                                            required={true}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeArrayItem('proceedings', index, 'prosecution_advocates', advocateIndex)}
                                            className="mt-4 text-sm font-medium text-red-600 hover:text-red-800"
                                        >
                                            Remove Advocate
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Defense Advocates */}
                            <div className="border-t border-gray-200 pt-6 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-lg font-medium text-gray-900">Defendant Advocates</h4>
                                    <button
                                        type="button"
                                        onClick={() => addArrayItem('proceedings', index, 'defendant_advocates', {})}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    >
                                        Add Advocate
                                    </button>
                                </div>
                                {(proceeding.defendant_advocates || []).map((advocate, advocateIndex) => (
                                    <div key={advocateIndex} className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-md">
                                        <PersonInput
                                            person={advocate || {}}
                                            onChange={(e) => handleInputChange(e, 'proceedings', index, `defendant_advocates.${advocateIndex}`)}
                                            label={`Defendant Advocate ${advocateIndex + 1}`}
                                            required={true}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeArrayItem('proceedings', index, 'defendant_advocates', advocateIndex)}
                                            className="mt-4 text-sm font-medium text-red-600 hover:text-red-800"
                                        >
                                            Remove Advocate
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Plaintiff Advocates */}
                            <div className="border-t border-gray-200 pt-6 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-lg font-medium text-gray-900">Plaintiff Advocates</h4>
                                    <button
                                        type="button"
                                        onClick={() => addArrayItem('proceedings', index, 'plaintiff_advocates', {})}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                        Add Advocate
                                    </button>
                                </div>
                                {(proceeding.plaintiff_advocates || []).map((advocate, advocateIndex) => (
                                    <div key={advocateIndex} className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-md">
                                        <PersonInput
                                            person={advocate || {}}
                                            onChange={(e) => handleInputChange(e, 'proceedings', index, `plaintiff_advocates.${advocateIndex}`)}
                                            label={`Plaintiff Advocate ${advocateIndex + 1}`}
                                            required={true}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeArrayItem('proceedings', index, 'plaintiff_advocates', advocateIndex)}
                                            className="mt-4 text-sm font-medium text-red-600 hover:text-red-800"
                                        >
                                            Remove Advocate
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Defendants */}
                            <div className="border-t border-gray-200 pt-6 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-lg font-medium text-gray-900">Defendants</h4>
                                    <button
                                        type="button"
                                        onClick={() => addArrayItem('proceedings', index, 'defendants', {})}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    >
                                        Add Defendant
                                    </button>
                                </div>
                                {(proceeding.defendants || []).map((defendant, defendantIndex) => (
                                    <div key={defendantIndex} className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-md">
                                        <PersonInput
                                            person={defendant || {}}
                                            onChange={(e) => handleInputChange(e, 'proceedings', index, `defendants.${defendantIndex}`)}
                                            label={`Defendant ${defendantIndex + 1}`}
                                            required={true}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeArrayItem('proceedings', index, 'defendants', defendantIndex)}
                                            className="mt-4 text-sm font-medium text-red-600 hover:text-red-800"
                                        >
                                            Remove Defendant
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Other Documents */}
                        <div className="border-t border-gray-200 pt-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <h4 className="text-lg font-medium text-gray-900">Other Documents</h4>
                                <button
                                    type="button"
                                    onClick={() => addArrayItem('proceedings', index, 'other_documents', {})}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    Add Document
                                </button>
                            </div>
                            {(proceeding.other_documents || []).map((doc, docIndex) => (
                                <div key={docIndex} className="border-l-4 border-gray-500 bg-gray-50 p-4 rounded-r-md">
                                    <DocumentInput
                                        document={doc || {}}
                                        onChange={(e) => handleInputChange(e, 'proceedings', index, `other_documents.${docIndex}`)}
                                        label={`Document ${docIndex + 1}`}
                                        required={true}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeArrayItem('proceedings', index, 'other_documents', docIndex)}
                                        className="mt-4 text-sm font-medium text-red-600 hover:text-red-800"
                                    >
                                        Remove Document
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Plaintiffs */}
                        <div className="border-t border-gray-200 pt-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <h4 className="text-lg font-medium text-gray-900">Plaintiffs</h4>
                                <button
                                    type="button"
                                    onClick={() => addArrayItem('proceedings', index, 'plaintiffs', {})}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    Add Plaintiff
                                </button>
                            </div>
                            {(proceeding.plaintiffs || []).map((plaintiff, plaintiffIndex) => (
                                <div key={plaintiffIndex} className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-md">
                                    <PersonInput
                                        person={plaintiff || {}}
                                        onChange={(e) => handleInputChange(e, 'proceedings', index, `plaintiffs.${plaintiffIndex}`)}
                                        label={`Plaintiff ${plaintiffIndex + 1}`}
                                        required={true}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeArrayItem('proceedings', index, 'plaintiffs', plaintiffIndex)}
                                        className="mt-4 text-sm font-medium text-red-600 hover:text-red-800"
                                    >
                                        Remove Plaintiff
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={() => addArrayItem('proceedings')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Add Proceeding
                </button>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end mt-6">
                <button
                    type="submit"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    {isEdit ? 'Update Case' : 'Create Case'}
                </button>
            </div>
        </form>
    );
};