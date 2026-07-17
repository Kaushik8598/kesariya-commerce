INSERT INTO "countries" ("id", "name", "iso2", "iso3", "phone_code", "currency_code", "currency_name", "currency_symbol", "timezone", "sort_order", "updated_at") 
VALUES ('cuid_country_in', 'India', 'IN', 'IND', '+91', 'INR', 'Indian Rupee', '₹', 'Asia/Kolkata', 1, NOW())
ON CONFLICT ("iso2") DO NOTHING;

INSERT INTO "states" ("id", "country_id", "name", "code", "updated_at")
VALUES ('cuid_state_gj', 'cuid_country_in', 'Gujarat', 'GJ', NOW())
ON CONFLICT DO NOTHING;

INSERT INTO "cities" ("id", "state_id", "name", "updated_at")
VALUES ('cuid_city_surat', 'cuid_state_gj', 'Surat', NOW())
ON CONFLICT DO NOTHING;
