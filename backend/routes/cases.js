const express = require('express');
const pool = require('../helpers/database');
const router = express.Router();

// Get all cases with optional filters
router.get('/', async (req, res) => {
    try {
        const search = req.query.search?.trim() || '';
        const type = req.query.type?.trim();
        const dateAfter = req.query.date_after?.trim();
        const dateBefore = req.query.date_before?.trim();
        const status = req.query.status?.trim();

        const baseQuery = `
            SELECT DISTINCT c.* 
            FROM cases c
            LEFT JOIN incidents i ON c.id = i.case_id
            LEFT JOIN sentences s ON c.id = s.case_id
            LEFT JOIN sentence_people sp ON s.id = sp.sentence_id
            LEFT JOIN people sentenced ON sp.person_id = sentenced.id
            LEFT JOIN incident_victims iv ON i.id = iv.incident_id
            LEFT JOIN people victims ON iv.person_id = victims.id
            LEFT JOIN incident_witnesses iw ON i.id = iw.incident_id
            LEFT JOIN people witnesses ON iw.witness_id = witnesses.id
            LEFT JOIN proceedings proc ON c.id = proc.case_id
            LEFT JOIN people judges ON proc.judge_id = judges.id
            LEFT JOIN proceeding_plaintiffs pp ON proc.id = pp.proceeding_id
            LEFT JOIN people plaintiffs ON pp.person_id = plaintiffs.id
            LEFT JOIN proceeding_plaintiff_advocates ppa ON proc.id = ppa.proceeding_id
            LEFT JOIN people plaintiff_advocates ON ppa.person_id = plaintiff_advocates.id
            LEFT JOIN proceeding_defendants pd ON proc.id = pd.proceeding_id
            LEFT JOIN people defendants ON pd.person_id = defendants.id
            LEFT JOIN proceeding_defendant_advocates pda ON proc.id = pda.proceeding_id
            LEFT JOIN people defendant_advocates ON pda.person_id = defendant_advocates.id`;

        let whereClause = '';
        let params = [];
        let conditions = [];

        if (search) {
            conditions.push(`(
                c.case_name LIKE ? OR
                c.case_type LIKE ? OR
                c.case_status LIKE ? OR
                c.case_description LIKE ? OR
                EXISTS (
                    SELECT 1 FROM investigating_authorities ia 
                    JOIN authority a ON ia.authority_id = a.id 
                    WHERE ia.case_id = c.id AND a.authority_name LIKE ?
                ) OR
                EXISTS (
                    SELECT 1 FROM proceedings proc2 
                    WHERE proc2.case_id = c.id AND proc2.proceeding_type LIKE ?
                ) OR
                EXISTS (
                    SELECT 1 FROM documents d 
                    WHERE d.case_id = c.id AND d.document_name LIKE ?
                ) OR
                EXISTS (
                    SELECT 1 FROM evidences e 
                    WHERE e.case_id = c.id AND 
                    (e.evidence_name LIKE ? OR e.evidence_description LIKE ?)
                ) OR
                i.incident_location LIKE ? OR
                sentenced.person_name LIKE ? OR
                victims.person_name LIKE ? OR
                witnesses.person_name LIKE ? OR
                judges.person_name LIKE ? OR
                plaintiffs.person_name LIKE ? OR
                plaintiff_advocates.person_name LIKE ? OR
                defendants.person_name LIKE ? OR
                defendant_advocates.person_name LIKE ?
            )`);
            const searchPattern = `%${search}%`;
            params.push(...Array(18).fill(searchPattern));
        }

        if (type) {
            conditions.push('c.case_type = ?');
            params.push(type);
        }

        if (dateAfter) {
            conditions.push('c.case_date_filed >= ?');
            params.push(dateAfter);
        }

        if (dateBefore) {
            conditions.push('c.case_date_filed <= ?');
            params.push(dateBefore);
        }

        if (status) {
            conditions.push('c.case_status = ?');
            params.push(status);
        }

        if (conditions.length > 0) {
            whereClause = ' WHERE ' + conditions.join(' AND ');
        }

        const orderClause = ` ORDER BY c.case_date_filed DESC`;
        const finalQuery = baseQuery + whereClause + orderClause;

        const cases = await pool.query(finalQuery, params);

        res.status(200).json({
            message: 'Cases fetched successfully',
            cases: cases
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Error fetching cases',
            error: err.message
        });
    }
});

// Get case details by ID
router.get('/:id', async (req, res) => {
    try {
        // 1. Get main case details
        const caseQuery = 'SELECT * FROM cases WHERE id = ?';
        const [caseDetails] = await pool.query(caseQuery, [req.params.id]);

        if (!caseDetails) {
            return res.status(404).json({
                message: 'Case not found'
            });
        }

        // 2. Get incidents with victims and witnesses
        const incidentsQuery = `
            SELECT 
                i.*,
                d.id as report_id,
                d.document_name as report_name,
                d.document_type as report_type,
                d.document_date as report_date,
                d.document_content_url as report_url
            FROM incidents i
            LEFT JOIN documents d ON i.incident_report_id = d.id
            WHERE i.case_id = ?`;
        const incidents = await pool.query(incidentsQuery, [req.params.id]);

        // For each incident, get victims and witnesses
        for (let incident of incidents) {
            // Get victims with full person details
            const victimsQuery = `
                SELECT 
                    p.*,
                    iv.comments
                FROM incident_victims iv
                JOIN people p ON iv.person_id = p.id
                WHERE iv.incident_id = ?`;
            incident.victims = await pool.query(victimsQuery, [incident.id]);

            // Get witnesses with full person details
            const witnessesQuery = `
                SELECT 
                    p.*,
                    iw.comments
                FROM incident_witnesses iw
                JOIN people p ON iw.witness_id = p.id
                WHERE iw.incident_id = ?`;
            incident.witnesses = await pool.query(witnessesQuery, [incident.id]);

            // Restructure report data
            if (incident.report_id) {
                incident.report = {
                    document_name: incident.report_name,
                    document_type: incident.report_type,
                    document_date: incident.report_date,
                    document_content_url: incident.report_url
                };
            }
            // Clean up redundant fields
            delete incident.report_id;
            delete incident.report_name;
            delete incident.report_type;
            delete incident.report_date;
            delete incident.report_url;
        }

        // 3. Get evidences
        const evidencesQuery = `
            SELECT * FROM evidences 
            WHERE case_id = ?`;
        const evidences = await pool.query(evidencesQuery, [req.params.id]);

        // 4. Get sentences with sentenced people
        const sentencesQuery = `
            SELECT * FROM sentences 
            WHERE case_id = ?`;
        const sentences = await pool.query(sentencesQuery, [req.params.id]);

        // For each sentence, get sentenced people with full person details
        for (let sentence of sentences) {
            const sentencedPeopleQuery = `
                SELECT 
                    p.*,
                    sp.compliance_status,
                    sp.compliance_notes,
                    sp.supervision_level,
                    sp.rehabilitation_status,
                    sp.appeal_status
                FROM sentence_people sp
                JOIN people p ON sp.person_id = p.id
                WHERE sp.sentence_id = ?`;
            const sentenced_people = await pool.query(sentencedPeopleQuery, [sentence.id]);

            // Restructure each sentenced person
            sentence.sentenced_people = sentenced_people.map(sp => ({
                person: {
                    id: sp.id,
                    person_name: sp.person_name,
                    aadhaar_number: sp.aadhaar_number,
                    phone_number: sp.phone_number,
                    person_address: sp.person_address,
                    person_gender: sp.person_gender,
                    person_dob: sp.person_dob
                },
                compliance_status: sp.compliance_status,
                compliance_notes: sp.compliance_notes,
                supervision_level: sp.supervision_level,
                rehabilitation_status: sp.rehabilitation_status,
                appeal_status: sp.appeal_status
            }));
        }

        // 5. Get investigating authorities with full authority details
        const authoritiesQuery = `
            SELECT 
                a.*,
                ia.date_from,
                ia.date_to
            FROM investigating_authorities ia
            JOIN authority a ON ia.authority_id = a.id
            WHERE ia.case_id = ?`;
        const investigating_authorities = await pool.query(authoritiesQuery, [req.params.id]);

        // Restructure each authority
        const restructured_authorities = investigating_authorities.map(ia => ({
            authority: {
                id: ia.id,
                global_id: ia.global_id,
                authority_name: ia.authority_name,
                authority_type: ia.authority_type
            },
            date_from: ia.date_from,
            date_to: ia.date_to
        }));

        // 6. Get proceedings with all related details
        const proceedingsQuery = `
            SELECT 
                p.id,
                p.case_id,
                p.proceeding_type,
                p.proceeding_notes,
                p.presiding_officers,
                p.date_started,
                p.date_ended,
                p.proceeding_status,
                
                -- Court Authority details
                a.id as authority_id,
                a.global_id as authority_global_id,
                a.authority_name,
                a.authority_type,
                
                -- Judge details
                j.id as judge_person_id,
                j.person_name as judge_name,
                j.aadhaar_number as judge_aadhaar,
                j.phone_number as judge_phone,
                j.person_address as judge_address,
                j.person_gender as judge_gender,
                j.person_dob as judge_dob,
                
                -- Transcript details
                d.id as doc_id,
                d.document_name,
                d.document_type,
                d.document_date,
                d.document_content_url
            FROM proceedings p
            LEFT JOIN authority a ON p.court_authority_id = a.id
            LEFT JOIN people j ON p.judge_id = j.id
            LEFT JOIN documents d ON p.transcript_id = d.id
            WHERE p.case_id = ?`;
        const proceedings = await pool.query(proceedingsQuery, [req.params.id]);

        // For each proceeding, get all related details
        for (let proceeding of proceedings) {
            // Get other documents
            const otherDocsQuery = `
                SELECT d.*
                FROM proceeding_other_documents pod
                JOIN documents d ON pod.document_id = d.id
                WHERE pod.proceeding_id = ?`;
            proceeding.other_documents = await pool.query(otherDocsQuery, [proceeding.id]);

            // Get plaintiffs
            const plaintiffsQuery = `
                SELECT p.*
                FROM proceeding_plaintiffs pp
                JOIN people p ON pp.person_id = p.id
                WHERE pp.proceeding_id = ?`;
            proceeding.plaintiffs = await pool.query(plaintiffsQuery, [proceeding.id]);

            // Get plaintiff advocates
            const plaintiffAdvocatesQuery = `
                SELECT p.*
                FROM proceeding_plaintiff_advocates ppa
                JOIN people p ON ppa.person_id = p.id
                WHERE ppa.proceeding_id = ?`;
            proceeding.plaintiff_advocates = await pool.query(plaintiffAdvocatesQuery, [proceeding.id]);

            // Get defendants
            const defendantsQuery = `
                SELECT p.*
                FROM proceeding_defendants pd
                JOIN people p ON pd.person_id = p.id
                WHERE pd.proceeding_id = ?`;
            proceeding.defendants = await pool.query(defendantsQuery, [proceeding.id]);

            // Get defendant advocates
            const defendantAdvocatesQuery = `
                SELECT p.*
                FROM proceeding_defendant_advocates pda
                JOIN people p ON pda.person_id = p.id
                WHERE pda.proceeding_id = ?`;
            proceeding.defendant_advocates = await pool.query(defendantAdvocatesQuery, [proceeding.id]);

            // Restructure proceeding data
            proceeding.court_authority = {
                id: proceeding.authority_id,
                global_id: proceeding.authority_global_id,
                authority_name: proceeding.authority_name,
                authority_type: proceeding.authority_type
            };

            proceeding.judge = {
                id: proceeding.judge_person_id,
                person_name: proceeding.judge_name,
                aadhaar_number: proceeding.judge_aadhaar,
                phone_number: proceeding.judge_phone,
                person_address: proceeding.judge_address,
                person_gender: proceeding.judge_gender,
                person_dob: proceeding.judge_dob
            };

            if (proceeding.doc_id) {
                proceeding.transcript = {
                    id: proceeding.doc_id,
                    document_name: proceeding.document_name,
                    document_type: proceeding.document_type,
                    document_date: proceeding.document_date,
                    document_content_url: proceeding.document_content_url
                };
            }

            // Clean up redundant fields
            delete proceeding.authority_id;
            delete proceeding.authority_global_id;
            delete proceeding.authority_name;
            delete proceeding.authority_type;
            delete proceeding.judge_person_id;
            delete proceeding.judge_name;
            delete proceeding.judge_aadhaar;
            delete proceeding.judge_phone;
            delete proceeding.judge_address;
            delete proceeding.judge_gender;
            delete proceeding.judge_dob;
            delete proceeding.doc_id;
            delete proceeding.document_name;
            delete proceeding.document_type;
            delete proceeding.document_date;
            delete proceeding.document_content_url;
        }

        // Construct the final response
        res.status(200).json({
            message: 'Case details fetched successfully',
            case: {
                ...caseDetails,
                incidents,
                evidences,
                sentences,
                investigating_authorities: restructured_authorities,
                proceedings
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Error fetching case details',
            error: err.message
        });
    }
});

module.exports = router;
