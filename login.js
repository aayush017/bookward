import bodyParser from "body-parser";
import flash from "connect-flash";
import express from "express";
import session from "express-session";
import multer from "multer";
import mysql from "mysql";
import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const app=express();
app.set('view engine', 'ejs');
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false
}));
const upload = multer({ dest: 'uploads/' });
app.use(flash());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/assests",express.static("assests"));
const port=3000;
const connection=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"W7301@jqir#",
    database:"nodejs"
});
connection.connect(function(error){
    if(error) throw error
    else console.log("Conncetion to Databsase Successful");
});
app.get("/",(req,res)=>{
    res.sendFile( __dirname + "/welcome.html");

});
app.get("/donation",(req,res)=>{
    res.sendFile( __dirname + "/donated.html");
})
app.get("/loginuser",(req,res)=>{
    res.sendFile( __dirname + "/index.html");
});
app.get("/vendorpp",(req,res)=>{
    res.sendFile(__dirname+"/vendorpage.html");
});
app.get("/loginvendor",(req,res)=>{
    res.sendFile( __dirname + "/vendor.html");
});
app.get("/admin",(req,res)=>{
    res.sendFile( __dirname + "/adminlogin.html");
});
app.get("/adminpp",(req,res)=>{
    res.sendFile(__dirname+"/adminpage.html");
})
app.get("/register",(req,res)=>{
    res.sendFile(__dirname+"/New_mems.html");
});
app.get("/login24",(req,res)=>{
    res.sendFile(__dirname+"/index.html");
});
app.get("/login45",(req,res)=>{
    res.sendFile(__dirname+"/New_vends.html");
});
app.get("/login54",(req,res)=>{
    res.sendFile(__dirname+"/vendor.html")  ;
});

app.get('/prompt', (req, res) => {
    const message = req.query.message;
    res.render('prompt', { message });
});
function promptMessage(req, res, message) {
    res.redirect(`/prompt?message=${encodeURIComponent(message)}`);
}
app.post("/",(req,res)=>{
    var username=req.body["Username"];
    var password=req.body["password"];
    connection.query("select * from loginuser where user_name=? and user_pass=?",[username,password],(error,results,fields)=>{
        if(results.length>0){
            const user=results[0];
            const userID=results[0].user_id;
            if(user.is_blocked===1){
                promptMessage(req, res, 'User is Blocked as 3 attempts have exhausted.Call customer Care for further Assistance');
                return;
            }else{
                connection.query("DELETE FROM LoginAttempts WHERE user_id = ?",[userID],(error,result4)=>{
                    if(error){
                        throw err;
                    }
                    req.session.userId=userID;
                    res.redirect("/homepage");
                });
            }
        }else{
            connection.query('select * from loginuser where user_name=?',[username],(error,results1)=>{
                if(results1.length>0){
                    const user1=results1[0];
                    const usedid=results1[0].user_id;
                    if(user1.is_blocked===1){
                        promptMessage(req, res, 'User is Blocked as 3 attempts have exhausted.Call customer Care for further Assistance');
                        return;
                    }else{
                        connection.query('insert into LoginAttempts (user_id) values (?)',[usedid],(error,results2)=>{
                            if(error){
                                throw err;
                            }
                            promptMessage(req, res, 'Wrong password Entered.');
                            return;
                        });
                    }
                }else{
                    promptMessage(req, res, 'User Does not Exist');
                    return;
                }
            });
        }
    });
});
app.get("/usersss",(req,res)=>{
    const userId=req.session.userId;
    connection.beginTransaction((err)=>{
        if(err){
            console.error('Error starting transaction:',err);
            res.status(500).send('Error Starting Transaction');
            return;
        }
        connection.query('select * from loginuser where user_id=?',[userId],(error,results)=>{
            if(error){
                console.error('Error fetching User Details:', error);
                connection.rollback(()=>{
                    res.status(500).send('Error fetching products');
                });
                return;
            }
            res.render('Userpp',{details:results});
            connection.commit((commiterror)=>{
                if(commiterror){
                    console.error('Error committing Transaction: ',commiterror);
                    connection.rollback(()=>{
                        res.status(500).send('Error Committing transaction');
                    });
                }
            });
    
        });
    });
});
app.get("/homepage",(req,res)=>{
    connection.query('SELECT * FROM book', (error, results, fields) => {
        if (error) {
            console.error('Error fetching products:', error);
            res.status(500).send('Error fetching products');
            return;
        }
        res.render('homepage', { products: results,messages: req.flash() });
    });
});
app.get("/admin/view-all-books",(req,res)=>{
    connection.query('SELECT * FROM book', (error, results, fields) => {
        if (error) {
            console.error('Error fetching products:', error);
            res.status(500).send('Error fetching products');
            return;
        }
        res.render('books', { books: results,messages: req.flash() });
    });
});
app.get("/admin/view-all-users",(req,res)=>{
    connection.query('SELECT * FROM loginuser', (error, results, fields) => {
        if (error) {
            console.error('Error fetching products:', error);
            res.status(500).send('Error fetching products');
            return;
        }
        res.render('users', { users: results,messages: req.flash() });
    });
});
app.get("/admin/view-donated-books",(req,res)=>{
    connection.query('SELECT * FROM donated_book', (error, results, fields) => {
        if (error) {
            console.error('Error fetching products:', error);
            res.status(500).send('Error fetching products');
            return;
        }
        res.render('donatedbook', { donatedBooks: results,messages: req.flash() });
    });
});
app.get("/admin/view-added-books",(req,res)=>{
    connection.query('SELECT * FROM BookAdded', (error, results, fields) => {
        if (error) {
            console.error('Error fetching products:', error);
            res.status(500).send('Error fetching products');
            return;
        }
        res.render('Addedbook', { addedBooks: results,messages: req.flash() });
    });
});
app.get("/donatepage",(req,res)=>{
    connection.query('SELECT * FROM donated_book', (error, results, fields) => {
        if (error) {
            console.error('Error fetching products:', error);
            res.status(500).send('Error fetching products');
            return;
        }
        res.render('donated', { products: results,messages: req.flash() });
    });
});
app.get('/orders', (req, res) => {
    const userid=req.session.userId;
    connection.query('SELECT * FROM orders where user_id=?',[userid], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.render('orders', { orders: results });
    });
});
app.post("/vendor-login",(req,res)=>{
    var username=req.body["username"];
    var password=req.body["password"];
    connection.beginTransaction((err)=>{
        if(err){
            console.error('Error Starting Transaction:',err);
            res.status(500).send("Error starting transaction");
            return;
        }
        connection.query("select * from vendor where vend_name=? and vend_pass=?",[username,password],(error,results,fields)=>{
            if(error){
                console.error('Error fetching vendor details:',error);
                connection.rollback(()=>{
                    res.status(500).send('Error fetching vendor details');

                });
                return;
            }
            if(results.length>0){
                const vendorId = results[0].vend_id;
                req.session.vendorId = vendorId;
                res.redirect("/vendorpp");
            }else{
                connection.rollback(()=>{
                    promptMessage(req, res, 'Wrong Credentials Entered.');
                });
                return;
            }
            connection.commit((commiterror)=>{
                if(commiterror){
                    console.error('Error Committing transaction: ',commiterror);
                    connection.rollback(()=>{
                        res.status(500).send('Error commiting transaction');
                    });
                }
            });
        });
    });
    
});
app.post("/admin/login",(req,res)=>{
    var username=req.body["Username"];
    var password=req.body["password"];
    connection.query("select * from admin where username_=? and password_=?",[username,password],(error,results,fields)=>{
        if(results.length>0){
            res.redirect("/adminpp");
        }else{
            promptMessage(req, res, 'Wrong Credentials Entered.');
            return;
        }
        res.end();
    })
});

app.post("/registering",(req,res)=>{
    var username=req.body["username"];
    var password=req.body["password"];
    connection.query('select * from loginuser where user_name=?',[username],(error,results)=>{
        if(error){
            console.log("Error in Fetching Data");
        }
        if(results.length>0){
            res.status(400).send("Username is already taken. Please choose a different username.");
            return;
        }else{
            connection.query("INSERT INTO loginuser (user_name, user_pass) VALUES (?, ?)", [username, password], (insertError) => {
                if (insertError) {
                    throw insertError;
                } else {
                    req.flash("Registration Successful as a User");
                    res.redirect("/loginuser");
                }
                res.end();
            });
        }
    });
});
function updateUserLoyaltyPoints(userId, loyaltyPointsToAdd) {
    connection.beginTransaction((err)=>{
        if(err){
            console.error('Error starting transaction:',err);
            return;
        }
        const sql = 'UPDATE loginuser SET loyalty_points = loyalty_points + ? WHERE user_id = ?';
        connection.query(sql, [loyaltyPointsToAdd, userId], (error, results) => {
            if (error) {
                console.error('Error updating loyalty points:', error);
                connection.rollback(()=>{console.error("Transaction rolled back.")});
            } else {
                console.log('Loyalty points updated successfully');
                connection.commit((commiterror)=>{
                    if(commiterror){
                        console.error('Error committing transaction: ',commiterror);
                        connection.rollback(()=>{
                            console.error('Rolling back transaction');
                        });
                    }else{
                        console.log('Transaction committed succesfully');
                    }
                });
            }
        });
    });
}

app.post("/registering42",(req,res)=>{
    var username=req.body["username"];
    var password=req.body["password"];
    connection.beginTransaction((err)=>{
        if(err){
            console.error('Error starting transaction:',err);
            res.status(500).send('Internal Server Error');
            return;
        }
        connection.query("SELECT * FROM vendor where vend_name=?",[username],(error,results)=>{
            if(error){
                console.error('Error checking existing vendor: ',error);
                connection.rollback(()=>{
                    console.error('Transaction rolled back');
                    res.status(500).send('Server Error');
                });
                return;
            }
            if(results.length>0){
                connection.rollback(()=>{
                    console.log("Vendro Name Already Taken.Please Choose another.");
                    console.log('Transaction rolled back');
                    req.flash("Error, Vendor name already exists. Please try a different one.");
                    res.redirect("/login45");
                });
            }else{
                connection.query("insert into vendor(vend_name,vend_pass) values (?,?);",[username,password],(error)=>{
                    if(error){
                        console.error('Error inserting new vendor:', insertError);
                        connection.rollback(() => {
                            console.error('Transaction rolled back');
                            res.status(500).send('Internal Server Error');
                        });
                        return;
                    }else{
                        connection.commit((commiterror)=>{
                            if(commiterror){
                                console.error('Error Committing Transaction:',commiterror);
                                connection.rollback(()=>{
                                    console.log('Transaction rolled back');
                                    res.status(500).send('Internal server');
                                });
                                return;
                            }
                            req.flash("Registration Succesful as a Vendor");
                            console.log("Vendor Registration Succesful");
                            res.redirect("/vendorpp");

                        });
                    }
                });

            }

        });
    })

});
app.post('/add-book', upload.single('bookImage'), function(req, res) {
    const vendorId = req.session.vendorId;
    const type="New";
    const bookName = req.body["name"];
    const bookQuantity = req.body["quantity"];
    const bookPrice = req.body["price"];
    const imagePath=req.file ? req.file.path : null ;

    const query = "SELECT * FROM book WHERE book_name = ? AND vendor_id = ? AND book_price = ?";
    connection.query(query, [bookName, vendorId, bookPrice], function(error, results, fields) {
        if (error) {
            console.log(error);
            res.status(500).send("Error checking book existence");
            return;
        }
        if (results.length > 0) {
            const existingBookId = results[0].id;
            const existingBookQuantity = results[0].book_quantity;
            const newQuantity = parseInt(existingBookQuantity) + parseInt(bookQuantity);
            connection.query("UPDATE book SET book_quantity = ? WHERE id = ?", [newQuantity, existingBookId], function(updateError, updateResults, updateFields) {
                if (updateError) {
                    console.log(updateError);
                    res.status(500).send("Error updating book quantity");
                    return;
                }
                req.flash('Update Book Info SUccesfully');
                res.redirect("/vendorpp")
            });
        } else {
            connection.query("INSERT INTO book (book_name, book_quantity, book_price, vendor_id,book_type) VALUES (?, ?, ?, ?,?)", [bookName, bookQuantity, bookPrice, vendorId,type], function(insertError, insertResults, insertFields) {
                if (insertError) {
                    console.log(insertError);
                    res.status(500).send("Error adding book");
                    return;
                }
                req.flash("Book Added Succesfully");
                res.redirect("/vendorpp");
            });
        }
    });

});
app.post('/donate-book', upload.single('bookImage'), function(req, res) {
    const userId = req.session.userId;
    const type="Old";
    const bookName = req.body["name"];
    const bookQuantity = req.body["quantity"];
    const bookPrice = req.body["price"];
    const imagePath=req.file ? req.file.path : null ;

    connection.query("INSERT INTO donated_book (book_name, book_quantity, book_price, user_id,book_type) VALUES (?, ?, ?, ?,?)", [bookName, bookQuantity, bookPrice, userId,type], function(insertError, insertResults, insertFields) {
            if (insertError) {
                console.log(insertError);
                res.status(500).send("Error adding book");
                return;
            }
            updateUserLoyaltyPoints(userId,10*parseInt(bookQuantity));
            req.flash("Book Added Succesfully");
            res.redirect("/donation");
        });
        
});
app.post('/add-to-cart', (req, res) => {
    const source=req.body.source;
    if(source==='homepage'){
        const userId = req.session.userId;
        const bookId = req.body.bookId;
        const price = req.body.price;
        const quantity = req.body.quantity;
        connection.query('SELECT * FROM cart WHERE user_id = ? AND book_id = ? AND price = ?', [userId, bookId, price], (error, results, fields) => {
            
            if (error) {
                console.error('Error checking cart:', error);
                req.flash('error', 'Error checking cart');
                return res.redirect('/homepage');
            }

            if (results.length > 0) {
                const existingQuantity = results[0].quantity;
                const newQuantity = existingQuantity + parseInt(quantity);

                connection.query('UPDATE cart SET quantity = ? WHERE user_id = ? AND book_id = ? AND price = ?', [newQuantity, userId, bookId, price], (error, results, fields) => {
                    if (error) {
                        console.error('Error updating quantity:', error);
                        req.flash('error', 'Error updating quantity');
                        return res.redirect('/homepage');
                    }
                    connection.query('select book_name from book where id=?',[bookId],(error,results)=>{
                        if(error){
                            req.flash('error','Book did not added succesfully');
                            return res.redirect('/homepage');
                        }
                        const bookname=results[0].book_name;
                        req.flash('success', `Quantity of Book: ${bookname} already Present in Cart have been updated in cart successfully`);
                    res.redirect('/homepage');
                    })
                });
            } else {
                connection.query('INSERT INTO cart (user_id, book_id, price, quantity) VALUES (?, ?, ?, ?)', [userId, bookId, price, quantity], (error, results, fields) => {
                    if (error) {
                        console.error('Error adding item to cart:', error);
                        req.flash('error', 'Error adding item to cart');
                        return res.redirect('/homepage');
                    }
                    connection.query('select book_name from book where id=?',[bookId],(error,results)=>{
                        if(error){
                            req.flash('error','Book did not added succesfully');
                            return res.redirect('/homepage');
                        }
                        const bookname=results[0].book_name;
                        req.flash('success', `Book ${bookname} was added succesfully to the cart.`);
                        res.redirect('/homepage');
                    })
                });
            }
        });
    }else if(source==="donated"){
        const userId = req.session.userId;
        const bookId = req.body.bookId;
        const price = req.body.price;
        const quantity = req.body.quantity;
        connection.query('SELECT * FROM cart WHERE user_id = ? AND book_id = ? AND price = ?', [userId, bookId, price], (error, results, fields) => {
        
            if (error) {
                console.error('Error checking cart:', error);
                req.flash('error', 'Error checking cart');
                return res.redirect('/donatepage');
            }
    
            if (results.length > 0) {
                const existingQuantity = results[0].quantity;
                const newQuantity = existingQuantity + parseInt(quantity);
    
                connection.query('UPDATE cart SET quantity = ? WHERE user_id = ? AND book_id = ? AND price = ?', [newQuantity, userId, bookId, price], (error, results, fields) => {
                    if (error) {
                        console.error('Error updating quantity:', error);
                        req.flash('error', 'Error updating quantity');
                        return res.redirect('/donatepage');
                    }
                    connection.query('select book_name from donated_book where id=?',[bookId],(error,results)=>{
                        if(error){
                            req.flash('error','Book did not added succesfully');
                            return res.redirect('/donatepage');
                        }
                        const bookname=results[0].book_name;
                        req.flash('success', `Quantity of Book: ${bookname} already Present in Cart have been updated in cart successfully`);
                    res.redirect('/donatepage');
                    })
                });
            } else {
                connection.query('INSERT INTO cart (user_id, book_id, price, quantity) VALUES (?, ?, ?, ?)', [userId, bookId, price, quantity], (error, results, fields) => {
                    if (error) {
                        console.error('Error adding item to cart:', error);
                        req.flash('error', 'Error adding item to cart');
                        return res.redirect('/donatepage');
                    }
                    connection.query('select book_name from donated_book where id=?',[bookId],(error,results)=>{
                        if(error){
                            req.flash('error','Book did not added successfully');
                            return res.redirect('/donatepage');
                        }
                        const bookname=results[0].book_name;
                        req.flash('success', `Book ${bookname} was added successfully to the cart.`);
                        res.redirect('/donatepage');
                    })
                });
            }
        });
    }
});
app.get('/view-cart', (req, res) => {
    const userId = req.session.userId;
    connection.query('SELECT * FROM cart WHERE user_id = ?', [userId], (error, results, fields) => {
        if (error) {
            console.error('Error fetching cart items:', error);
            res.status(500).send('Error fetching cart items');
            return;
        }
        res.render('Cart', { cartItems: results });
    });
});

app.post('/checkout', (req, res) => {
    const userId = req.session.userId;
    let total_price = 0;
    let redirectNeed = false;
    connection.beginTransaction((traerror)=>{
        if(traerror){
            console.error('Error Starting transaction: ',traerror);
            res.status(500).send('Internal Server Error');
            return;
        }
        connection.query('SELECT book_id, price, quantity FROM cart WHERE user_id=?', [userId], (error, betaresults) => {
            if (error) {
                console.error('Error fetching cart items:', error);
                console.rollback(()=>{
                    console.error('Transaction Rolled Back');
                    console.log("Transaction Faield");
                    res.status(500).send('Error fetching cart items');
                });
                return;
            }
            
            connection.query('SELECT id, book_quantity FROM book FOR UPDATE', (error, bookResults) => {
                if (error) {
                    console.error('Error fetching available quantity for book:', error);
                    connection.rollback(()=>{
                        console.error('Transaction rolled back');
                        res.status(500).send('Error fetching available quantity for book');
                    });
                    return;
                }
    
                for (let i = 0; i < betaresults.length; i++) {
                    const cartItem = betaresults[i];
                    const book = bookResults.find(book => book.id === cartItem.book_id);
                    if (!book) {
                        console.error(`Book details not found for book ID: ${cartItem.book_id}`);
                        continue;
                    }
    
                    if (cartItem.quantity > book.book_quantity) {
                        redirectNeed = true;
                        break;
                    }
                }
                if (redirectNeed) {
                    connection.query('delete from cart where user_id=?',[userId],(error,results)=>{
                        if (error) {
                            console.error('Error deleting cart items:', error);
                            res.status(500).send('Error deleting cart items');
                            return;
                        }
                    })
                    connection.rollback(()=>{
                        req.flash('success', 'Quantity for one or more items exceeds available quantity');
                        res.redirect('/homepage');
                    });
                    return;
                }
    
                for (let i = 0; i < betaresults.length; i++) {
                    total_price += parseInt(betaresults[i].price * betaresults[i].quantity);
                }
    
                connection.query('INSERT INTO orders (user_id, total_price) VALUES (?, ?)', [userId, total_price], (error, results) => {
                    if (error) {
                        console.error('Error placing order:', error);
                        connection.rollback(()=>{
                            console.error('Transaction rolled back')
                            res.status(500).send('Error placing order');
                        });
                        return;
                    }
    
                    connection.query('DELETE FROM cart WHERE user_id=?', [userId], (error, result) => {
                        if (error) {
                            console.error('Error deleting cart items:', error);
                            connection.rollback(()=>{
                                console.error("Transaction rolled back");
                                res.status(500).send('Error deleting cart items');
                            });
                            return;
                        }
                        for (let i = 0; i < betaresults.length; i++) {
                            const bookId = betaresults[i].book_id;
                            const quantity = betaresults[i].quantity;
                            connection.query('UPDATE book SET book_quantity = book_quantity - ? WHERE id = ?', [quantity, bookId], (error, updateResult) => {
                                if (error) {
                                    console.error('Error updating book quantity:', error);
                                    res.status(500).send('Error updating book quantity');
                                    return;
                                }
                            });
                        }
    
                        updateUserLoyaltyPoints(userId, 100);
                        connection.commit((commiterror)=>{
                            if(commiterror){
                                console.error("Error committing transaction",commiterror);
                                connection.rollback(()=>{
                                    console.error("Transaction rolled back");
                                    res.status(500).send('Error Committing transaction');
                                });
                                return;
                            }
                            console.log("Transaction committed Ordered Placed");
                            req.flash('success', 'Order placed successfully');
                            res.redirect('/homepage');
                        });
                    });
                });
            });
        });
    });
});

app.listen(port,()=>{console.log(`Server is running on ${port}`)});