-- Create database
CREATE DATABASE judicial;
USE judicial;
-- 1. Start with the most basic tables (no foreign keys)
CREATE TABLE authority (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    global_id VARCHAR(255) NOT NULL,
    authority_name VARCHAR(255) NOT NULL,
    authority_type ENUM (
        'POLICE',
        'HIGH COURT',
        'SUPREME COURT',
        'CBI',
        'NATIONAL CRIMINAL RECORD BUREAU',
        'NON GOVERNMENTAL ORGANIZATION',
        'DISTRICT COURT',
        'SPECIAL COURT'
    ) NOT NULL
);
CREATE TABLE people (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    person_name VARCHAR(255) NOT NULL,
    aadhaar_number VARCHAR(255),
    phone_number VARCHAR(255),
    person_address VARCHAR(255) NOT NULL,
    person_gender ENUM ('MALE', 'FEMALE', 'OTHER') NOT NULL,
    person_dob DATE NOT NULL
);
-- 2. Tables that depend only on authority and people
CREATE TABLE roles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(255) NOT NULL,
    is_authority BOOLEAN NOT NULL,
    authority_id BIGINT UNSIGNED,
    FOREIGN KEY (authority_id) REFERENCES authority(id)
);
CREATE TABLE people_roles (
    person_id BIGINT UNSIGNED NOT NULL,
    role_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (person_id, role_id),
    FOREIGN KEY (person_id) REFERENCES people(id),
    FOREIGN KEY (role_id) REFERENCES roles(id)
);
-- 3. Cases table (initially without some foreign keys)
CREATE TABLE cases (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    case_name VARCHAR(255) NOT NULL,
    case_status ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CLOSED') NOT NULL,
    case_description VARCHAR(1024) NOT NULL,
    case_date_filed DATE NOT NULL,
    case_date_closed DATE -- incident_id and sentence_id will be added later via ALTER TABLE
);
-- 4. Documents table (depends on cases)
CREATE TABLE documents (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    case_id BIGINT UNSIGNED,
    document_name VARCHAR(255) NOT NULL,
    document_type ENUM ('FIR', 'ADJUNCTION', 'SENTENCE', 'OTHER') NOT NULL,
    document_date DATE NOT NULL,
    document_content_url TEXT NOT NULL,
    FOREIGN KEY (case_id) REFERENCES cases(id)
);
-- 5. Incidents table and related tables
CREATE TABLE incidents (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    case_id BIGINT UNSIGNED NOT NULL,
    incident_report_id BIGINT UNSIGNED,
    incident_date_from DATE NOT NULL,
    incident_date_to DATE NOT NULL,
    incident_location VARCHAR(255) NOT NULL,
    incident_status VARCHAR(255) NOT NULL,
    FOREIGN KEY (case_id) REFERENCES cases(id),
    FOREIGN KEY (incident_report_id) REFERENCES documents(id)
);
CREATE TABLE incident_victims (
    incident_id BIGINT UNSIGNED NOT NULL,
    person_id BIGINT UNSIGNED NOT NULL,
    comments VARCHAR(1024),
    PRIMARY KEY (incident_id, person_id),
    FOREIGN KEY (incident_id) REFERENCES incidents(id),
    FOREIGN KEY (person_id) REFERENCES people(id)
);
CREATE TABLE incident_witnesses (
    incident_id BIGINT UNSIGNED NOT NULL,
    witness_id BIGINT UNSIGNED NOT NULL,
    comments VARCHAR(1024),
    PRIMARY KEY (incident_id, witness_id),
    FOREIGN KEY (incident_id) REFERENCES incidents(id),
    FOREIGN KEY (witness_id) REFERENCES people(id)
);
CREATE TABLE incident_reports (
    incident_id BIGINT UNSIGNED NOT NULL,
    document_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (incident_id, document_id),
    FOREIGN KEY (incident_id) REFERENCES incidents(id),
    FOREIGN KEY (document_id) REFERENCES documents(id)
);
-- Now we can add the incident_id foreign key to cases
ALTER TABLE cases
ADD incident_id BIGINT UNSIGNED,
    ADD FOREIGN KEY (incident_id) REFERENCES incidents(id);
-- 6. Sentences and related tables
CREATE TABLE sentences (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    case_id BIGINT UNSIGNED NOT NULL,
    sentence_date DATE NOT NULL,
    sentence_type ENUM (
        'PRISON',
        'LIFE_IMPRISONMENT',
        'DEATH_PENALTY',
        'HOUSE_ARREST',
        'PROBATION',
        'PAROLE',
        'COMMUNITY_SERVICE',
        'FINE',
        'RESTITUTION',
        'SUSPENDED_SENTENCE',
        'DEFERRED_SENTENCE',
        'REHABILITATION',
        'BANISHMENT',
        'CORPORAL_PUNISHMENT',
        'MILITARY_SERVICE',
        'OTHER'
    ) NOT NULL,
    sentence_duration INT NOT NULL,
    FOREIGN KEY (case_id) REFERENCES cases(id)
);
CREATE TABLE sentence_people (
    sentence_id BIGINT UNSIGNED NOT NULL,
    person_id BIGINT UNSIGNED NOT NULL,
    compliance_status ENUM (
        'PENDING',
        'IN_PROGRESS',
        'COMPLETED',
        'VIOLATED',
        'COMMUTED',
        'REVOKED',
        'EXPIRED'
    ) NOT NULL,
    compliance_notes TEXT,
    supervision_level ENUM (
        'NONE',
        'LOW',
        'MEDIUM',
        'HIGH',
        'MAXIMUM'
    ) NOT NULL,
    rehabilitation_status ENUM (
        'NOT_STARTED',
        'IN_PROGRESS',
        'COMPLETED',
        'FAILED'
    ) NOT NULL,
    appeal_status ENUM (
        'NONE',
        'FILED',
        'APPROVED',
        'DENIED',
        'UNDER_REVIEW'
    ) NOT NULL,
    PRIMARY KEY (sentence_id, person_id),
    FOREIGN KEY (sentence_id) REFERENCES sentences(id),
    FOREIGN KEY (person_id) REFERENCES people(id)
);
-- Add sentence_id foreign key to cases
ALTER TABLE cases
ADD sentence_id BIGINT UNSIGNED,
    ADD FOREIGN KEY (sentence_id) REFERENCES sentences(id);
-- 7. Proceedings and related tables
CREATE TABLE proceedings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    case_id BIGINT UNSIGNED NOT NULL,
    proceeding_type ENUM (
        'INVESTIGATION',
        'PRELIMINARY_HEARING',
        'GRAND_JURY',
        'MEDIATION',
        'ARBITRATION',
        'SETTLEMENT_CONFERENCE',
        'TRIAL',
        'BENCH_TRIAL',
        'JURY_TRIAL',
        'HEARING',
        'MOTION_HEARING',
        'APPEAL',
        'SUPREME_COURT_REVIEW',
        'SENTENCING',
        'POST_CONVICTION_REVIEW',
        'PAROLE_HEARING',
        'PROBATION_HEARING',
        'INJUNCTION_HEARING'
    ) NOT NULL,
    court_authority_id BIGINT UNSIGNED NOT NULL,
    transcript_id BIGINT UNSIGNED,
    proceeding_notes TEXT,
    judge_id BIGINT UNSIGNED NOT NULL,
    presiding_officers TEXT,
    date_started DATE NOT NULL,
    date_ended DATE,
    proceeding_status ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CLOSED') NOT NULL,
    FOREIGN KEY (case_id) REFERENCES cases(id),
    FOREIGN KEY (transcript_id) REFERENCES documents(id),
    FOREIGN KEY (court_authority_id) REFERENCES authority(id),
    FOREIGN KEY (judge_id) REFERENCES people(id)
);
CREATE TABLE proceeding_other_documents (
    proceeding_id BIGINT UNSIGNED NOT NULL,
    document_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (proceeding_id, document_id),
    FOREIGN KEY (proceeding_id) REFERENCES proceedings(id),
    FOREIGN KEY (document_id) REFERENCES documents(id)
);
CREATE TABLE proceeding_plaintiffs (
    proceeding_id BIGINT UNSIGNED NOT NULL,
    person_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (proceeding_id, person_id),
    FOREIGN KEY (proceeding_id) REFERENCES proceedings(id),
    FOREIGN KEY (person_id) REFERENCES people(id)
);
CREATE TABLE proceeding_plaintiff_advocates (
    proceeding_id BIGINT UNSIGNED NOT NULL,
    person_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (proceeding_id, person_id),
    FOREIGN KEY (proceeding_id) REFERENCES proceedings(id),
    FOREIGN KEY (person_id) REFERENCES people(id)
);
CREATE TABLE proceeding_defendants (
    proceeding_id BIGINT UNSIGNED NOT NULL,
    person_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (proceeding_id, person_id),
    FOREIGN KEY (proceeding_id) REFERENCES proceedings(id),
    FOREIGN KEY (person_id) REFERENCES people(id)
);
CREATE TABLE proceeding_defendant_advocates (
    proceeding_id BIGINT UNSIGNED NOT NULL,
    person_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (proceeding_id, person_id),
    FOREIGN KEY (proceeding_id) REFERENCES proceedings(id),
    FOREIGN KEY (person_id) REFERENCES people(id)
);
CREATE TABLE investigating_authorities (
    date_from DATE,
    date_to DATE,
    authority_id BIGINT UNSIGNED NOT NULL,
    case_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (authority_id, case_id),
    FOREIGN KEY (authority_id) REFERENCES authority(id),
    FOREIGN KEY (case_id) REFERENCES cases(id)
);
CREATE TABLE evidences (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    case_id BIGINT UNSIGNED NOT NULL,
    evidence_name VARCHAR(255) NOT NULL,
    evidence_description VARCHAR(1024) NOT NULL,
    evidence_date_found DATE NOT NULL,
    evidence_location VARCHAR(255) NOT NULL,
    FOREIGN KEY (case_id) REFERENCES cases(id)
);
-- Add location coordinates to incidents table
ALTER TABLE incidents
ADD latitude DECIMAL(10, 8) NOT NULL,
    ADD longitude DECIMAL(11, 8) NOT NULL;
-- Add case_type to cases table
ALTER TABLE cases
MODIFY COLUMN case_type ENUM(
        'CRIMINAL',
        'CIVIL',
        'FAMILY',
        'PROPERTY',
        'CYBERCRIME',
        'FINANCIAL_FRAUD',
        'MURDER',
        'ROBBERY',
        'ASSAULT',
        'DOMESTIC_VIOLENCE',
        'TRAFFIC_VIOLATION',
        'NARCOTICS',
        'CORRUPTION',
        'TERRORISM',
        'WHITE_COLLAR',
        'ENVIRONMENTAL',
        'INTELLECTUAL_PROPERTY',
        'LABOR_DISPUTE',
        'CONSTITUTIONAL',
        'PUBLIC_INTEREST'
    ) NOT NULL;
-- Update the sample bank robbery case to use the correct ENUM value
UPDATE cases
SET case_type = 'ROBBERY'
WHERE case_name LIKE '%Bank Robbery%';
-- Create admin_tokens table
CREATE TABLE admin_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP NULL,
    description VARCHAR(255) -- Optional description of what/who the token is for
);
-- Insert some sample tokens
INSERT INTO admin_tokens (token, description)
VALUES (
        'admin_token_12345_dev',
        'Development environment admin token'
    ),
    (
        'admin_token_67890_prod',
        'Production environment admin token'
    );