import React from 'react';

// All constants
export const CASE_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CLOSED'];
export const CASE_TYPES = [
    'CRIMINAL', 'CIVIL', 'FAMILY', 'PROPERTY', 'CYBERCRIME',
    'FINANCIAL_FRAUD', 'MURDER', 'ROBBERY', 'ASSAULT',
    'DOMESTIC_VIOLENCE', 'TRAFFIC_VIOLATION', 'NARCOTICS',
    'CORRUPTION', 'TERRORISM', 'WHITE_COLLAR', 'ENVIRONMENTAL',
    'INTELLECTUAL_PROPERTY', 'LABOR_DISPUTE', 'CONSTITUTIONAL',
    'PUBLIC_INTEREST'
];
export const DOCUMENT_TYPES = ['FIR', 'ADJUNCTION', 'SENTENCE', 'OTHER'];
export const INCIDENT_STATUSES = ['PENDING', 'ACTIVE', 'COMPLETED', 'SUSPENDED', 'UNDER_INVESTIGATION'];
export const SENTENCE_TYPES = [
    'PRISON', 'LIFE_IMPRISONMENT', 'DEATH_PENALTY', 'HOUSE_ARREST',
    'PROBATION', 'PAROLE', 'COMMUNITY_SERVICE', 'FINE', 'RESTITUTION',
    'SUSPENDED_SENTENCE', 'DEFERRED_SENTENCE', 'REHABILITATION',
    'BANISHMENT', 'CORPORAL_PUNISHMENT', 'MILITARY_SERVICE', 'OTHER'
];
export const COMPLIANCE_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'VIOLATED', 'COMMUTED', 'REVOKED', 'EXPIRED'];
export const SUPERVISION_LEVELS = ['NONE', 'LOW', 'MEDIUM', 'HIGH', 'MAXIMUM'];
export const REHABILITATION_STATUSES = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'FAILED'];
export const APPEAL_STATUSES = ['NONE', 'FILED', 'APPROVED', 'DENIED', 'UNDER_REVIEW'];
export const AUTHORITY_TYPES = [
    'POLICE', 'HIGH COURT', 'SUPREME COURT', 'CBI',
    'NATIONAL CRIMINAL RECORD BUREAU', 'NON GOVERNMENTAL ORGANIZATION',
    'DISTRICT COURT', 'SPECIAL COURT'
];
export const PROCEEDING_TYPES = [
    'INVESTIGATION', 'PRELIMINARY_HEARING', 'GRAND_JURY', 'MEDIATION',
    'ARBITRATION', 'SETTLEMENT_CONFERENCE', 'TRIAL', 'BENCH_TRIAL',
    'JURY_TRIAL', 'HEARING', 'MOTION_HEARING', 'APPEAL',
    'SUPREME_COURT_REVIEW', 'SENTENCING', 'POST_CONVICTION_REVIEW',
    'PAROLE_HEARING', 'PROBATION_HEARING', 'INJUNCTION_HEARING'
];
export const COURT_TYPES = ['DISTRICT COURT', 'HIGH COURT', 'SUPREME COURT', 'SPECIAL COURT'];
export const GENDERS = ['MALE', 'FEMALE', 'OTHER'];

// Reusable Components
export const RequiredField = () => (
    <span className="text-red-500 ml-1" title="Required field">*</span>
);

export const DocumentInput = ({ document = {}, onChange, label = "Document", required = false }) => (
    <div className="space-y-4 border p-4 rounded-md">
        <h3 className="font-medium">
            {label}
            {required && <RequiredField />}
        </h3>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Document Name
                    {required && <RequiredField />}
                </label>
                <input
                    type="text"
                    name="document_name"
                    value={document.document_name || ''}
                    onChange={onChange}
                    placeholder="Document Name"
                    className="form-input"
                    required={required}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Document Type
                    {required && <RequiredField />}
                </label>
                <select
                    name="document_type"
                    value={document.document_type || ''}
                    onChange={onChange}
                    className="form-select"
                    required={required}
                >
                    <option value="">Select Document Type</option>
                    {DOCUMENT_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Document Date
                    {required && <RequiredField />}
                </label>
                <input
                    type="date"
                    name="document_date"
                    value={document.document_date || ''}
                    onChange={onChange}
                    className="form-input"
                    required={required}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Document URL
                    {required && <RequiredField />}
                </label>
                <input
                    type="url"
                    name="document_content_url"
                    value={document.document_content_url || ''}
                    onChange={onChange}
                    placeholder="https://example.com/document.pdf"
                    className="form-input"
                    required={required}
                />
            </div>
        </div>
    </div>
);

export const PersonInput = ({ person = {}, onChange, label = "Person", required = false }) => (
    <div className="space-y-4 border p-4 rounded-md">
        <h3 className="font-medium">
            {label}
            {required && <RequiredField />}
        </h3>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Name
                    {required && <RequiredField />}
                </label>
                <input
                    type="text"
                    name="person_name"
                    value={person.person_name || ''}
                    onChange={onChange}
                    className="form-input"
                    required={required}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Aadhaar Number
                </label>
                <input
                    type="text"
                    name="aadhaar_number"
                    value={person.aadhaar_number || ''}
                    onChange={onChange}
                    className="form-input"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Phone Number
                </label>
                <input
                    type="tel"
                    name="phone_number"
                    value={person.phone_number || ''}
                    onChange={onChange}
                    className="form-input"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Address
                    {required && <RequiredField />}
                </label>
                <input
                    type="text"
                    name="person_address"
                    value={person.person_address || ''}
                    onChange={onChange}
                    className="form-input"
                    required={required}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Gender
                    {required && <RequiredField />}
                </label>
                <select
                    name="person_gender"
                    value={person.person_gender || 'MALE'}
                    onChange={onChange}
                    className="form-select"
                    required={required}
                >
                    {GENDERS.map(gender => (
                        <option key={gender} value={gender}>{gender}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Date of Birth
                    {required && <RequiredField />}
                </label>
                <input
                    type="date"
                    name="person_dob"
                    value={person.person_dob || ''}
                    onChange={onChange}
                    className="form-input"
                    required={required}
                />
            </div>
        </div>
    </div>
);

export default {
    RequiredField,
    DocumentInput,
    PersonInput,
    // Constants
    CASE_STATUSES,
    CASE_TYPES,
    DOCUMENT_TYPES,
    INCIDENT_STATUSES,
    SENTENCE_TYPES,
    COMPLIANCE_STATUSES,
    SUPERVISION_LEVELS,
    REHABILITATION_STATUSES,
    APPEAL_STATUSES,
    AUTHORITY_TYPES,
    PROCEEDING_TYPES,
    COURT_TYPES,
    GENDERS
}; 