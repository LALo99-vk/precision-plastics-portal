-- Insert Initial Products from Images Folder
-- This script adds all products that have images in /public/images/products
-- Products are set as published and available by default
-- Admin can edit or delete these products later

-- First, ensure product_categories exist (they should already exist from supabase-setup.sql)
-- This is just a safety check
INSERT INTO product_categories (id, name, description, productCount)
VALUES 
  ('laminated-sheets', 'Laminated Sheets', 'Engineered plastic and composite laminate sheets for industrial applications', 0),
  ('heat-resistant-rods', 'Heat Resistant Rods', 'High-performance rods designed for thermal and mechanical resistance', 0),
  ('acrylic-sheets', 'Acrylic Sheets', 'Transparent and opaque acrylic sheets for glazing and display applications', 0),
  ('pvc-products', 'PVC Products', 'PVC-based boards and profiles for cutting, clicking and general purpose use', 0),
  ('pvc-curtain-rolls', 'PVC Curtain Rolls', 'Flexible PVC strip curtain rolls for industrial doors and partitions', 0),
  ('polyurethane-cords', 'Polyurethane Cords', 'Durable polyurethane cords for mechanical and conveying applications', 0),
  ('pvc-folding-bed-shoe-moulds', 'PVC Folding Bed Shoe Moulds', 'Precision PVC moulds for folding bed shoe and related applications', 0),
  ('acrylic-tubes', 'Acrylic Tubes', 'Clear acrylic tubes for display, guarding and flow visualization', 0),
  ('ptfe-bushes', 'PTFE Bushes', 'Low-friction PTFE bushes for sliding and bearing applications', 0),
  ('peek-tubes', 'PEEK Tubes', 'High-temperature, chemically resistant PEEK tubes for critical services', 0)
ON CONFLICT (id) DO NOTHING;

-- LAMINATED SHEETS (25 products)
INSERT INTO products (name, category, description, image, status, available, price_on_request, properties, materials, industries)
VALUES
  ('Cast Nylon Sheet', 'Laminated Sheets', 'High-strength cast nylon sheet with excellent wear resistance and dimensional stability. Ideal for bearings, gears, and mechanical components.', '/images/products/laminated-sheets/cast-nylon-sheet-500x500.jpg', 'published', true, false, '{"thermal": true, "electrical": false, "chemical": true}', ARRAY['Cast Nylon', 'PA'], ARRAY['Mechanical', 'Automotive']),
  
  ('Cast Nylon Rods & Sheets', 'Laminated Sheets', 'Versatile cast nylon material available in both rod and sheet forms. Superior mechanical properties for industrial applications.', '/images/products/laminated-sheets/cast-nylon-rods-sheets-500x500.jpg', 'published', true, false, '{"thermal": true, "electrical": false, "chemical": true}', ARRAY['Cast Nylon', 'PA'], ARRAY['Mechanical', 'Industrial']),
  
  ('Delrin Black Sheet', 'Laminated Sheets', 'Black Delrin (POM) sheet with low friction and high stiffness. Perfect for precision parts and sliding applications.', '/images/products/laminated-sheets/delrin-black-sheets-500x500.jpg', 'published', true, false, '{"thermal": true, "electrical": false, "chemical": true}', ARRAY['Delrin', 'POM'], ARRAY['Mechanical', 'Electronics']),
  
  ('Delrin POM Polyacetal Sheet', 'Laminated Sheets', 'Premium polyacetal sheet offering excellent dimensional stability and low moisture absorption.', '/images/products/laminated-sheets/delrin-pom-polyacetal-sheets-500x500.jpg', 'published', true, false, '{"thermal": true, "electrical": false, "chemical": true}', ARRAY['Delrin', 'POM'], ARRAY['Mechanical', 'Automotive']),
  
  ('Epoxy Fiberglass Sheet', 'Laminated Sheets', 'Reinforced epoxy fiberglass sheet with high strength-to-weight ratio. Excellent for structural applications.', '/images/products/laminated-sheets/epoxy-fiberglass-sheet-500x500.jpg', 'published', true, false, '{"thermal": true, "electrical": true, "chemical": true}', ARRAY['Epoxy', 'Fiberglass'], ARRAY['Building', 'Mechanical']),
  
  ('Epoxy FRP Sheet', 'Laminated Sheets', 'Fiber-reinforced plastic sheet with superior chemical resistance and mechanical properties.', '/images/products/laminated-sheets/epoxy-frp-sheets-500x500.jpg', 'published', true, false, '{"thermal": true, "electrical": true, "chemical": true}', ARRAY['Epoxy', 'FRP'], ARRAY['Chemical', 'Building']),
  
  ('FRP Sheet', 'Laminated Sheets', 'Fiber-reinforced plastic sheet offering excellent strength and corrosion resistance.', '/images/products/laminated-sheets/frp-sheets-500x500.jpg', 'published', true, false, '{"thermal": true, "electrical": true, "chemical": true}', ARRAY['FRP'], ARRAY['Building', 'Chemical']),
  
  ('HDPE Polythene Sheet', 'Laminated Sheets', 'High-density polyethylene sheet with excellent chemical resistance and impact strength.', '/images/products/laminated-sheets/hdpe-polythene-sheet-500x500.jpg', 'published', true, false, '{"thermal": false, "electrical": false, "chemical": true}', ARRAY['HDPE', 'PE'], ARRAY['Chemical', 'Food']),
  
  ('Hylam Sheet', 'Laminated Sheets', 'High-performance laminated sheet with superior mechanical and electrical properties.', '/images/products/laminated-sheets/hylam-sheet-500x500.jpg', 'published', true, false, '{"thermal": true, "electrical": true, "chemical": true}', ARRAY['Hylam'], ARRAY['Electronics', 'Mechanical']),
  
  ('Hylam 2 Sheet', 'Laminated Sheets', 'Advanced grade Hylam sheet with enhanced properties for demanding applications.', '/images/products/laminated-sheets/hylam2-sheets-500x500.jpg', 'published', true, false, '{"thermal": true, "electrical": true, "chemical": true}', ARRAY['Hylam'], ARRAY['Electronics', 'Mechanical']),
  
  ('Plane HDPE Sheet', 'Laminated Sheets', 'Flat, smooth HDPE sheet ideal for cutting boards, tanks, and chemical processing equipment.', '/images/products/laminated-sheets/Plane-hdpe-sheet-500x500.jpg', 'published', true, false, '{"thermal": false, "electrical": false, "chemical": true}', ARRAY['HDPE', 'PE'], ARRAY['Food', 'Chemical']),
  
  ('Plastic Sheet', 'Laminated Sheets', 'General-purpose plastic sheet suitable for a wide range of industrial applications.', '/images/products/laminated-sheets/plastic-sheets-500x500.jpg', 'published', true, false, '{"thermal": false, "electrical": false, "chemical": false}', ARRAY['Various'], ARRAY['General']),
  
  ('PlastNovs PP Sheet', 'Laminated Sheets', 'Premium polypropylene sheet with excellent chemical resistance and low density.', '/images/products/laminated-sheets/plastNovs-pp-sheet-500x500.jpg', 'published', true, false, '{"thermal": false, "electrical": false, "chemical": true}', ARRAY['PP', 'Polypropylene'], ARRAY['Chemical', 'Food']),
  
  ('Polyethylene HDPE Sheet', 'Laminated Sheets', 'High-density polyethylene sheet offering excellent impact resistance and chemical compatibility.', '/images/products/laminated-sheets/polyethylene-hdpe-sheets-500x500.jpg', 'published', true, false, '{"thermal": false, "electrical": false, "chemical": true}', ARRAY['HDPE', 'PE'], ARRAY['Chemical', 'Food']),
  
  ('Polypropylene Sheet', 'Laminated Sheets', 'Versatile polypropylene sheet with good chemical resistance and processability.', '/images/products/laminated-sheets/polypropylene-sheets-500x500.jpg', 'published', true, false, '{"thermal": false, "electrical": false, "chemical": true}', ARRAY['PP', 'Polypropylene'], ARRAY['Chemical', 'Food']),
  
  ('Polyurethane Sheet', 'Laminated Sheets', 'Flexible polyurethane sheet with excellent abrasion resistance and elasticity.', '/images/products/laminated-sheets/polyurethane-sheet-500x500.jpg', 'published', true, false, '{"thermal": false, "electrical": false, "chemical": true}', ARRAY['PU', 'Polyurethane'], ARRAY['Mechanical', 'Automotive']),
  
  ('PTFE Sheet', 'Laminated Sheets', 'Teflon PTFE sheet with exceptional chemical resistance and low friction coefficient.', '/images/products/laminated-sheets/ptfe-sheets-500x500.jpg', 'published', true, false, '{"thermal": true, "electrical": true, "chemical": true}', ARRAY['PTFE', 'Teflon'], ARRAY['Chemical', 'Food', 'Semiconductor']),
  
  ('PVC Rigid Sheet', 'Laminated Sheets', 'Rigid PVC sheet with excellent chemical resistance and flame retardant properties.', '/images/products/laminated-sheets/pvc-rigid-sheets-500x500.jpg', 'published', true, false, '{"thermal": false, "electrical": true, "chemical": true}', ARRAY['PVC'], ARRAY['Building', 'Chemical']),
  
  ('PVC Sheet', 'Laminated Sheets', 'Versatile PVC sheet suitable for various industrial and construction applications.', '/images/products/laminated-sheets/pvc-sheets-500x500.jpg', 'published', true, false, '{"thermal": false, "electrical": true, "chemical": true}', ARRAY['PVC'], ARRAY['Building', 'General']),
  
  ('Rectangular Polypropylene Sheet', 'Laminated Sheets', 'Rectangular-cut polypropylene sheet ready for fabrication and machining.', '/images/products/laminated-sheets/rectangulat-polypropylene-sheet-500x500.jpg', 'published', true, false, '{"thermal": false, "electrical": false, "chemical": true}', ARRAY['PP', 'Polypropylene'], ARRAY['Chemical', 'Food']),
  
  ('UHMW Sheet', 'Laminated Sheets', 'Ultra-high molecular weight polyethylene sheet with exceptional wear resistance.', '/images/products/laminated-sheets/uhmw-sheets-500x500.jpg', 'published', true, false, '{"thermal": false, "electrical": false, "chemical": true}', ARRAY['UHMW', 'PE'], ARRAY['Mechanical', 'Food']),
  
  ('UHMWPE Sheet', 'Laminated Sheets', 'Ultra-high molecular weight polyethylene sheet offering superior impact and abrasion resistance.', '/images/products/laminated-sheets/uhmwpe-sheets-500x500.jpg', 'published', true, false, '{"thermal": false, "electrical": false, "chemical": true}', ARRAY['UHMWPE', 'PE'], ARRAY['Mechanical', 'Food']),
  
  ('Waterproof HDPE Sheet', 'Laminated Sheets', 'Waterproof HDPE sheet ideal for water storage, tanks, and marine applications.', '/images/products/laminated-sheets/waterproof-hdpe-sheet-500x500.jpg', 'published', true, false, '{"thermal": false, "electrical": false, "chemical": true}', ARRAY['HDPE', 'PE'], ARRAY['Building', 'Marine']),
  
  ('White PP Sheet', 'Laminated Sheets', 'White polypropylene sheet with clean appearance, suitable for food contact applications.', '/images/products/laminated-sheets/white-pp-sheets-500x500.jpg', 'published', true, false, '{"thermal": false, "electrical": false, "chemical": true}', ARRAY['PP', 'Polypropylene'], ARRAY['Food', 'Medical']),
  
  ('White Teflon Sheet', 'Laminated Sheets', 'White PTFE (Teflon) sheet with excellent non-stick properties and chemical inertness.', '/images/products/laminated-sheets/white-teflon-sheet-500x500.jpg', 'published', true, false, '{"thermal": true, "electrical": true, "chemical": true}', ARRAY['PTFE', 'Teflon'], ARRAY['Food', 'Chemical', 'Semiconductor']);

-- HEAT RESISTANT RODS (13 products)
INSERT INTO products (name, category, description, image, status, available, price_on_request, properties, materials, industries)
VALUES
  ('Acrylic Round Rod', 'Heat Resistant Rods', 'Clear acrylic round rod for display, guarding, and optical applications.', '/images/products/heat-resistant-rods/acrylic-round-rods-500x500.webp', 'published', true, false, '{"thermal": false, "electrical": false, "chemical": false}', ARRAY['Acrylic', 'PMMA'], ARRAY['Electronics', 'Display']),
  
  ('Black Delrin Rod', 'Heat Resistant Rods', 'Black Delrin rod with excellent dimensional stability and low friction.', '/images/products/heat-resistant-rods/black-delrin-rods-500x500.jpg', 'published', true, false, '{"thermal": true, "electrical": false, "chemical": true}', ARRAY['Delrin', 'POM'], ARRAY['Mechanical', 'Automotive']),
  
  ('Cylindrical Delrin Rod', 'Heat Resistant Rods', 'Precision cylindrical Delrin rod for bearings, gears, and precision components.', '/images/products/heat-resistant-rods/cylindrical-delrin-rod-500x500.jpg', 'published', true, false, '{"thermal": true, "electrical": false, "chemical": true}', ARRAY['Delrin', 'POM'], ARRAY['Mechanical']),
  
  ('Delrin Black Square Rod', 'Heat Resistant Rods', 'Square-profile black Delrin rod for structural and mechanical applications.', '/images/products/heat-resistant-rods/delrin-black-square-rod-500x500.jpg', 'published', true, false, '{"thermal": true, "electrical": false, "chemical": true}', ARRAY['Delrin', 'POM'], ARRAY['Mechanical']),
  
  ('Delrin POM Polyacetal Rod', 'Heat Resistant Rods', 'Premium polyacetal rod with superior mechanical properties and dimensional stability.', '/images/products/heat-resistant-rods/delrin-pom-polyacetal-rods-500x500.jpg', 'published', true, false, '{"thermal": true, "electrical": false, "chemical": true}', ARRAY['Delrin', 'POM'], ARRAY['Mechanical', 'Automotive']),
  
  ('HDPE Rod', 'Heat Resistant Rods', 'High-density polyethylene rod with excellent chemical resistance and impact strength.', '/images/products/heat-resistant-rods/hdpe-rod-500x500.jpg', 'published', true, false, '{"thermal": false, "electrical": false, "chemical": true}', ARRAY['HDPE', 'PE'], ARRAY['Chemical', 'Food']),
  
  ('Polyethylene HDPE Rod', 'Heat Resistant Rods', 'HDPE rod offering superior impact resistance and chemical compatibility.', '/images/products/heat-resistant-rods/polyethylene-hdpe-rods-500x500.jpg', 'published', true, false, '{"thermal": false, "electrical": false, "chemical": true}', ARRAY['HDPE', 'PE'], ARRAY['Chemical', 'Food']),
  
  ('PP Round Rod', 'Heat Resistant Rods', 'Polypropylene round rod with good chemical resistance and low density.', '/images/products/heat-resistant-rods/pp-round-rod-500x500.jpg', 'published', true, false, '{"thermal": false, "electrical": false, "chemical": true}', ARRAY['PP', 'Polypropylene'], ARRAY['Chemical', 'Food']),
  
  ('PTFE Rod', 'Heat Resistant Rods', 'Teflon PTFE rod with exceptional chemical resistance and low friction.', '/images/products/heat-resistant-rods/ptfe-rod-500x500.jpg', 'published', true, false, '{"thermal": true, "electrical": true, "chemical": true}', ARRAY['PTFE', 'Teflon'], ARRAY['Chemical', 'Food', 'Semiconductor']),
  
  ('PVC Welding Rod', 'Heat Resistant Rods', 'PVC welding rod for joining and repairing PVC materials.', '/images/products/heat-resistant-rods/pvc-welding-rods-500x500.jpg', 'published', true, false, '{"thermal": false, "electrical": true, "chemical": true}', ARRAY['PVC'], ARRAY['Building', 'Chemical']),
  
  ('Round Delrin Rod', 'Heat Resistant Rods', 'Precision round Delrin rod for bearings, bushings, and mechanical components.', '/images/products/heat-resistant-rods/round-delrin-rod-500x500.jpg', 'published', true, false, '{"thermal": true, "electrical": false, "chemical": true}', ARRAY['Delrin', 'POM'], ARRAY['Mechanical']),
  
  ('White Nylon Rod', 'Heat Resistant Rods', 'White nylon rod with excellent wear resistance and mechanical properties.', '/images/products/heat-resistant-rods/white-nylon-rods-500x500.jpg', 'published', true, false, '{"thermal": true, "electrical": false, "chemical": true}', ARRAY['Nylon', 'PA'], ARRAY['Mechanical', 'Automotive']),
  
  ('White Nylon Rod 2', 'Heat Resistant Rods', 'Premium white nylon rod for high-performance mechanical applications.', '/images/products/heat-resistant-rods/white-nylon2-rods-500x500.jpg', 'published', true, false, '{"thermal": true, "electrical": false, "chemical": true}', ARRAY['Nylon', 'PA'], ARRAY['Mechanical', 'Automotive']),
  
  ('White PP Rod', 'Heat Resistant Rods', 'White polypropylene rod suitable for food contact and clean room applications.', '/images/products/heat-resistant-rods/white-pp-rod-500x500.jpg', 'published', true, false, '{"thermal": false, "electrical": false, "chemical": true}', ARRAY['PP', 'Polypropylene'], ARRAY['Food', 'Medical']);

-- ACRYLIC SHEETS (5 products)
INSERT INTO products (name, category, description, image, status, available, price_on_request, properties, materials, industries)
VALUES
  ('Acrylic Plastic Sheet', 'Acrylic Sheets', 'High-quality acrylic plastic sheet with excellent clarity and impact resistance.', '/images/products/acrylic-sheets/acrylic-plastic-sheet-500x500.jpg', 'published', true, false, '{"thermal": false, "electrical": false, "chemical": false}', ARRAY['Acrylic', 'PMMA'], ARRAY['Display', 'Building']),
  
  ('Acrylic Transparent Sheet', 'Acrylic Sheets', 'Crystal-clear transparent acrylic sheet for glazing and display applications.', '/images/products/acrylic-sheets/acrylic-transparent-sheet-500x500.jpg', 'published', true, false, '{"thermal": false, "electrical": false, "chemical": false}', ARRAY['Acrylic', 'PMMA'], ARRAY['Display', 'Building']),
  
  ('Acrylic Sheet 2', 'Acrylic Sheets', 'Premium acrylic sheet with superior optical clarity and weather resistance.', '/images/products/acrylic-sheets/acrylic2-sheet-500x500.jpg', 'published', true, false, '{"thermal": false, "electrical": false, "chemical": false}', ARRAY['Acrylic', 'PMMA'], ARRAY['Display', 'Building']),
  
  ('Cast Acrylic Sheet', 'Acrylic Sheets', 'Cast acrylic sheet offering superior surface finish and dimensional stability.', '/images/products/acrylic-sheets/cast-acrylic-sheet-500x500.jpg', 'published', true, false, '{"thermal": false, "electrical": false, "chemical": false}', ARRAY['Acrylic', 'PMMA'], ARRAY['Display', 'Signage']),
  
  ('Transparent Acrylic Sheet', 'Acrylic Sheets', 'Ultra-clear transparent acrylic sheet for high-end display and architectural applications.', '/images/products/acrylic-sheets/transparent-acrylic-sheet-500x500.jpg', 'published', true, false, '{"thermal": false, "electrical": false, "chemical": false}', ARRAY['Acrylic', 'PMMA'], ARRAY['Display', 'Architecture']);

-- SINGLE PRODUCT CATEGORIES
INSERT INTO products (name, category, description, image, status, available, price_on_request, properties, materials, industries)
VALUES
  ('Acrylic Tubes', 'Acrylic Tubes', 'Clear acrylic tubes for display, guarding, and flow visualization applications.', '/images/products/acrylic-tubes/acrylic-tubes-500x500.jpg', 'published', true, false, '{"thermal": false, "electrical": false, "chemical": false}', ARRAY['Acrylic', 'PMMA'], ARRAY['Display', 'Electronics']),
  
  ('PP Clicking Boards', 'PVC Products', 'Polypropylene clicking boards for cutting and fabrication applications.', '/images/products/pvc-products/pp-clicking-boards-500x500.jpg', 'published', true, false, '{"thermal": false, "electrical": false, "chemical": true}', ARRAY['PP', 'Polypropylene'], ARRAY['General', 'Fabrication']),
  
  ('PVC Curtain Roll', 'PVC Curtain Rolls', 'Flexible PVC strip curtain roll for industrial doors and partitions.', '/images/products/pvc-curtain-rolls/pvc-curtain-roll-500x500.jpg', 'published', true, false, '{"thermal": false, "electrical": false, "chemical": true}', ARRAY['PVC'], ARRAY['Building', 'Industrial']),
  
  ('Polyurethane Cord', 'Polyurethane Cords', 'Durable polyurethane cord for mechanical drives and conveying systems.', '/images/products/polyurethane-cords/polyurethane-cord-500x500.jpg', 'published', true, false, '{"thermal": false, "electrical": false, "chemical": true}', ARRAY['PU', 'Polyurethane'], ARRAY['Mechanical', 'Automotive']),
  
  ('PTFE Bushes', 'PTFE Bushes', 'Low-friction PTFE bushes for sliding and bearing applications.', '/images/products/ptfe-bushes/ptfe-bushes-500x500.jpg', 'published', true, false, '{"thermal": true, "electrical": true, "chemical": true}', ARRAY['PTFE', 'Teflon'], ARRAY['Mechanical', 'Automotive']),
  
  ('PVC Folding Bed Shoe Mould', 'PVC Folding Bed Shoe Moulds', 'Precision PVC mould for folding bed shoe manufacturing applications.', '/images/products/pvc-folding-bed-shoe-moulds/pvc-folding-bed-shoe-mould-500x500.jpg', 'published', true, false, '{"thermal": false, "electrical": false, "chemical": true}', ARRAY['PVC'], ARRAY['Furniture', 'Manufacturing']),
  
  ('PEEK Tube', 'PEEK Tubes', 'High-temperature, chemically resistant PEEK tube for critical service applications.', '/images/products/peek-tubes/peek-tube-500x500,jpg.webp', 'published', true, false, '{"thermal": true, "electrical": true, "chemical": true}', ARRAY['PEEK'], ARRAY['Aerospace', 'Medical', 'Semiconductor']);

-- Update category product counts
UPDATE product_categories SET productCount = (
  SELECT COUNT(*) FROM products 
  WHERE products.category = product_categories.name 
  AND products.status = 'published' 
  AND products.available = true
  AND products.deleted_at IS NULL
);
