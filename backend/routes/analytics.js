const express = require('express');
const pool = require('../helpers/database');
const router = express.Router();

// Get trending cases based on recent activities
router.get('/trending', async (req, res) => {
    try {
        const query = `
            SELECT 
                c.id as case_id,
                c.case_name,
                GREATEST(
                    COALESCE(MAX(p.date_started), '1000-01-01'),
                    COALESCE(MAX(e.evidence_date_found), '1000-01-01'),
                    COALESCE(MAX(i.incident_date_from), '1000-01-01')
                ) as relevant_date,
                CASE 
                    WHEN MAX(p.date_started) >= GREATEST(
                        COALESCE(MAX(e.evidence_date_found), '1000-01-01'),
                        COALESCE(MAX(i.incident_date_from), '1000-01-01')
                    ) THEN CONCAT('New proceeding of type ', p.proceeding_type, ' started')
                    WHEN MAX(e.evidence_date_found) >= GREATEST(
                        COALESCE(MAX(p.date_started), '1000-01-01'),
                        COALESCE(MAX(i.incident_date_from), '1000-01-01')
                    ) THEN CONCAT('New evidence "', e.evidence_name, '" discovered at ', e.evidence_location)
                    ELSE CONCAT('New incident reported at ', i.incident_location)
                END as news
            FROM cases c
            LEFT JOIN proceedings p ON c.id = p.case_id
            LEFT JOIN evidences e ON c.id = e.case_id
            LEFT JOIN incidents i ON c.id = i.case_id
            GROUP BY c.id, c.case_name
            ORDER BY relevant_date DESC
            LIMIT 3`;

        const trendingCases = await pool.query(query);

        res.status(200).json({
            message: 'Trending cases fetched successfully',
            trending_cases: trendingCases
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Error fetching trending cases',
            error: err.message
        });
    }
});

// Get cases with their latest incident locations
router.get('/location', async (req, res) => {
    try {
        const query = `
            WITH LatestIncidents AS (
                SELECT 
                    i.case_id,
                    i.incident_location,
                    i.latitude,
                    i.longitude,
                    i.incident_date_from,
                    ROW_NUMBER() OVER (
                        PARTITION BY i.case_id 
                        ORDER BY i.incident_date_from DESC
                    ) as rn
                FROM incidents i
            )
            SELECT 
                c.id as case_id,
                c.case_name,
                c.case_type,
                li.incident_location,
                li.latitude,
                li.longitude,
                GREATEST(
                    COALESCE(MAX(p.date_started), '1000-01-01'),
                    COALESCE(MAX(e.evidence_date_found), '1000-01-01'),
                    COALESCE(MAX(i.incident_date_from), '1000-01-01')
                ) as latest_activity_date
            FROM cases c
            LEFT JOIN LatestIncidents li ON c.id = li.case_id AND li.rn = 1
            LEFT JOIN proceedings p ON c.id = p.case_id
            LEFT JOIN evidences e ON c.id = e.case_id
            LEFT JOIN incidents i ON c.id = i.case_id
            GROUP BY 
                c.id, 
                c.case_name, 
                c.case_type,
                li.incident_location,
                li.latitude,
                li.longitude
            HAVING li.latitude IS NOT NULL
            ORDER BY latest_activity_date DESC
            LIMIT 20`;

        const locationCases = await pool.query(query);

        res.status(200).json({
            message: 'Location-based cases fetched successfully',
            location_cases: locationCases
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Error fetching location-based cases',
            error: err.message
        });
    }
});

// Get cases grouped by type with their filing dates
router.get('/types', async (req, res) => {
    try {
        const query = `
            SELECT 
                case_type,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'case_id', id,
                        'date_filed', DATE_FORMAT(case_date_filed, '%Y-%m-%d')
                    )
                ) as cases_json
            FROM cases
            GROUP BY case_type
            ORDER BY case_type`;

        const typeStats = await pool.query(query);

        // Transform the data to ensure all case types are present
        const allCaseTypes = [
            'CRIMINAL', 'CIVIL', 'FAMILY', 'PROPERTY', 'CYBERCRIME',
            'FINANCIAL_FRAUD', 'MURDER', 'ROBBERY', 'ASSAULT',
            'DOMESTIC_VIOLENCE', 'TRAFFIC_VIOLATION', 'NARCOTICS',
            'CORRUPTION', 'TERRORISM', 'WHITE_COLLAR', 'ENVIRONMENTAL',
            'INTELLECTUAL_PROPERTY', 'LABOR_DISPUTE', 'CONSTITUTIONAL',
            'PUBLIC_INTEREST'
        ];

        // Ensure all case types are represented, even if they have no cases
        const completeTypeStats = allCaseTypes.map(type => {
            const existingType = typeStats.find(stat => stat.case_type === type);
            return {
                case_type: type,
                cases: existingType ? existingType.cases_json : []
            };
        });

        res.status(200).json({
            message: 'Case type statistics fetched successfully',
            type_statistics: completeTypeStats
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Error fetching case type statistics',
            error: err.message
        });
    }
});

module.exports = router;
