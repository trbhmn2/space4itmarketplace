-- seed.sql
-- Mock host users and their listings for development

-- Deterministic UUIDs so foreign keys are easy to trace
-- Users:  u1–u6
-- Listings: l1–l6

INSERT INTO users (id, email, role_storer, role_host, verified, name, phone) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'emma.wilson@example.com',   false, true, true, 'Emma Wilson',    '+44 7700 100001'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'james.murray@example.com',  false, true, true, 'James Murray',   '+44 7700 100002'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'sofia.chen@example.com',    false, true, true, 'Sofia Chen',     '+44 7700 100003'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'lucas.brown@example.com',   false, true, true, 'Lucas Brown',    '+44 7700 100004'),
  ('a1b2c3d4-0005-4000-8000-000000000005', 'olivia.taylor@example.com', false, true, true, 'Olivia Taylor',  '+44 7700 100005'),
  ('a1b2c3d4-0006-4000-8000-000000000006', 'noah.anderson@example.com', false, true, true, 'Noah Anderson',  '+44 7700 100006');

INSERT INTO listings (id, host_id, title, area, item_categories, capacity, rules, photos, availability_start, availability_end, accepts_bikes, accepts_bulky, status) VALUES
  (
    'b1b2c3d4-0001-4000-8000-000000000001',
    'a1b2c3d4-0001-4000-8000-000000000001',
    'Spacious spare room — South Street',
    'South Street',
    ARRAY['boxes', 'suitcases', 'bikes'],
    15,
    'No flammable or perishable items. Access between 9am–8pm.',
    ARRAY['https://picsum.photos/seed/listing1a/800/600', 'https://picsum.photos/seed/listing1b/800/600'],
    '2025-06-01', '2025-09-15',
    true, true, 'active'
  ),
  (
    'b1b2c3d4-0002-4000-8000-000000000002',
    'a1b2c3d4-0002-4000-8000-000000000002',
    'Secure garage space — North Street',
    'North Street',
    ARRAY['boxes', 'suitcases'],
    10,
    'Items must be in sealed boxes. 24-hour access via key-safe.',
    ARRAY['https://picsum.photos/seed/listing2a/800/600'],
    '2025-06-01', '2025-09-15',
    false, true, 'active'
  ),
  (
    'b1b2c3d4-0003-4000-8000-000000000003',
    'a1b2c3d4-0003-4000-8000-000000000003',
    'Large basement storage — Market Street',
    'Market Street',
    ARRAY['boxes', 'suitcases', 'furniture'],
    20,
    'No liquids. Arrange drop-off time in advance via messages.',
    ARRAY['https://picsum.photos/seed/listing3a/800/600', 'https://picsum.photos/seed/listing3b/800/600'],
    '2025-06-01', '2025-09-15',
    false, true, 'active'
  ),
  (
    'b1b2c3d4-0004-4000-8000-000000000004',
    'a1b2c3d4-0004-4000-8000-000000000004',
    'Cosy cupboard under the stairs — The Scores',
    'The Scores',
    ARRAY['boxes', 'suitcases'],
    8,
    'Small items only. Available mornings before noon.',
    ARRAY['https://picsum.photos/seed/listing4a/800/600'],
    '2025-06-01', '2025-09-15',
    false, false, 'active'
  ),
  (
    'b1b2c3d4-0005-4000-8000-000000000005',
    'a1b2c3d4-0005-4000-8000-000000000005',
    'Double garage with bike racks — Hepburn Gardens',
    'Hepburn Gardens',
    ARRAY['boxes', 'suitcases', 'bikes', 'furniture'],
    12,
    'Bikes must be locked to the rack provided. No hazardous materials.',
    ARRAY['https://picsum.photos/seed/listing5a/800/600', 'https://picsum.photos/seed/listing5b/800/600'],
    '2025-06-01', '2025-09-15',
    true, true, 'active'
  ),
  (
    'b1b2c3d4-0006-4000-8000-000000000006',
    'a1b2c3d4-0006-4000-8000-000000000006',
    'Dry loft conversion — Argyle Street',
    'Argyle Street',
    ARRAY['boxes', 'suitcases', 'electronics'],
    18,
    'Climate-controlled space. Please wrap fragile items.',
    ARRAY['https://picsum.photos/seed/listing6a/800/600', 'https://picsum.photos/seed/listing6b/800/600'],
    '2025-06-01', '2025-09-15',
    false, true, 'active'
  );
