-- @block necessary indexes
CREATE OR REPLACE INDEX product_name USING BTREE
ON products(name)
NOWAIT;

CREATE OR REPLACE INDEX sale_creation_date USING BTREE
ON sales(date_created)
NOWAIT;

CREATE OR REPLACE INDEX store_name USING BTREE
ON stores(name)
NOWAIT;

CREATE OR REPLACE INDEX subcat_name USING BTREE
ON subcategories(name)
NOWAIT;

CREATE OR REPLACE INDEX us_score USING BTREE
ON users(sum_score)
NOWAIT;

CREATE OR REPLACE INDEX yesterdayavg USING BTREE
ON products(avgprice_yesterday)
NOWAIT;

CREATE OR REPLACE INDEX lastweekavg USING BTREE
ON products(avgprice_lastweek)
NOWAIT;

CREATE OR REPLACE INDEX sale_activity USING BTREE
ON sales(active)
NOWAIT;

CREATE OR REPLACE INDEX store_has_sales USING BTREE
ON stores(sale_exists)
NOWAIT;


-- @block strongly suggested indexes
CREATE INDEX category_name USING BTREE
ON categories(name)
NOWAIT;

-- @block comments
ΓΕΝΙΚΑ, ΤΟ id ΤΡΕΧΟΝΤΟΣ ΧΡΗΣΤΗ ΕΙΝΑΙ ΑΠΟΘΗΚΕΥΜΕΝΟ ΣΤΗ JAVASCRIPT ΑΠΑΡΑΙΤΗΤΑ!!!
ΥΠΕΝΘΥΜΙΣΗ: Η maridb, δημιουργεί αυτόματα ευρετήρια για όλα τα κλειδιά (πρωτεύοντα, δευτερέοντα-unique fields και ξένα).
Για τα υλοποιημένα indexes: 
    1) Ευρετήριο με βάση το όνομα προϊόντος για queries -> από το πλάισιο γρήγορης αναζήτησης κατά την υποβολή προσφοράς (ερώτημα Χρήστης 3).
    2) Ευρετήριο με βάση την ημερομηνία υποβολής προσφορών για να εκτελείται γρήγορα η αναζήτηση των προσφορών από την procedure που θα
       αναλάβει την απενεργοποίηση των προσφορών. 
    3) Ευρετήριο με βάση το όνομα καταστήματος για queries από το Φίλτρο Καταστημάτων στο χάρτη (ερώτημα Χρήστης 2 b).
    4) Ευρετήριο με βάση το όνομα υποκατηγορίας για queries από τη λίστα κατά την υποβολή προσφοράς (ερώτημα Χρήστης 3).
    5) Ευρετήριο με βάση το συνολικό σκορ για το leaderboard
    6) Ευρετήριο με βάση το όνομα κατηγορίας για queries -> από τη λίστα κατά την υποβολή προσφοράς (ερώτημα Χρήστης 3)
                                                         -> από το φίλτρο γενικής κατηγορίας στο χάρτη (ερώτημα Χρήστης 2 c).
        Επειδή ο πίνακας είναι μικρός, μπορεί να μη θέλουμε να φορτώσουμε τη βάση μας με extra ευρετήρια (για αυτό αναφέρεται και η κατάργηση 
        στο νούμερο 1 παρακάτω).
    7) Ευρετήριο με βάση τη μέση τιμή της προηγούμενης μέρας και εβδομάδας, για τα triggers που ανανεώνουν το σκορ χρήστη
    8) Ευρετήριο με βάση το πεδίο active, ώστε όλες οι ανενεργές προσφορές να προηγούνται των ενεργών (σε query "φέρε όλες τις ενεργές προσφορές 
       και από αυτές στείλε τα καταστήματα στο χάρτη" (πολύ γενικά) ). Δεν μπορώ να φανταστώ να κάνουμε αναζήτηση με βάση οποιοδήποτε άλλο πεδίο 
       που δεν έχει ήδη ευρετήριο.
    9) Ευρετήριο με βάση το πεδίο sale_exists, ώστε όλα τα καταστήματα που δεν έχουν καμία προσφορά να προηγούνται όλων όσων
       έχουν (για markers ή query τύπου "φέρε όσα καταστήματα έχουν προσφορές" (δεν ξέρω που ακριβώς μπορεί να χρησιμοποιηθεί) ).

Για τα Indexes που σκέφτηκα αλλά δεν υλοποίησα:
    1) Για τους admins, ευρετήριο για το όνομα είναι αχρείαστο, λόγω του μικρού μεγέθους του πίνακα. Για τον ίδιο λόγο μπορούν να 
       καταργηθούν και τα ήδη υπάρχοντα ευρετήρια (id, email, users_id).
    2) Οι πίνακες likes/dislikes είναι πλήρεις ευρετηρίων, άρα δεν χρειάζονται κάτι άλλο.
    3) Οι users δεν θέλουν ευρετήριο για το username. Για την εμφάνιση του πεδίου στις προσφορές, παίρνουμε το id τους από το πεδίο 
       user_suggested του πίνακα sales και από εκεί βρίσκουμε το username τους. Αντίστοιχα, αν υποβάλω εγώ προσφορά, το id μου είναι αποθηκευμένο 
       στη javascript, άρα πάλι μπορώ να το βρω.