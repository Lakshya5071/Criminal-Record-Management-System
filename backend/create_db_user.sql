-- Create a new user for the backend application
CREATE USER 'judicialbackend' @'localhost' IDENTIFIED BY '1234';
-- Grant necessary permissions to the user for the judicial database
GRANT SELECT,
    INSERT,
    UPDATE,
    DELETE ON judicial.* TO 'judicialbackend' @'localhost';
-- Apply the privileges
FLUSH PRIVILEGES;