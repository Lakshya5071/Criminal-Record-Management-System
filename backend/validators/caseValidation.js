const Joi = require('joi');

// Enum values matching database schema
const ENUMS = {
    CASE_STATUS: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CLOSED'],
    CASE_TYPE: [
        'CRIMINAL', 'CIVIL', 'FAMILY', 'PROPERTY', 'CYBERCRIME',
        'FINANCIAL_FRAUD', 'MURDER', 'ROBBERY', 'ASSAULT',
        'DOMESTIC_VIOLENCE', 'TRAFFIC_VIOLATION', 'NARCOTICS',
        'CORRUPTION', 'TERRORISM', 'WHITE_COLLAR', 'ENVIRONMENTAL',
        'INTELLECTUAL_PROPERTY', 'LABOR_DISPUTE', 'CONSTITUTIONAL',
        'PUBLIC_INTEREST'
    ],
    DOCUMENT_TYPE: ['FIR', 'ADJUNCTION', 'SENTENCE', 'OTHER'],
    PERSON_GENDER: ['MALE', 'FEMALE', 'OTHER'],
    AUTHORITY_TYPE: [
        'POLICE', 'HIGH COURT', 'SUPREME COURT', 'CBI',
        'NATIONAL CRIMINAL RECORD BUREAU', 'NON GOVERNMENTAL ORGANIZATION',
        'DISTRICT COURT', 'SPECIAL COURT'
    ],
    PROCEEDING_TYPE: [
        'INVESTIGATION', 'PRELIMINARY_HEARING', 'GRAND_JURY', 'MEDIATION',
        'ARBITRATION', 'SETTLEMENT_CONFERENCE', 'TRIAL', 'BENCH_TRIAL',
        'JURY_TRIAL', 'HEARING', 'MOTION_HEARING', 'APPEAL',
        'SUPREME_COURT_REVIEW', 'SENTENCING', 'POST_CONVICTION_REVIEW',
        'PAROLE_HEARING', 'PROBATION_HEARING', 'INJUNCTION_HEARING'
    ],
    PROCEEDING_STATUS: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CLOSED'],
    SENTENCE_TYPE: [
        'PRISON', 'LIFE_IMPRISONMENT', 'DEATH_PENALTY', 'HOUSE_ARREST',
        'PROBATION', 'PAROLE', 'COMMUNITY_SERVICE', 'FINE', 'RESTITUTION',
        'SUSPENDED_SENTENCE', 'DEFERRED_SENTENCE', 'REHABILITATION',
        'BANISHMENT', 'CORPORAL_PUNISHMENT', 'MILITARY_SERVICE', 'OTHER'
    ],
    COMPLIANCE_STATUS: [
        'PENDING', 'IN_PROGRESS', 'COMPLETED', 'VIOLATED',
        'COMMUTED', 'REVOKED', 'EXPIRED'
    ],
    SUPERVISION_LEVEL: ['NONE', 'LOW', 'MEDIUM', 'HIGH', 'MAXIMUM'],
    REHABILITATION_STATUS: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'FAILED'],
    APPEAL_STATUS: ['NONE', 'FILED', 'APPROVED', 'DENIED', 'UNDER_REVIEW']
};

// Reusable schemas
const personSchema = Joi.object({
    person_name: Joi.string().required(),
    aadhaar_number: Joi.string().pattern(/^\d{4}-\d{4}-\d{4}$/),
    phone_number: Joi.string(),
    person_address: Joi.string().required(),
    person_gender: Joi.string().valid(...ENUMS.PERSON_GENDER).required(),
    person_dob: Joi.date().iso().required()
});

const documentSchema = Joi.object({
    document_name: Joi.string().required(),
    document_type: Joi.string().valid(...ENUMS.DOCUMENT_TYPE).required(),
    document_date: Joi.date().iso().required(),
    document_content_url: Joi.string().uri().required()
});

const authoritySchema = Joi.object({
    authority_name: Joi.string().required(),
    authority_type: Joi.string().valid(...ENUMS.AUTHORITY_TYPE).required(),
    global_id: Joi.string().required()
});

// Main case validation schema
const caseValidationSchema = Joi.object({
    case_name: Joi.string().required(),
    case_status: Joi.string().valid(...ENUMS.CASE_STATUS).required(),
    case_type: Joi.string().valid(...ENUMS.CASE_TYPE).required(),
    case_description: Joi.string().required(),
    case_date_filed: Joi.date().iso().required(),
    case_date_closed: Joi.date().iso().allow(null),

    incidents: Joi.array().items(Joi.object({
        incident_date_from: Joi.date().iso().required(),
        incident_date_to: Joi.date().iso().required(),
        incident_location: Joi.string().required(),
        incident_status: Joi.string().required(),
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
        victims: Joi.array().items(Joi.object({
            person: personSchema,
            comments: Joi.string()
        })),
        witnesses: Joi.array().items(Joi.object({
            person: personSchema,
            comments: Joi.string()
        })),
        report: documentSchema
    })),

    evidences: Joi.array().items(Joi.object({
        evidence_name: Joi.string().required(),
        evidence_description: Joi.string().required(),
        evidence_date_found: Joi.date().iso().required(),
        evidence_location: Joi.string().required()
    })),

    sentences: Joi.array().items(Joi.object({
        sentence_date: Joi.date().iso().required(),
        sentence_type: Joi.string().valid(...ENUMS.SENTENCE_TYPE).required(),
        sentence_duration: Joi.number().integer().min(0).required(),
        sentenced_people: Joi.array().items(Joi.object({
            person: personSchema,
            compliance_status: Joi.string().valid(...ENUMS.COMPLIANCE_STATUS).required(),
            compliance_notes: Joi.string(),
            supervision_level: Joi.string().valid(...ENUMS.SUPERVISION_LEVEL).required(),
            rehabilitation_status: Joi.string().valid(...ENUMS.REHABILITATION_STATUS).required(),
            appeal_status: Joi.string().valid(...ENUMS.APPEAL_STATUS).required()
        }))
    })),

    investigating_authorities: Joi.array().items(Joi.object({
        authority: authoritySchema,
        date_from: Joi.date().iso().required(),
        date_to: Joi.date().iso().allow(null)
    })),

    proceedings: Joi.array().items(Joi.object({
        proceeding_type: Joi.string().valid(...ENUMS.PROCEEDING_TYPE).required(),
        proceeding_status: Joi.string().valid(...ENUMS.PROCEEDING_STATUS).required(),
        date_started: Joi.date().iso().required(),
        date_ended: Joi.date().iso().allow(null),
        court_authority: authoritySchema,
        presiding_officers: Joi.string().required(),
        proceeding_notes: Joi.string(),
        judge: personSchema,
        transcript: documentSchema,
        other_documents: Joi.array().items(documentSchema),
        plaintiffs: Joi.array().items(personSchema),
        plaintiff_advocates: Joi.array().items(personSchema),
        defendants: Joi.array().items(personSchema),
        defendant_advocates: Joi.array().items(personSchema)
    }))
});

// Validation function
function validateCaseData(caseData) {
    const { error, value } = caseValidationSchema.validate(caseData, {
        abortEarly: false,
        stripUnknown: true
    });

    if (error) {
        const errors = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
        }));
        throw {
            name: 'ValidationError',
            message: 'Case data validation failed',
            errors
        };
    }

    return value;
}

module.exports = {
    validateCaseData,
    ENUMS
}; 