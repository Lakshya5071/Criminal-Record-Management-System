import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { formatDate } from '../../utils/dateUtils';
import Select from 'react-select';

function CaseDetails() {
    const { id } = useParams();
    const [caseData, setCaseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCaseDetails = async () => {
            console.log('Fetching case details for case ID:', id);
            try {
                setLoading(true);
                const response = await fetch(`http://${import.meta.env.VITE_BACKEND_URL}/cases/${id}`);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('Fetched case details:', data);
                setCaseData(data.case);
            } catch (err) {
                console.error('Fetch error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCaseDetails();
        }
    }, [id]);

    const renderPersonDetails = (person) => (
        <table className="w-full border-collapse border border-gray-200 mb-2">
            <tbody>
                <tr>
                    <td className="font-medium px-4 py-2 border border-gray-200 bg-gray-50 w-1/4">Name</td>
                    <td className="px-4 py-2 border border-gray-200">{person.person_name}</td>
                </tr>
                <tr>
                    <td className="font-medium px-4 py-2 border border-gray-200 bg-gray-50">Gender</td>
                    <td className="px-4 py-2 border border-gray-200">{person.person_gender}</td>
                </tr>
                <tr>
                    <td className="font-medium px-4 py-2 border border-gray-200 bg-gray-50">Date of Birth</td>
                    <td className="px-4 py-2 border border-gray-200">{formatDate(person.person_dob, false)}</td>
                </tr>
                <tr>
                    <td className="font-medium px-4 py-2 border border-gray-200 bg-gray-50">Contact</td>
                    <td className="px-4 py-2 border border-gray-200">{person.phone_number}</td>
                </tr>
                <tr>
                    <td className="font-medium px-4 py-2 border border-gray-200 bg-gray-50">Address</td>
                    <td className="px-4 py-2 border border-gray-200">{person.person_address}</td>
                </tr>
            </tbody>
        </table>
    );

    if (loading) {
        return <div className="text-center py-10">Loading...</div>;
    }

    if (error) {
        return <div className="text-center py-10 text-red-500">Error: {error}</div>;
    }

    if (!caseData) {
        return <div className="text-center py-10">Case not found</div>;
    }

    return (
        <div className="max-w-[1200px] mx-auto px-container-px md:px-container-px-md py-10">
            <div className="bg-white rounded-lg p-6 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold mb-4">{caseData.case_name}</h1>
                    <span className="italic text-gray-500 text-md pb-6">Case #{caseData.id}</span>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-gray-100 p-4 rounded-lg">
                            <p className="text-gray-600">Type</p>
                            <p className="font-medium">{caseData.case_type.replace(/_/g, ' ')}</p>
                        </div>
                        <div className="bg-gray-100 p-4 rounded-lg">
                            <p className="text-gray-600">Status</p>
                            <p className="font-medium">{caseData.case_status.replace(/_/g, ' ')}</p>
                        </div>
                        <div className="bg-gray-100 p-4 rounded-lg">
                            <p className="text-gray-600">Filed Date</p>
                            <p className="font-medium">{formatDate(caseData.case_date_filed, false)}</p>
                        </div>
                    </div>
                    <p className="text-gray-700">{caseData.case_description}</p>
                </div>

                {/* Incidents */}
                {caseData.incidents && caseData.incidents.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Incidents</h2>
                        {caseData.incidents.map((incident, index) => (
                            <div key={index} className="border rounded-lg p-4 mb-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <p><span className="font-medium">Location:</span> {incident.incident_location}</p>
                                    <p><span className="font-medium">Status:</span> {incident.incident_status}</p>
                                    <p><span className="font-medium">From:</span> {formatDate(incident.incident_date_from, false)}</p>
                                    <p><span className="font-medium">To:</span> {formatDate(incident.incident_date_to, false)}</p>
                                </div>

                                {/* Add Victims Section */}
                                {incident.victims && incident.victims.length > 0 && (
                                    <div className="mt-4">
                                        <h3 className="text-xl font-semibold mb-3">Victims</h3>
                                        {incident.victims.map((victim, idx) => (
                                            <div key={idx} className="mb-4">
                                                {renderPersonDetails(victim)}
                                                {victim.comments && (
                                                    <p className="mt-2 text-sm italic text-gray-600">
                                                        Comments: {victim.comments}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Add Witnesses Section */}
                                {incident.witnesses && incident.witnesses.length > 0 && (
                                    <div className="mt-4">
                                        <h3 className="text-xl font-semibold mb-3">Witnesses</h3>
                                        {incident.witnesses.map((witness, idx) => (
                                            <div key={idx} className="mb-4">
                                                {renderPersonDetails(witness)}
                                                {witness.comments && (
                                                    <p className="mt-2 text-sm italic text-gray-600">
                                                        Comments: {witness.comments}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {incident.report && (
                                    <div className="mt-2">
                                        <p className="font-medium">Report: {incident.report.document_name}</p>
                                        <a href={incident.report.document_content_url}
                                            className="text-blue-600 hover:underline"
                                            target="_blank"
                                            rel="noopener noreferrer">
                                            View Document
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Evidence */}
                {caseData.evidences && caseData.evidences.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Evidence</h2>
                        <div className="grid gap-4">
                            {caseData.evidences.map((evidence, index) => (
                                <div key={index} className="border rounded-lg p-4">
                                    <h3 className="font-medium text-lg">{evidence.evidence_name}</h3>
                                    <p className="text-gray-600 mt-1">{evidence.evidence_description}</p>
                                    <div className="mt-2 text-sm text-gray-500">
                                        <p>Found: {formatDate(evidence.evidence_date_found, false)}</p>
                                        <p>Location: {evidence.evidence_location}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Sentences */}
                {caseData.sentences && caseData.sentences.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Sentences</h2>
                        {caseData.sentences.map((sentence, index) => (
                            <div key={index} className="border rounded-lg p-4">
                                <div className="mb-4">
                                    <p><span className="font-medium">Date:</span> {formatDate(sentence.sentence_date, false)}</p>
                                    <p><span className="font-medium">Type:</span> {sentence.sentence_type}</p>
                                    <p><span className="font-medium">Duration:</span> {sentence.sentence_duration} days</p>
                                </div>
                                {sentence.sentenced_people.map((sp, idx) => (
                                    <div key={idx}>
                                        <h3 className="font-medium text-lg mb-2">Sentenced Person</h3>
                                        {renderPersonDetails(sp.person)}
                                        <div className="mt-2 space-y-1 text-sm">
                                            <p><span className="font-medium">Compliance:</span> {sp.compliance_status}</p>
                                            <p><span className="font-medium">Supervision:</span> {sp.supervision_level}</p>
                                            <p><span className="font-medium">Rehabilitation:</span> {sp.rehabilitation_status}</p>
                                            <p><span className="font-medium">Appeal:</span> {sp.appeal_status}</p>
                                            {sp.compliance_notes && (
                                                <p className="italic">{sp.compliance_notes}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}

                {/* Investigating Authorities */}
                {caseData.investigating_authorities && caseData.investigating_authorities.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Investigating Authorities</h2>
                        <div className="grid gap-4">
                            {caseData.investigating_authorities.map((auth, index) => (
                                <div key={index} className="border rounded-lg p-4">
                                    <h3 className="font-medium">{auth.authority.authority_name}</h3>
                                    <p className="text-sm text-gray-600">{auth.authority.authority_type}</p>
                                    <p className="text-sm mt-2">
                                        {formatDate(auth.date_from, false)} - {formatDate(auth.date_to, false)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Proceedings */}
                {caseData.proceedings && caseData.proceedings.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Proceedings</h2>
                        {caseData.proceedings.map((proc, index) => (
                            <div key={index} className="border rounded-lg p-4 mb-4">
                                <h3 className="font-medium text-lg">{proc.proceeding_type.replace(/_/g, ' ')}</h3>
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <p><span className="font-medium">Started:</span> {formatDate(proc.date_started, false)}</p>
                                    <p><span className="font-medium">Ended:</span> {formatDate(proc.date_ended, false)}</p>
                                    <p><span className="font-medium">Status:</span> {proc.proceeding_status}</p>
                                    <p><span className="font-medium">Court:</span> {proc.court_authority.authority_name}</p>
                                </div>
                                <p className="mt-2"><span className="font-medium">Presiding Officers:</span> {proc.presiding_officers}</p>
                                {proc.proceeding_notes && (
                                    <p className="mt-2 text-gray-600">{proc.proceeding_notes}</p>
                                )}
                                {proc.transcript && (
                                    <a href={proc.transcript.document_content_url}
                                        className="block mt-2 text-blue-600 hover:underline"
                                        target="_blank"
                                        rel="noopener noreferrer">
                                        View Transcript
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CaseDetails;
