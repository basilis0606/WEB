-- @block WARNINGS
WARNING 1: επειδή εχω 2 versions σε μερικά trigger και έχω υλοποιήσει 2 triggers extra λειτουργικότητας 
           που δημιουργούν πρόβλημα, τίθεται θέμα προς συζήτηση (βλ. comment 4 στο τέλος του αρχείου).
           Μην περάσετε ακόμα τα triggers. Εγώ τα έχω περάσει στη βάση (με εξαίρεση αυτά τα 2 που 
           ποκαλούν το θέμα), οπότε συντακτικά είναι κομπλε κατά το vs code (βλ. WARNING 2). Από πλευράς
           ορθής λειτουργίας δεν τα έχω τεστάρει.
WARNIG 2: Αν περάσετε τα triggers στη mariadb χωρίς τα delimiters, θα σας δώσει συντακτικά λάθη. Από 
          vs code, κατεβάστε το extension sql tools, δημιουργήστε σύνδεση με τη βάση σας στη mariadb και 
          τρέξτε τα ερωτήματα ανά μπλοκ από το vs code. 


-- @block types_of_triggers (reminder)
-- before insert    after insert
-- before update    after update
-- before delete    after delete

-- @block subcategories_triggers
-- Έλεγχος ότι η κατηγορία στην οποία εισάγουμε μια υποκατηγορία υπάρχει. Έχω φτιάξει 2 εκδοχές
CREATE OR REPLACE TRIGGER validate_category_bins BEFORE INSERT ON subcategories 
FOR EACH ROW
    BEGIN
        DECLARE done INT;
        DECLARE cat_exists BOOLEAN;
        DECLARE curr_category TINYINT UNSIGNED;

        DECLARE category CURSOR FOR SELECT id FROM categories;
        DECLARE CONTINUE HANDLER FOR NOT FOUND SET done=1;

        SET cat_exists = 0;

        OPEN category;
        SET done =0;

        FETCH category INTO curr_category;
        REPEAT 
            IF (curr_category = NEW.categories_id) THEN
                SET cat_exists=1;
            END IF;
            FETCH category INTO curr_category;
        UNTIL (done=1 OR cat_exists=1)
        END REPEAT;

        CLOSE category;

        IF (cat_exists = 0) THEN 
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Failed to insert subcategory';        
        END IF;
    END;

CREATE OR REPLACE TRIGGER validate_category_bins_V2 BEFORE INSERT ON subcategories 
    FOR EACH ROW
        BEGIN
            DECLARE lastid INT UNSIGNED; 
            -- get the id of the last category (ids must be in ascending order)
            SELECT id 
            INTO lastid
            FROM categories
            ORDER BY id DESC
            LIMIT 0,1;

            IF (NEW.categories_id > lastid) THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Failed to insert subcategory';        
            END IF;

        END;

-- ίδιος έλεγχος. Το trigger χρησιμεύει μόνο αν αλλάξουμε την κατηγορία κάποιας υποκατηγορίας. Έχω φτιάξει 2 εκδοχές
CREATE OR REPLACE TRIGGER validate_category_bup BEFORE UPDATE ON subcategories 
FOR EACH ROW
    BEGIN
        DECLARE done INT;
        DECLARE cat_exists BOOLEAN;
        DECLARE curr_category TINYINT UNSIGNED;

        DECLARE category CURSOR FOR SELECT id FROM categories;
        DECLARE CONTINUE HANDLER FOR NOT FOUND SET done=1;

        IF (NEW.categories_id != OLD.categories_id) THEN
            SET cat_exists = 0;

            OPEN category;
            SET done =0;

            FETCH category INTO curr_category;
            REPEAT 
                IF (curr_category = NEW.categories_id) THEN
                    SET cat_exists=1;
                END IF;
                FETCH category INTO curr_category;
            UNTIL (done=1 OR cat_exists=1)
            END REPEAT;

            CLOSE category;

            IF (cat_exists = 0) THEN 
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Failed to update subcategory';        
        END IF;
        
    END;


CREATE OR REPLACE TRIGGER validate_category_bup_V2 BEFORE UPDATE ON subcategories 
FOR EACH ROW
    BEGIN
        DECLARE lastid INT UNSIGNED;

        IF (NEW.categories_id != OLD.categories_id) THEN
            -- get the id of the last category (ids must be in ascending order)
            SELECT id 
            INTO lastid
            FROM categories
            ORDER BY id DESC
            LIMIT 0,1;

            IF (NEW.categories_id > lastid) THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Failed to update subcategory';        
            END IF;

        END IF;
    END;



-- @block products_triggers
CREATE OR REPLACE TRIGGER validate_subcategory_bins BEFORE INSERT ON products 
FOR EACH ROW
    BEGIN
        DECLARE done INT;
        DECLARE subcat_exists BOOLEAN;
        DECLARE curr_subcategory TINYINT UNSIGNED;

        DECLARE subcategory CURSOR FOR SELECT id FROM subcategories;
        DECLARE CONTINUE HANDLER FOR NOT FOUND SET done=1;

        SET subcat_exists = 0;

        OPEN subcategory;
        SET done =0;

        FETCH subcategory INTO curr_subcategory;
        REPEAT 
            IF (curr_subcategory = NEW.subcategories_id) THEN
                SET subcat_exists=1;
            END IF;
            FETCH subcategory INTO curr_subcategory;
        UNTIL (done=1 OR subcat_exists=1)
        END REPEAT;

        CLOSE subcategory;

        IF (subcat_exists = 0) THEN 
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Failed to insert product';        
        END IF;
    END;

CREATE OR REPLACE TRIGGER validate_subcategory_bins_V2 BEFORE INSERT ON products 
    FOR EACH ROW
        BEGIN
            DECLARE lastid INT UNSIGNED; 
            -- get the id of the last category (ids must be in ascending order)
            SELECT id 
            INTO lastid
            FROM subcategories
            ORDER BY id DESC
            LIMIT 0,1;

            IF (NEW.subcategories_id > lastid) THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Failed to insert product';        
            END IF;

    END;

-- χρήσιμο μόνο αν αλλάξει ο διαχειριστής την υποκατηγορία προϊόντος
CREATE OR REPLACE TRIGGER validate_subcategory_bup BEFORE UPDATE ON products 
    FOR EACH ROW
        BEGIN
            DECLARE done INT;
            DECLARE subcat_exists BOOLEAN;
            DECLARE curr_subcategory TINYINT UNSIGNED;

            DECLARE subcategory CURSOR FOR SELECT id FROM subcategories;
            DECLARE CONTINUE HANDLER FOR NOT FOUND SET done=1;

            IF (NEW.subcategories_id != OLD.subcategories_id) THEN 
                SET subcat_exists = 0;

                OPEN subcategory;
                SET done =0;

                FETCH subcategory INTO curr_subcategory;
                REPEAT 
                    IF (curr_subcategory = NEW.subcategories_id) THEN
                        SET subcat_exists=1;
                    END IF;
                FETCH subcategory INTO curr_subcategory;
                UNTIL (done=1 OR subcat_exists=1)
                END REPEAT;

                CLOSE subcategory;

                IF (subcat_exists = 0) THEN 
                    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Failed to update product';        
                END IF;
            END IF;

        END;

CREATE OR REPLACE TRIGGER validate_subcategory_bup_V2 BEFORE UPDATE ON products 
FOR EACH ROW
    BEGIN
        DECLARE lastid INT UNSIGNED;

        IF (NEW.subcategories_id != OLD.subcategories_id) THEN
            -- get the id of the last category (ids must be in ascending order)
            SELECT id 
            INTO lastid
            FROM subcategories
            ORDER BY id DESC
            LIMIT 0,1;

            IF (NEW.subcategories_id > lastid) THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Failed to update product';        
            END IF;

        END IF;
    END;

-- Πρόβλημα αν οι ενέργειες δεν είναι ατομικές!! Αν δύο χρήστες πατήσουν ταυτ΄χρονα like/dislike πρέπει 
-- να γίνει πρώτα η εγγραφή της νέας τιμής από τον ένα και μετά να διαβάσει ο άλλος ωστε να προσαυξήσει 
-- την ανανεωμένη τιμή.
-- @block likes_triggers
CREATE OR REPLACE TRIGGER sale_likes_update AFTER INSERT ON likes
FOR EACH ROW
    BEGIN
        DECLARE user2update INT UNSIGNED;

        -- update likes number on the sale that was liked by a user
        UPDATE sales 
        SET likes_num = likes_num+1
        WHERE id = NEW.sales_id;
        
        -- update the score of the user who submitted the sale
        SELECT user_suggested
        INTO user2update 
        FROM sales
        WHERE id = NEW.sales_id;

        UPDATE users
        SET monthly_score = monthly_score+5,
            sum_score = sum_score+5
        WHERE id = user2update;

    END;

CREATE OR REPLACE TRIGGER sale_wdrawlikes_update AFTER DELETE ON likes
    FOR EACH ROW
        BEGIN
            DECLARE user2update INT UNSIGNED;

            UPDATE sales 
            SET likes_num = likes_num -1 
            WHERE id = OLD.sales_id;

            SELECT user_suggested
            INTO user2update 
            FROM sales
            WHERE id = OLD.sales_id;

            UPDATE users
            SET monthly_score = monthly_score - 5,
                sum_score = sum_score - 5
            WHERE id = user2update;
        END;

-- @block dislikes_triggers
CREATE OR REPLACE TRIGGER sale_dilikes_update AFTER INSERT ON dislikes
FOR EACH ROW
    BEGIN
        DECLARE user2update INT UNSIGNED;

        -- update dislikes number on the sale that was liked by a user
        UPDATE sales 
        SET dislikes_num = dislikes_num+1
        WHERE id = NEW.sales_id;
        
        -- update the score of the user who submitted the sale
        SELECT user_suggested
        INTO user2update 
        FROM sales
        WHERE id = NEW.sales_id;

        UPDATE users
        SET monthly_score = monthly_score-1,
            sum_score = sum_score-1
        WHERE id = user2update;

    END;

CREATE OR REPLACE TRIGGER sale_wdrawdislikes_update AFTER DELETE ON dislikes
FOR EACH ROW
    BEGIN
        DECLARE user2update INT UNSIGNED;

        -- update dislikes number on the sale that was liked by a user
        UPDATE sales 
        SET dislikes_num = dislikes_num+1
        WHERE id = OLD.sales_id;
        
        -- update the score of the user who submitted the sale
        SELECT user_suggested
        INTO user2update 
        FROM sales
        WHERE id = OLD.sales_id;

        UPDATE users
        SET monthly_score = monthly_score + 1,
            sum_score = sum_score + 1
        WHERE id = user2update;

    END;

-- @block sales_triggers
CREATE OR REPLACE TRIGGER salesub_score_update BEFORE INSERT ON sales
FOR EACH ROW 
    BEGIN
        DECLARE avgp_prevday FLOAT(4,2);
        DECLARE avgp_lweek FLOAT(4,2);

        SELECT avgprice_yesterday, avgprice_lastweek
        INTO avgp_prevday, avgp_lweek
        FROM products
        USE INDEX (yesterdayavg, lastweekavg)
        WHERE id = NEW.product_id;

        IF (NEW.price < 20*avgp_prevday/100) THEN 
            UPDATE users
            SET monthly_score = monthly_score + 50,
                sum_score = sum_score + 50
            WHERE id = NEW.user_suggested;
        ELSEIF (NEW.price < 20*avgp_lweek/100) THEN
            UPDATE users
            SET monthly_score = monthly_score + 20,
                sum_score = sum_score + 20
            WHERE id = NEW.user_suggested;
        END IF;

    END;

-- @block show_triggers;

show triggers;


-- @block comments
1) Πριν την εισαγωγή/ ανανέωση κάποιας υποκατηγορίας (δυνατότητα admin? Δεν τη ζητάνε, αλλά ίσως εννοείται λόγω δυνατότητας να αλλάξει
   τα προϊόντα αλλιώς είναι extra λειτουργικότητα), γίνεται έλγχος ότι η κατηγορία στην οποία η υποκατηγορία ανήκει, υπάρχει. --> ίσως να μη χρειάζεται
2) Ομοίως για τα προϊόντα με τις υποκατηγορίες τους. --> ίσως να μη χρειάζεται
3) Μετά την εισαγωγή like/dislike ανανεώνεται ο αριθμός αντίστοιχων αντιδράσεων στην αναφερόμενη προσφορά και το σκορ του χρήστη 
   που την υπέβαλε. 
4) Αντίθετες μεταβολές συμβαίνουν κατά τη διαγραφή ενός like/dislike (withdraw like/dislike αν το παρέχουμε). Η αλυσιδωτή αντίδραση 
   delete store/product cascades delete sale cascades delete likes/dislikes δεν ενεργοποιούν triggers.
5) Πριν την εισαγωγή μιας προσφοράς, ανανεώνεται (ή όχι) το σκορ του χρήστη που την υπέβαλε, σύμφωνα με τις προδιαγραφές της εκφώνησης.
   Δυστυχώς, δεν μπορώ να το κάνω AFTER INSERT το trigger διότι δεν μπορώ να πάρω τις προηγούμενες μέσεες τιμές του προϊόντος (η OLD 
   keyword δεν λειτουργεί και δεν κατάλαβα ποτέ αν και με ποιο τρόπο μπορώ να περάσω παραμέτρους σε trigger). Συνεπώς, αν τελικά το insert 
   αποτύχει, οι αλλαγές στο σκορ πρέπει να αναιρεθούν. 

-- @block παραδοχές 
1) Δεν γίνονται inserts στους admins κατά το runtime. Τα delete (κατάργηση λογαριασμού αν την παρέχουμε), δεν θέλουν triggers.
2) Δεν θεωρώ ότι οι κατηγορίες χρειάζονται κάποιο trigger. Insert -> δεν αλλάζει κάτι, Update/Delete -> είμαστε προστατευμένοι 
   με cascade/set null ενέργειες από το σχήμα της βάσης.
2) Για τα like/dislike γίνεται πρόληψη από το front end ότι ο user και η προσφορά υπάρχουν (απουσία before insert trigger). 
   Δεν υπάρχει δυνατότητα update του like/dislike.
3) Για τα προϊόντα υπάρχουν όλες οι δυνατότητες (εισαγωγή, ανανέωση, διαγραφή) αποκλειστικά για τον admin. Όμως δεν μπόρεσα να σκεφτώ
   χρησιμότητα σε κάποιο trigger πέρα από αυτά που υλοποίησα. 
4) Για τις προσφορές, η πρόληψη ότι όλα τα ξένα κλειδιά αναφέρονται σε πραγματικές εγγραφές (ότι δηλαδή ο χρήστης, το κατάστημα 
   και το προϊόν υπάρχουν) γίνεται από το front end. ΠΡΟΤΑΣΗ: Μην επιτρέψουμε στον user να ανανεώνει καμία προσφορά. Γίνεται περίπλοκος
   ο επανυπολογισμός του σκορ του (αν αποφασίσουμε παρόλα αυτά να το επιτρέψουμε, να μπορεί να κάνει Update μόνο τις δικές του προσφορές
   μέσω του ιστορικού).
5) Για τα καταστήματα, όλες οι δυνατότητες υπάρχουν για τον admin μόνο. Δεν θεωρώ ότι χρειαζόμαστε triggers για αυτά.
6) Για users/admins Trigger για διασφάλιση μοναδικού email before update? Δεν επιτρέπεται κάποιος να αλλάξει το email του.
