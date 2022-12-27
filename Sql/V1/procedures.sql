CREATE PROCEDURE update_avgprices 
    BEGIN
        DECLARE angy FLOAT(4,2);
        DECLARE anglw FLOAT(4,2);
        DECLARE done TINYINT;

        DECLARE yesterdayAvg CURSOR FOR 
        SELECT product_id, AVG(price)
        FROM sales
        WHERE date_created = DATE_SUB(CURDATE(), INTERVAL 1 DAY) 
        GROUP BY product_id;
  
        
        DECLARE sevenDayAvg CURSOR FOR
        SELECT product_id, AVG(price)
        FROM sales
        WHERE DATEDIFF(CURDATE(), date_created) < 7
        GROUP BY product_id;

        DECLARE avgprices CURSOR FOR 
        SELECT id, avgprice_yesterday, avgprice_lastweek
        FROM products;

        DECLARE sales2calc CURSOR FOR
        SELECT  product_id, price, date_created
        FROM sales
        WHERE active = 1;
        
        SET done=0;
        OPEN avgprices
        
        FETCH avgprices INTO

        
    END;



CREATE PROCEDURE check_activity
    BEGIN 

    DECLARE sid INT;
    DECLARE date_difference SMALLINT;
    DECLARE creationdate DATE;
    DECLARE curprice FLOAT(4,2);
    DECLARE avgy FLOAT(4,2);
    DECLARE avglw FLOAT(4,2);

    DECLARE done TINYINT;
    DECLARE active_sales CURSOR FOR 
    SELECT sales.id, sales.date_created, sales.price, products.avgprice_yesterday, products.avgprice_lastweek
    FROM sales, products
    USE INDEX sales(sale_activity)
    WHERE sales.product_id = products.id AND sales.active=1;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done=1; 

    SET done=0;
    
    OPEN active_sales;
    FETCH active_sales INTO sid, creationdate, curprice, avgy, avglw;
    REPEAT
        SELECT DATEDIFF( CURDATE(), creationdate ) INTO date_difference;
        IF (date_difference > 7 ) THEN 
            IF (curprice < 20*avgy/100 OR curprice < 20*avglw/100) THEN
                -- MORE THAN 7 DAYS BUT CRITERIA OK! --> update date created so that sale lasts 1 more week
                UPDATE sales
                SET date_created = CURDATE()
                WHERE id = sid;
            
            
            UPDATE sales

        END IF;
    
    
    UNTIL( done = 1 )
    END REPEAT;

    END;