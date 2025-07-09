const express = require('express');
const pool = require('../helpers/database');
const { validateCaseData } = require('../validators/caseValidation');
const adminRouter = express.Router();

// Admin token verification middleware
async function verifyAdminToken(req, res, next) {
    const adminToken = req.query.admin_token;

    if (!adminToken) {
        return res.status(401).json({
            message: 'Admin token is required as a query parameter'
        });
    }

    try {
        const [token] = await pool.query(
            'SELECT * FROM admin_tokens WHERE token = ? AND is_active = true',
            [adminToken]
        );

        if (!token) {
            return res.status(403).json({
                message: 'Invalid or inactive admin token'
            });
        }

        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Error verifying admin token',
            error: err.message
        });
    }
}

// Apply middleware to all routes
adminRouter.use(verifyAdminToken);

// Helper functions for document management
async function findOrCreateDocument(document, caseId, connection) {
    if (!document) return null;

    // Try to find existing document by name and URL
    const [existing] = await connection.query(
        'SELECT id FROM documents WHERE document_name = ? AND document_content_url = ?',
        [document.document_name, document.document_content_url]
    );

    if (existing) {
        // Update existing document with new information
        await connection.query(
            `UPDATE documents 
            SET document_type = ?, document_date = ?
            WHERE id = ?`,
            [document.document_type, document.document_date, existing.id]
        );
        return existing.id;
    }

    // Create new document
    const result = await connection.query(
        `INSERT INTO documents 
        (case_id, document_name, document_type, document_date, document_content_url)
        VALUES (?, ?, ?, ?, ?)`,
        [
            caseId,
            document.document_name,
            document.document_type,
            document.document_date,
            document.document_content_url
        ]
    );
    return result.insertId;
}

// Updated person management
async function findOrCreatePerson(person, connection) {
    if (!person) return null;

    // Try to find by aadhaar if provided
    if (person.aadhaar_number) {
        const [existing] = await connection.query(
            'SELECT id FROM people WHERE aadhaar_number = ?',
            [person.aadhaar_number]
        );

        if (existing) {
            // Update existing person's information
            await connection.query(
                `UPDATE people 
                SET person_name = ?, phone_number = ?, 
                    person_address = ?, person_gender = ?, 
                    person_dob = ?
                WHERE id = ?`,
                [
                    person.person_name,
                    person.phone_number,
                    person.person_address,
                    person.person_gender,
                    person.person_dob,
                    existing.id
                ]
            );
            return existing.id;
        }
    }

    // Create new person
    const result = await connection.query(
        `INSERT INTO people 
        (person_name, aadhaar_number, phone_number, person_address, person_gender, person_dob)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
            person.person_name,
            person.aadhaar_number,
            person.phone_number,
            person.person_address,
            person.person_gender,
            person.person_dob
        ]
    );
    return result.insertId;
}

// Updated authority management
async function findOrCreateAuthority(authority, connection) {
    if (!authority) return null;

    // Try to find by global_id
    const [existing] = await connection.query(
        'SELECT id FROM authority WHERE global_id = ?',
        [authority.global_id]
    );

    if (existing) {
        // Update existing authority information
        await connection.query(
            `UPDATE authority 
            SET authority_name = ?, authority_type = ?
            WHERE id = ?`,
            [
                authority.authority_name,
                authority.authority_type,
                existing.id
            ]
        );
        return existing.id;
    }

    // Create new authority
    const result = await connection.query(
        `INSERT INTO authority 
        (global_id, authority_name, authority_type)
        VALUES (?, ?, ?)`,
        [
            authority.global_id,
            authority.authority_name,
            authority.authority_type
        ]
    );
    return result.insertId;
}

// Create new case with all related data
adminRouter.post('/cases', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        // Convert empty strings to null in the case data
        const caseData = req.body.case;
        for (let key in caseData) {
            if (caseData[key] === '') {
                caseData[key] = null;
            }
            // Handle nested arrays
            if (Array.isArray(caseData[key])) {
                caseData[key].forEach(item => {
                    for (let itemKey in item) {
                        if (item[itemKey] === '') {
                            item[itemKey] = null;
                        }
                    }
                });
            }
        }

        // Validate incoming data
        const validatedCaseData = validateCaseData(caseData);

        await connection.beginTransaction();

        console.log("Creating case with validated data:", validatedCaseData);

        // 1. Create main case
        const caseResult = await connection.query(
            `INSERT INTO cases 
            (case_name, case_type, case_status, case_description, case_date_filed, case_date_closed)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                validatedCaseData.case_name,
                validatedCaseData.case_type,
                validatedCaseData.case_status,
                validatedCaseData.case_description,
                validatedCaseData.case_date_filed,
                validatedCaseData.case_date_closed
            ]
        );
        const caseId = caseResult.insertId;
        // ... existing code ...

        // 2. Handle incidents and related data
        // First, get existing incidents for this case
        const [rows] = await connection.query(
            'SELECT id FROM incidents WHERE case_id = ?',
            [caseId]
        );
        console.log("Raw query result for incidents:", rows);

        // Convert to array if it's a single object
        const existingIncidentIds = rows ?
            (Array.isArray(rows) ? rows.map(inc => inc.id) : [rows.id]) : [];
        console.log("Existing incident IDs:", existingIncidentIds);

        // Get the IDs of incidents in the updated data
        const updatedIncidentIds = validatedCaseData.incidents?.length > 0 ?
            validatedCaseData.incidents
                .filter(inc => inc.id)
                .map(inc => inc.id)
            : [];
        console.log("Updated incident IDs:", updatedIncidentIds);

        if (existingIncidentIds.length > 0) {
            const incidentsToDelete = existingIncidentIds.filter(
                id => !updatedIncidentIds.includes(id)
            );

            if (incidentsToDelete.length > 0) {
                // Delete related records first
                for (const incidentId of incidentsToDelete) {
                    await connection.query('DELETE FROM incident_victims WHERE incident_id = ?', [incidentId]);
                    await connection.query('DELETE FROM incident_witnesses WHERE incident_id = ?', [incidentId]);
                    await connection.query('DELETE FROM incident_reports WHERE incident_id = ?', [incidentId]);
                }
                // Then delete the incidents
                await connection.query(
                    'DELETE FROM incidents WHERE id IN (?)',
                    [incidentsToDelete]
                );
            }
        }

        // ... rest of the code ...

        if (validatedCaseData.incidents?.length > 0) {
            for (const incident of validatedCaseData.incidents) {
                // Create incident report document first if exists
                const reportId = incident.report ?
                    await findOrCreateDocument(incident.report, caseId, connection) : null;

                // Create incident
                const incidentResult = await connection.query(
                    `INSERT INTO incidents 
                    (case_id, incident_date_from, incident_date_to, 
                    incident_location, incident_status, latitude, longitude)
                    VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        caseId,
                        incident.incident_date_from,
                        incident.incident_date_to,
                        incident.incident_location,
                        incident.incident_status,
                        incident.latitude ? parseFloat(incident.latitude) : null,
                        incident.longitude ? parseFloat(incident.longitude) : null
                    ]
                );
                const incidentId = incidentResult.insertId;

                // Link report to incident if exists
                if (reportId) {
                    await connection.query(
                        `UPDATE incidents SET incident_report_id = ? WHERE id = ?`,
                        [reportId, incidentId]
                    );
                }

                // Handle victims
                if (incident.victims?.length > 0) {
                    for (const victim of incident.victims) {
                        const personId = await findOrCreatePerson(victim.person, connection);
                        await connection.query(
                            `INSERT INTO incident_victims 
                            (incident_id, person_id, comments)
                            VALUES (?, ?, ?)`,
                            [incidentId, personId, victim.comments]
                        );
                    }
                }

                // Handle witnesses
                if (incident.witnesses?.length > 0) {
                    for (const witness of incident.witnesses) {
                        const personId = await findOrCreatePerson(witness.person, connection);
                        await connection.query(
                            `INSERT INTO incident_witnesses 
                            (incident_id, person_id, comments)
                            VALUES (?, ?, ?)`,
                            [incidentId, personId, witness.comments]
                        );
                    }
                }
            }
        }

        // 3. Handle evidences
        const existingEvidences = await connection.query(
            'SELECT id FROM evidences WHERE case_id = ?',
            [caseId]
        );
        const existingEvidenceIds = existingEvidences?.length ?
            existingEvidences.map(ev => ev.id) : [];

        const updatedEvidenceIds = validatedCaseData.evidences?.length > 0 ?
            validatedCaseData.evidences
                .filter(ev => ev.id)
                .map(ev => ev.id)
            : [];

        if (existingEvidenceIds.length > 0) {
            const evidencesToDelete = existingEvidenceIds.filter(
                id => !updatedEvidenceIds.includes(id)
            );

            if (evidencesToDelete.length > 0) {
                await connection.query(
                    'DELETE FROM evidences WHERE id IN (?)',
                    [evidencesToDelete]
                );
            }
        }

        if (validatedCaseData.evidences?.length > 0) {
            for (const evidence of validatedCaseData.evidences) {
                let evidenceId;
                if (evidence.id && existingEvidenceIds.includes(evidence.id)) {
                    // Update existing evidence
                    await connection.query(
                        `UPDATE evidences 
                        SET evidence_name = ?, evidence_description = ?, 
                            evidence_date_found = ?, evidence_location = ?
                        WHERE id = ?`,
                        [
                            evidence.evidence_name,
                            evidence.evidence_description,
                            evidence.evidence_date_found,
                            evidence.evidence_location,
                            evidence.id
                        ]
                    );
                    evidenceId = evidence.id;
                } else {
                    // Create new evidence
                    const result = await connection.query(
                        `INSERT INTO evidences 
                        (case_id, evidence_name, evidence_description, 
                        evidence_date_found, evidence_location)
                        VALUES (?, ?, ?, ?, ?)`,
                        [
                            caseId,
                            evidence.evidence_name,
                            evidence.evidence_description,
                            evidence.evidence_date_found,
                            evidence.evidence_location
                        ]
                    );
                    evidenceId = result.insertId;
                }
            }
        }

        // 4. Handle investigating authorities
        if (validatedCaseData.investigating_authorities?.length > 0) {
            // First, get existing investigating authorities for this case
            const existingAuthorities = await connection.query(
                'SELECT authority_id FROM investigating_authorities WHERE case_id = ?',
                [caseId]
            );
            const existingAuthorityIds = existingAuthorities.map(ia => ia.authority_id);

            // Delete existing investigating authorities for this case to avoid duplicates
            await connection.query(
                'DELETE FROM investigating_authorities WHERE case_id = ?',
                [caseId]
            );

            // Then insert all the current ones
            for (const ia of validatedCaseData.investigating_authorities) {
                const authorityId = await findOrCreateAuthority(ia.authority, connection);
                await connection.query(
                    `INSERT INTO investigating_authorities 
                    (authority_id, case_id, date_from, date_to)
                    VALUES (?, ?, ?, ?)`,
                    [authorityId, caseId, ia.date_from, ia.date_to]
                );
            }
        }

        // 5. Handle proceedings
        if (validatedCaseData.proceedings?.length > 0) {
            for (const proc of validatedCaseData.proceedings) {
                // Create/find court authority and judge first
                const courtAuthorityId = await findOrCreateAuthority(proc.court_authority, connection);
                const judgeId = await findOrCreatePerson(proc.judge, connection);

                // Handle transcript document
                const transcriptId = proc.transcript ?
                    await findOrCreateDocument(proc.transcript, caseId, connection) : null;

                // Create proceeding
                const procResult = await connection.query(
                    `INSERT INTO proceedings 
                    (case_id, proceeding_type, court_authority_id, transcript_id,
                    proceeding_notes, judge_id, presiding_officers, date_started,
                    date_ended, proceeding_status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        caseId,
                        proc.proceeding_type,
                        courtAuthorityId,
                        transcriptId,
                        proc.proceeding_notes,
                        judgeId,
                        proc.presiding_officers,
                        proc.date_started,
                        proc.date_ended,
                        proc.proceeding_status
                    ]
                );
                const procId = procResult.insertId;

                // Handle other documents
                if (proc.other_documents?.length > 0) {
                    for (const doc of proc.other_documents) {
                        const docId = await findOrCreateDocument(doc, caseId, connection);
                        await connection.query(
                            `INSERT INTO proceeding_other_documents 
                            (proceeding_id, document_id)
                            VALUES (?, ?)`,
                            [procId, docId]
                        );
                    }
                }

                // Handle plaintiffs
                if (proc.plaintiffs?.length > 0) {
                    for (const plaintiff of proc.plaintiffs) {
                        const personId = await findOrCreatePerson(plaintiff, connection);
                        await connection.query(
                            `INSERT INTO proceeding_plaintiffs 
                            (proceeding_id, person_id)
                            VALUES (?, ?)`,
                            [procId, personId]
                        );
                    }
                }

                // Handle defendants
                if (proc.defendants?.length > 0) {
                    for (const defendant of proc.defendants) {
                        const personId = await findOrCreatePerson(defendant, connection);
                        await connection.query(
                            `INSERT INTO proceeding_defendants 
                            (proceeding_id, person_id)
                            VALUES (?, ?)`,
                            [procId, personId]
                        );
                    }
                }

                // Handle advocates
                if (proc.plaintiff_advocates?.length > 0) {
                    for (const advocate of proc.plaintiff_advocates) {
                        const personId = await findOrCreatePerson(advocate, connection);
                        await connection.query(
                            `INSERT INTO proceeding_plaintiff_advocates 
                            (proceeding_id, person_id)
                            VALUES (?, ?)`,
                            [procId, personId]
                        );
                    }
                }

                if (proc.defendant_advocates?.length > 0) {
                    for (const advocate of proc.defendant_advocates) {
                        const personId = await findOrCreatePerson(advocate, connection);
                        await connection.query(
                            `INSERT INTO proceeding_defendant_advocates 
                            (proceeding_id, person_id)
                            VALUES (?, ?)`,
                            [procId, personId]
                        );
                    }
                }
            }
        }

        await connection.commit();
        res.status(201).json({
            message: 'Case created successfully',
            case_id: caseId
        });

    } catch (err) {
        await connection.rollback();
        console.error('Error creating case:', err);

        if (err.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation error',
                errors: err.errors
            });
        }

        res.status(500).json({
            message: 'Error creating case',
            error: err.message
        });
    } finally {
        connection.release();
    }
});

// Edit case
adminRouter.put('/cases/:id', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const caseId = req.params.id;

        // Convert empty strings to null in the case data
        const caseData = req.body.case;
        for (let key in caseData) {
            if (caseData[key] === '') {
                caseData[key] = null;
            }
            // Handle nested arrays
            if (Array.isArray(caseData[key])) {
                caseData[key].forEach(item => {
                    for (let itemKey in item) {
                        if (item[itemKey] === '') {
                            item[itemKey] = null;
                        }
                    }
                });
            }
        }

        // Validate incoming data
        const validatedCaseData = validateCaseData(caseData);

        // Verify case exists
        const [existingCase] = await connection.query(
            'SELECT id FROM cases WHERE id = ?',
            [caseId]
        );

        if (!existingCase) {
            return res.status(404).json({
                message: 'Case not found'
            });
        }

        // 1. Update main case
        await connection.query(
            `UPDATE cases 
            SET case_name = ?, case_type = ?, case_status = ?, 
                case_description = ?, case_date_filed = ?, case_date_closed = ?
            WHERE id = ?`,
            [
                validatedCaseData.case_name,
                validatedCaseData.case_type,
                validatedCaseData.case_status,
                validatedCaseData.case_description,
                validatedCaseData.case_date_filed,
                validatedCaseData.case_date_closed,
                caseId
            ]
        );

        // 2. Handle incidents and related data
        if (validatedCaseData.incidents?.length > 0) {
            for (const incident of validatedCaseData.incidents) {
                let incidentId;

                if (incident.id) {
                    // Update existing incident
                    await connection.query(
                        `UPDATE incidents 
                        SET incident_date_from = ?, incident_date_to = ?, 
                            incident_location = ?, incident_status = ?, 
                            latitude = ?, longitude = ?
                        WHERE id = ? AND case_id = ?`,
                        [
                            incident.incident_date_from,
                            incident.incident_date_to,
                            incident.incident_location,
                            incident.incident_status,
                            incident.latitude,
                            incident.longitude,
                            incident.id,
                            caseId
                        ]
                    );
                    incidentId = incident.id;
                } else {
                    // Create new incident
                    const result = await connection.query(
                        `INSERT INTO incidents 
                        (case_id, incident_date_from, incident_date_to, 
                        incident_location, incident_status, latitude, longitude)
                        VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [
                            caseId,
                            incident.incident_date_from,
                            incident.incident_date_to,
                            incident.incident_location,
                            incident.incident_status,
                            incident.latitude ? parseFloat(incident.latitude) : null,
                            incident.longitude ? parseFloat(incident.longitude) : null
                        ]
                    );
                    incidentId = result.insertId;
                }

                // Handle victims - using the relationship IDs
                if (incident.victims?.length > 0) {
                    // Get existing victim relationships
                    const existingVictims = await connection.query(
                        'SELECT incident_id, person_id FROM incident_victims WHERE incident_id = ?',
                        [incidentId]
                    );

                    for (const victim of incident.victims) {
                        const personId = await findOrCreatePerson(victim.person, connection);

                        // Check if this victim relationship already exists
                        const existingVictim = existingVictims.find(
                            ev => ev.person_id === personId && ev.incident_id === incidentId
                        );

                        if (existingVictim) {
                            // Update existing relationship
                            await connection.query(
                                `UPDATE incident_victims 
                                SET comments = ?
                                WHERE incident_id = ? AND person_id = ?`,
                                [victim.comments, incidentId, personId]
                            );
                        } else {
                            // Create new relationship
                            await connection.query(
                                `INSERT INTO incident_victims 
                                (incident_id, person_id, comments)
                                VALUES (?, ?, ?)`,
                                [incidentId, personId, victim.comments]
                            );
                        }
                    }

                    // Remove victim relationships that are no longer present
                    const currentVictimIds = incident.victims.map(v => v.person.id).filter(Boolean);
                    const victimsToRemove = existingVictims.filter(
                        ev => !currentVictimIds.includes(ev.person_id)
                    );

                    if (victimsToRemove.length > 0) {
                        await connection.query(
                            `DELETE FROM incident_victims 
                            WHERE incident_id = ? AND person_id IN (?)`,
                            [incidentId, victimsToRemove.map(v => v.person_id)]
                        );
                    }
                } else {
                    // If no victims provided, remove all existing victim relationships
                    await connection.query(
                        'DELETE FROM incident_victims WHERE incident_id = ?',
                        [incidentId]
                    );
                }

                // Similar pattern for witnesses
                if (incident.witnesses?.length > 0) {
                    const existingWitnesses = await connection.query(
                        'SELECT incident_id, witness_id FROM incident_witnesses WHERE incident_id = ?',
                        [incidentId]
                    );

                    for (const witness of incident.witnesses) {
                        const personId = await findOrCreatePerson(witness.person, connection);

                        const existingWitness = existingWitnesses.find(
                            ew => ew.witness_id === personId && ew.incident_id === incidentId
                        );

                        if (existingWitness) {
                            await connection.query(
                                `UPDATE incident_witnesses 
                                SET comments = ?
                                WHERE incident_id = ? AND witness_id = ?`,
                                [witness.comments, incidentId, personId]
                            );
                        } else {
                            await connection.query(
                                `INSERT INTO incident_witnesses 
                                (incident_id, witness_id, comments)
                                VALUES (?, ?, ?)`,
                                [incidentId, personId, witness.comments]
                            );
                        }
                    }

                    // Remove witness relationships that are no longer present
                    const currentWitnessIds = incident.witnesses.map(w => w.person.id).filter(Boolean);
                    const witnessesToRemove = existingWitnesses.filter(
                        ew => !currentWitnessIds.includes(ew.witness_id)
                    );

                    if (witnessesToRemove.length > 0) {
                        await connection.query(
                            `DELETE FROM incident_witnesses 
                            WHERE incident_id = ? AND witness_id IN (?)`,
                            [incidentId, witnessesToRemove.map(w => w.witness_id)]
                        );
                    }
                } else {
                    // If no witnesses provided, remove all existing witness relationships
                    await connection.query(
                        'DELETE FROM incident_witnesses WHERE incident_id = ?',
                        [incidentId]
                    );
                }
            }

            // Remove incidents that are no longer present
            const rows = await connection.query(
                'SELECT id FROM incidents WHERE case_id = ?',
                [caseId]
            );
            console.log("Raw query result for incidents:", rows);

            // Convert to array if it's a single object
            const existingIncidentIds = rows ?
                (Array.isArray(rows) ? rows.map(inc => inc.id) : [rows.id]) : [];
            console.log("Existing incident IDs:", existingIncidentIds);

            const updatedIncidentIds = validatedCaseData.incidents?.length > 0 ?
                validatedCaseData.incidents
                    .filter(inc => inc.id)
                    .map(inc => inc.id)
                : [];
            console.log("Updated incident IDs:", updatedIncidentIds);

            if (existingIncidentIds.length > 0) {
                const incidentsToDelete = existingIncidentIds.filter(
                    id => !updatedIncidentIds.includes(id)
                );

                if (incidentsToDelete.length > 0) {
                    // Delete related records first
                    for (const incidentId of incidentsToDelete) {
                        await connection.query('DELETE FROM incident_victims WHERE incident_id = ?', [incidentId]);
                        await connection.query('DELETE FROM incident_witnesses WHERE incident_id = ?', [incidentId]);
                        await connection.query('DELETE FROM incident_reports WHERE incident_id = ?', [incidentId]);
                    }
                    // Then delete the incidents
                    await connection.query(
                        'DELETE FROM incidents WHERE id IN (?)',
                        [incidentsToDelete]
                    );
                }
            }
        }

        // 3. Handle evidences
        const existingEvidences = await connection.query(
            'SELECT id FROM evidences WHERE case_id = ?',
            [caseId]
        );
        const existingEvidenceIds = existingEvidences?.length ?
            existingEvidences.map(ev => ev.id) : [];

        const updatedEvidenceIds = validatedCaseData.evidences?.length > 0 ?
            validatedCaseData.evidences
                .filter(ev => ev.id)
                .map(ev => ev.id)
            : [];

        if (existingEvidenceIds.length > 0) {
            const evidencesToDelete = existingEvidenceIds.filter(
                id => !updatedEvidenceIds.includes(id)
            );

            if (evidencesToDelete.length > 0) {
                await connection.query(
                    'DELETE FROM evidences WHERE id IN (?)',
                    [evidencesToDelete]
                );
            }
        }

        if (validatedCaseData.evidences?.length > 0) {
            for (const evidence of validatedCaseData.evidences) {
                let evidenceId;
                if (evidence.id && existingEvidenceIds.includes(evidence.id)) {
                    // Update existing evidence
                    await connection.query(
                        `UPDATE evidences 
                        SET evidence_name = ?, evidence_description = ?, 
                            evidence_date_found = ?, evidence_location = ?
                        WHERE id = ?`,
                        [
                            evidence.evidence_name,
                            evidence.evidence_description,
                            evidence.evidence_date_found,
                            evidence.evidence_location,
                            evidence.id
                        ]
                    );
                    evidenceId = evidence.id;
                } else {
                    // Create new evidence
                    const result = await connection.query(
                        `INSERT INTO evidences 
                        (case_id, evidence_name, evidence_description, 
                        evidence_date_found, evidence_location)
                        VALUES (?, ?, ?, ?, ?)`,
                        [
                            caseId,
                            evidence.evidence_name,
                            evidence.evidence_description,
                            evidence.evidence_date_found,
                            evidence.evidence_location
                        ]
                    );
                    evidenceId = result.insertId;
                }
            }
        }

        // 4. Handle investigating authorities
        if (validatedCaseData.investigating_authorities?.length > 0) {
            // First, get existing investigating authorities for this case
            const existingAuthorities = await connection.query(
                'SELECT authority_id FROM investigating_authorities WHERE case_id = ?',
                [caseId]
            );
            const existingAuthorityIds = existingAuthorities.map(ia => ia.authority_id);

            // Delete existing investigating authorities for this case to avoid duplicates
            await connection.query(
                'DELETE FROM investigating_authorities WHERE case_id = ?',
                [caseId]
            );

            // Then insert all the current ones
            for (const ia of validatedCaseData.investigating_authorities) {
                const authorityId = await findOrCreateAuthority(ia.authority, connection);
                await connection.query(
                    `INSERT INTO investigating_authorities 
                    (authority_id, case_id, date_from, date_to)
                    VALUES (?, ?, ?, ?)`,
                    [authorityId, caseId, ia.date_from, ia.date_to]
                );
            }
        }

        // 5. Handle proceedings
        if (validatedCaseData.proceedings?.length > 0) {
            // First, get existing proceedings for this case
            const existingProceedings = await connection.query(
                'SELECT id FROM proceedings WHERE case_id = ?',
                [caseId]
            );
            const existingProceedingIds = existingProceedings.map(proc => proc.id);

            for (const proc of validatedCaseData.proceedings) {
                let procId;
                if (proc.id && existingProceedingIds.includes(proc.id)) {
                    // Update existing proceeding
                    await connection.query(
                        `UPDATE proceedings 
                        SET proceeding_type = ?, court_authority_id = ?, 
                            proceeding_notes = ?, presiding_officers = ?, 
                            date_started = ?, date_ended = ?, proceeding_status = ?
                        WHERE id = ?`,
                        [
                            proc.proceeding_type,
                            proc.court_authority.id,
                            proc.proceeding_notes,
                            proc.presiding_officers,
                            proc.date_started,
                            proc.date_ended,
                            proc.proceeding_status,
                            proc.id
                        ]
                    );
                    procId = proc.id;
                } else {
                    // Create new proceeding
                    const courtAuthorityId = await findOrCreateAuthority(proc.court_authority, connection);
                    const judgeId = await findOrCreatePerson(proc.judge, connection);

                    // Handle transcript document
                    const transcriptId = proc.transcript ?
                        await findOrCreateDocument(proc.transcript, caseId, connection) : null;

                    const procResult = await connection.query(
                        `INSERT INTO proceedings 
                        (case_id, proceeding_type, court_authority_id, transcript_id,
                        proceeding_notes, judge_id, presiding_officers, date_started,
                        date_ended, proceeding_status)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            caseId,
                            proc.proceeding_type,
                            courtAuthorityId,
                            transcriptId,
                            proc.proceeding_notes,
                            judgeId,
                            proc.presiding_officers,
                            proc.date_started,
                            proc.date_ended,
                            proc.proceeding_status
                        ]
                    );
                    procId = procResult.insertId;
                }

                // Handle other documents
                if (proc.other_documents?.length > 0) {
                    // First, get existing other documents for this proceeding
                    const existingOtherDocuments = await connection.query(
                        'SELECT id FROM proceeding_other_documents WHERE proceeding_id = ?',
                        [procId]
                    );
                    const existingOtherDocumentIds = existingOtherDocuments.map(od => od.document_id);

                    for (const doc of proc.other_documents) {
                        let docId;
                        if (doc.id && existingOtherDocumentIds.includes(doc.id)) {
                            // Update existing document
                            await connection.query(
                                `UPDATE proceeding_other_documents 
                                SET document_id = ?
                                WHERE proceeding_id = ? AND document_id = ?`,
                                [doc.id, procId, doc.id]
                            );
                            docId = doc.id;
                        } else {
                            // Create new document
                            docId = await findOrCreateDocument(doc, caseId, connection);
                            await connection.query(
                                `INSERT INTO proceeding_other_documents 
                                (proceeding_id, document_id)
                                VALUES (?, ?)`,
                                [procId, docId]
                            );
                        }
                    }
                }

                // Handle plaintiffs
                if (proc.plaintiffs?.length > 0) {
                    // First, get existing plaintiffs for this proceeding
                    const existingPlaintiffs = await connection.query(
                        'SELECT id FROM proceeding_plaintiffs WHERE proceeding_id = ?',
                        [procId]
                    );
                    const existingPlaintiffIds = existingPlaintiffs.map(p => p.person_id);

                    for (const plaintiff of proc.plaintiffs) {
                        let personId;
                        if (plaintiff.id && existingPlaintiffIds.includes(plaintiff.id)) {
                            // Update existing plaintiff
                            await connection.query(
                                `UPDATE proceeding_plaintiffs 
                                SET person_id = ?
                                WHERE proceeding_id = ? AND person_id = ?`,
                                [plaintiff.id, procId, plaintiff.id]
                            );
                            personId = plaintiff.id;
                        } else {
                            // Create new plaintiff
                            personId = await findOrCreatePerson(plaintiff, connection);
                            await connection.query(
                                `INSERT INTO proceeding_plaintiffs 
                                (proceeding_id, person_id)
                                VALUES (?, ?)`,
                                [procId, personId]
                            );
                        }
                    }
                }

                // Handle defendants
                if (proc.defendants?.length > 0) {
                    // First, get existing defendants for this proceeding
                    const existingDefendants = await connection.query(
                        'SELECT id FROM proceeding_defendants WHERE proceeding_id = ?',
                        [procId]
                    );
                    const existingDefendantIds = existingDefendants.map(d => d.person_id);

                    for (const defendant of proc.defendants) {
                        let personId;
                        if (defendant.id && existingDefendantIds.includes(defendant.id)) {
                            // Update existing defendant
                            await connection.query(
                                `UPDATE proceeding_defendants 
                                SET person_id = ?
                                WHERE proceeding_id = ? AND person_id = ?`,
                                [defendant.id, procId, defendant.id]
                            );
                            personId = defendant.id;
                        } else {
                            // Create new defendant
                            personId = await findOrCreatePerson(defendant, connection);
                            await connection.query(
                                `INSERT INTO proceeding_defendants 
                                (proceeding_id, person_id)
                                VALUES (?, ?)`,
                                [procId, personId]
                            );
                        }
                    }
                }

                // Handle advocates
                if (proc.plaintiff_advocates?.length > 0) {
                    // First, get existing plaintiff advocates for this proceeding
                    const existingPlaintiffAdvocates = await connection.query(
                        'SELECT id FROM proceeding_plaintiff_advocates WHERE proceeding_id = ?',
                        [procId]
                    );
                    const existingPlaintiffAdvocateIds = existingPlaintiffAdvocates.map(a => a.person_id);

                    for (const advocate of proc.plaintiff_advocates) {
                        let personId;
                        if (advocate.id && existingPlaintiffAdvocateIds.includes(advocate.id)) {
                            // Update existing plaintiff advocate
                            await connection.query(
                                `UPDATE proceeding_plaintiff_advocates 
                                SET person_id = ?
                                WHERE proceeding_id = ? AND person_id = ?`,
                                [advocate.id, procId, advocate.id]
                            );
                            personId = advocate.id;
                        } else {
                            // Create new plaintiff advocate
                            personId = await findOrCreatePerson(advocate, connection);
                            await connection.query(
                                `INSERT INTO proceeding_plaintiff_advocates 
                                (proceeding_id, person_id)
                                VALUES (?, ?)`,
                                [procId, personId]
                            );
                        }
                    }
                }

                if (proc.defendant_advocates?.length > 0) {
                    // First, get existing defendant advocates for this proceeding
                    const existingDefendantAdvocates = await connection.query(
                        'SELECT id FROM proceeding_defendant_advocates WHERE proceeding_id = ?',
                        [procId]
                    );
                    const existingDefendantAdvocateIds = existingDefendantAdvocates.map(a => a.person_id);

                    for (const advocate of proc.defendant_advocates) {
                        let personId;
                        if (advocate.id && existingDefendantAdvocateIds.includes(advocate.id)) {
                            // Update existing defendant advocate
                            await connection.query(
                                `UPDATE proceeding_defendant_advocates 
                                SET person_id = ?
                                WHERE proceeding_id = ? AND person_id = ?`,
                                [advocate.id, procId, advocate.id]
                            );
                            personId = advocate.id;
                        } else {
                            // Create new defendant advocate
                            personId = await findOrCreatePerson(advocate, connection);
                            await connection.query(
                                `INSERT INTO proceeding_defendant_advocates 
                                (proceeding_id, person_id)
                                VALUES (?, ?)`,
                                [procId, personId]
                            );
                        }
                    }
                }
            }
        }

        await connection.commit();
        res.status(200).json({
            message: 'Case updated successfully',
            case_id: caseId
        });

    } catch (err) {
        await connection.rollback();
        console.error('Error updating case:', err);

        if (err.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation error',
                errors: err.errors
            });
        }

        res.status(500).json({
            message: 'Error updating case',
            error: err.message
        });
    } finally {
        connection.release();
    }
});

// Delete case
adminRouter.delete('/cases/:id', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const caseId = req.params.id;

        // Verify case exists
        const [existingCase] = await connection.query(
            'SELECT id FROM cases WHERE id = ?',
            [caseId]
        );

        if (!existingCase) {
            return res.status(404).json({
                message: 'Case not found'
            });
        }

        // Delete all related records in correct order
        // 1. Delete investigating authorities
        await connection.query('DELETE FROM investigating_authorities WHERE case_id = ?', [caseId]);

        // 2. Delete evidences
        await connection.query('DELETE FROM evidences WHERE case_id = ?', [caseId]);

        // 3. Delete proceedings and related records
        const proceedings = await connection.query(
            'SELECT id FROM proceedings WHERE case_id = ?',
            [caseId]
        );
        for (const proc of proceedings) {
            await connection.query('DELETE FROM proceeding_other_documents WHERE proceeding_id = ?', [proc.id]);
            await connection.query('DELETE FROM proceeding_plaintiffs WHERE proceeding_id = ?', [proc.id]);
            await connection.query('DELETE FROM proceeding_plaintiff_advocates WHERE proceeding_id = ?', [proc.id]);
            await connection.query('DELETE FROM proceeding_defendants WHERE proceeding_id = ?', [proc.id]);
            await connection.query('DELETE FROM proceeding_defendant_advocates WHERE proceeding_id = ?', [proc.id]);
        }
        await connection.query('DELETE FROM proceedings WHERE case_id = ?', [caseId]);

        // 4. Delete incidents and related records
        const incidents = await connection.query(
            'SELECT id FROM incidents WHERE case_id = ?',
            [caseId]
        );
        for (const incident of incidents) {
            await connection.query('DELETE FROM incident_victims WHERE incident_id = ?', [incident.id]);
            await connection.query('DELETE FROM incident_witnesses WHERE incident_id = ?', [incident.id]);
            await connection.query('DELETE FROM incident_reports WHERE incident_id = ?', [incident.id]);
        }
        await connection.query('DELETE FROM incidents WHERE case_id = ?', [caseId]);

        // 5. Delete sentences and related records
        const sentences = await connection.query(
            'SELECT id FROM sentences WHERE case_id = ?',
            [caseId]
        );
        for (const sentence of sentences) {
            await connection.query('DELETE FROM sentence_people WHERE sentence_id = ?', [sentence.id]);
        }
        await connection.query('DELETE FROM sentences WHERE case_id = ?', [caseId]);

        // 6. Finally, delete the case itself
        await connection.query('DELETE FROM cases WHERE id = ?', [caseId]);

        await connection.commit();
        res.status(200).json({
            message: 'Case and all related records deleted successfully'
        });

    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(400).json({
            message: 'Error deleting case',
            error: err.message
        });
    } finally {
        connection.release();
    }
});

// Verify admin token validity
adminRouter.get('/verify-token', async (req, res) => {
    const adminToken = req.query.admin_token;

    if (!adminToken) {
        return res.status(401).json({
            message: 'Admin token is required as a query parameter',
            isValid: false
        });
    }

    try {
        const [token] = await pool.query(
            'SELECT * FROM admin_tokens WHERE token = ? AND is_active = true',
            [adminToken]
        );

        if (!token) {
            return res.status(200).json({
                message: 'Invalid or inactive admin token',
                isValid: false
            });
        }

        // Update last_used_at timestamp
        await pool.query(
            'UPDATE admin_tokens SET last_used_at = CURRENT_TIMESTAMP WHERE token = ?',
            [adminToken]
        );

        res.status(200).json({
            message: 'Token is valid',
            isValid: true
        });

    } catch (err) {
        console.error('Error verifying admin token:', err);
        res.status(500).json({
            message: 'Error verifying admin token',
            error: err.message,
            isValid: false
        });
    }
});

module.exports = adminRouter;
