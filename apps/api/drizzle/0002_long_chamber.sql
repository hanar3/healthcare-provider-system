-- GIN index on clinics address to improve similarity search performance
CREATE INDEX clinic_address_trgm_idx ON clinics USING GIN (address gin_trgm_ops);
