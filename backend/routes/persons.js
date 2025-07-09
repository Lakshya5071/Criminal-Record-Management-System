const express = require('express');
const pool = require('../helpers/database');
const router = express.Router();

// Get all persons with their case associations
router.get('/', async (req, res) => {
    try {
        const search = req.query.search?.trim() || '';

        const baseQuery = `
            SELECT DISTINCT
                p.id,
                p.person_name,
                p.aadhaar_number,
                p.phone_number,
                p.person_address,
                p.person_gender,
                p.person_dob,
                
                -- Victim associations
                iv.incident_id as victim_incident_id,
                iv.comments as victim_comments,
                vic_case.id as victim_case_id,
                vic_case.case_name as victim_case_name,
                
                -- Witness associations
                iw.incident_id as witness_incident_id,
                iw.comments as witness_comments,
                wit_case.id as witness_case_id,
                wit_case.case_name as witness_case_name,
                
                -- Judge associations
                proc_judge.id as judge_proceeding_id,
                judge_case.id as judge_case_id,
                judge_case.case_name as judge_case_name,
                
                -- Plaintiff associations
                pp.proceeding_id as plaintiff_proceeding_id,
                plaintiff_case.id as plaintiff_case_id,
                plaintiff_case.case_name as plaintiff_case_name,
                
                -- Plaintiff advocate associations
                ppa.proceeding_id as plaintiff_advocate_proceeding_id,
                pa_case.id as plaintiff_advocate_case_id,
                pa_case.case_name as plaintiff_advocate_case_name,
                
                -- Defendant associations
                pd.proceeding_id as defendant_proceeding_id,
                defendant_case.id as defendant_case_id,
                defendant_case.case_name as defendant_case_name,
                
                -- Defendant advocate associations
                pda.proceeding_id as defendant_advocate_proceeding_id,
                da_case.id as defendant_advocate_case_id,
                da_case.case_name as defendant_advocate_case_name,
                
                -- Sentenced person associations
                sp.sentence_id,
                sp.compliance_status,
                sp.supervision_level,
                sp.rehabilitation_status,
                sp.appeal_status,
                sentenced_case.id as sentenced_case_id,
                sentenced_case.case_name as sentenced_case_name

            FROM people p
            -- Victim associations
            LEFT JOIN incident_victims iv ON p.id = iv.person_id
            LEFT JOIN incidents vic_inc ON iv.incident_id = vic_inc.id
            LEFT JOIN cases vic_case ON vic_inc.case_id = vic_case.id
            
            -- Witness associations
            LEFT JOIN incident_witnesses iw ON p.id = iw.witness_id
            LEFT JOIN incidents wit_inc ON iw.incident_id = wit_inc.id
            LEFT JOIN cases wit_case ON wit_inc.case_id = wit_case.id
            
            -- Judge associations
            LEFT JOIN proceedings proc_judge ON p.id = proc_judge.judge_id
            LEFT JOIN cases judge_case ON proc_judge.case_id = judge_case.id
            
            -- Plaintiff associations
            LEFT JOIN proceeding_plaintiffs pp ON p.id = pp.person_id
            LEFT JOIN proceedings proc_plaintiff ON pp.proceeding_id = proc_plaintiff.id
            LEFT JOIN cases plaintiff_case ON proc_plaintiff.case_id = plaintiff_case.id
            
            -- Plaintiff advocate associations
            LEFT JOIN proceeding_plaintiff_advocates ppa ON p.id = ppa.person_id
            LEFT JOIN proceedings proc_pa ON ppa.proceeding_id = proc_pa.id
            LEFT JOIN cases pa_case ON proc_pa.case_id = pa_case.id
            
            -- Defendant associations
            LEFT JOIN proceeding_defendants pd ON p.id = pd.person_id
            LEFT JOIN proceedings proc_defendant ON pd.proceeding_id = proc_defendant.id
            LEFT JOIN cases defendant_case ON proc_defendant.case_id = defendant_case.id
            
            -- Defendant advocate associations
            LEFT JOIN proceeding_defendant_advocates pda ON p.id = pda.person_id
            LEFT JOIN proceedings proc_da ON pda.proceeding_id = proc_da.id
            LEFT JOIN cases da_case ON proc_da.case_id = da_case.id
            
            -- Sentenced person associations
            LEFT JOIN sentence_people sp ON p.id = sp.person_id
            LEFT JOIN sentences s ON sp.sentence_id = s.id
            LEFT JOIN cases sentenced_case ON s.case_id = sentenced_case.id`;

        let whereClause = '';
        let params = [];

        if (search) {
            whereClause = `
            WHERE 
                p.person_name LIKE ? OR 
                p.aadhaar_number LIKE ? OR 
                p.phone_number LIKE ? OR
                p.person_address LIKE ?`;

            params = [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`];
        }

        const orderClause = ` ORDER BY p.person_name`;
        const finalQuery = baseQuery + whereClause + orderClause;

        const people = await pool.query(finalQuery, params);

        // Restructure the data for better readability
        const restructuredPeople = people.reduce((acc, person) => {
            if (!acc[person.id]) {
                acc[person.id] = {
                    id: person.id,
                    person_name: person.person_name,
                    aadhaar_number: person.aadhaar_number,
                    phone_number: person.phone_number,
                    person_address: person.person_address,
                    person_gender: person.person_gender,
                    person_dob: person.person_dob,
                    case_associations: []
                };
            }

            // Add victim role
            if (person.victim_case_id) {
                acc[person.id].case_associations.push({
                    role: 'VICTIM',
                    case_id: person.victim_case_id,
                    case_name: person.victim_case_name,
                    incident_id: person.victim_incident_id,
                    comments: person.victim_comments
                });
            }

            // Add witness role
            if (person.witness_case_id) {
                acc[person.id].case_associations.push({
                    role: 'WITNESS',
                    case_id: person.witness_case_id,
                    case_name: person.witness_case_name,
                    incident_id: person.witness_incident_id,
                    comments: person.witness_comments
                });
            }

            // Add judge role
            if (person.judge_case_id) {
                acc[person.id].case_associations.push({
                    role: 'JUDGE',
                    case_id: person.judge_case_id,
                    case_name: person.judge_case_name,
                    proceeding_id: person.judge_proceeding_id
                });
            }

            // Add plaintiff role
            if (person.plaintiff_case_id) {
                acc[person.id].case_associations.push({
                    role: 'PLAINTIFF',
                    case_id: person.plaintiff_case_id,
                    case_name: person.plaintiff_case_name,
                    proceeding_id: person.plaintiff_proceeding_id
                });
            }

            // Add plaintiff advocate role
            if (person.plaintiff_advocate_case_id) {
                acc[person.id].case_associations.push({
                    role: 'PLAINTIFF_ADVOCATE',
                    case_id: person.plaintiff_advocate_case_id,
                    case_name: person.plaintiff_advocate_case_name,
                    proceeding_id: person.plaintiff_advocate_proceeding_id
                });
            }

            // Add defendant role
            if (person.defendant_case_id) {
                acc[person.id].case_associations.push({
                    role: 'DEFENDANT',
                    case_id: person.defendant_case_id,
                    case_name: person.defendant_case_name,
                    proceeding_id: person.defendant_proceeding_id
                });
            }

            // Add defendant advocate role
            if (person.defendant_advocate_case_id) {
                acc[person.id].case_associations.push({
                    role: 'DEFENDANT_ADVOCATE',
                    case_id: person.defendant_advocate_case_id,
                    case_name: person.defendant_advocate_case_name,
                    proceeding_id: person.defendant_advocate_proceeding_id
                });
            }

            // Add sentenced person role
            if (person.sentenced_case_id) {
                acc[person.id].case_associations.push({
                    role: 'SENTENCED',
                    case_id: person.sentenced_case_id,
                    case_name: person.sentenced_case_name,
                    sentence_id: person.sentence_id,
                    compliance_status: person.compliance_status,
                    supervision_level: person.supervision_level,
                    rehabilitation_status: person.rehabilitation_status,
                    appeal_status: person.appeal_status
                });
            }

            return acc;
        }, {});

        res.status(200).json({
            message: 'People fetched successfully',
            people: Object.values(restructuredPeople)
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Error fetching people',
            error: err.message
        });
    }
});

module.exports = router;
