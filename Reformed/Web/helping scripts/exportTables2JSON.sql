SELECT JSON_OBJECT
    ('id', id,
     'name', name, 
     'subcategories_id', subcategories_id)
      FROM products;

-- @block Export Products to JSON
SELECT JSON_DETAILED(JSON_ARRAYAGG(
    JSON_OBJECT(
        'id', id, 
        'name', name, 
        'category', (SELECT categories_id 
                    FROM subcategories
                    WHERE id = subcategories_id),
        'subgategory', subcategories_id
        )
    ))
FROM products
INTO OUTFILE 'C:/Users/mariapc/Desktop/output.json'; 

-- @block Export CATEGORIES-SUBCATEGORIES to JSON
SELECT JSON_DETAILED(
    JSON_OBJECT(
        'id', c.id,
        'name', c.name,
        'subcategories', (
            SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                    'name', s.name,
                    'uuid', s.id
                )
            )
            FROM subcategories s
            WHERE s.categories_id = c.id
        )
    )
) INTO OUTFILE 'C:/Users/mariapc/Desktop/output.json'
FROM categories c;

-- @block test
SELECT categories.id, categories.name, subcategories.name, subcategories.id
FROM categories INNER JOIN subcategories ON categories.id = subcategories.categories_id;