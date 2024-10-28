const express = require('express');
const connect = require('./db.js');
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));


app.set('port', process.env.PORT);

app.get('/libros' , async (req, res) => {
    let db;
    try {
        db = await connect();
        const query = "SELECT * FROM libros";
        const [rows] = await db.execute(query);
        console.log(rows);
        
        res.json({
            data: rows,
            status: 200
        });
        console.log('Conexión a la bd establecida');
    }catch(err) {
        console.error('Ocurrió un error al realizar la conexión a la bd ', err);
        throw err;
    }finally {
        if (db)  await db.end(); // Cerrar la conexión
    }    
});

app.get('/libros/:isbn', async (req, res) => { 
    let db;
    try{
        const isbn = req.params.isbn;
        db = await connect();
        const query = `SELECT * FROM libros WHERE isbn='${isbn}'`;
        const [rows] = await db.execute(query);
        console.log(rows);

        res.json({
            data: rows,
            status: 200
        })

    } catch(err) {
        console.error(err);
    } finally {
        if(db)
            db.end();
    }
});

app.post('/libros', async (req, res) => { 
    let db;
    try{
        console.log(req.body)
        const { isbn, nombre, no_Paginas } = req.body

        db = await connect();
        const query = `CALL SP_NUEVO_LIBRO ('${isbn}', '${nombre}', ${no_Paginas})`;
        const [rows] = await db.execute(query);
        console.log(rows);

        res.json({
            data: rows,
            status: 200
        })
    } catch(err) {
        return res.status(500).json({message: "Algo salió mal al agregar el libro"})
    } finally {
        if(db)
            db.end();
    }
});

app.delete('/libros/:isbn', async (req, res) => {
    let db;
    try { 
        const isbn = req.params.isbn;
        db = await connect();
        const query = `CALL SP_BORRAR_LIBRO ('${isbn}')`;
        const [rows] = await db.execute(query);
        console.log(rows);
        if(rows.affectedRows === 0) {
            res.json({
                data: {},
                msg: 'El valor no fue encontrado',
                status: 404
            });
        }else {
            res.json({
                data: {},
                msg: 'Dato eliminado',
                status: 200
            });
        }
       
    } catch(err) {
        return res.status(500).json({message: "Algo salió mal al eliminar el libro"})
    } finally {
        if(db)
            db.end();
    }
});

app.put('/libros/:isbn', async (req, res) => {
    let db;
    let { nombre, no_Paginas } = req.body;
    let isbn = req.params.isbn;
    try{
        if(nombre === undefined)
            nombre = '';
        if(no_Paginas === undefined)
            no_Paginas = 0;
        db = await connect();
        const query = `CALL SP_ACTUALIZAR_LIBRO ('${isbn}', '${nombre}', ${no_Paginas})`;
        const [rows] = await db.execute(query);
        console.log(rows);

        if(rows.affectedRows === 0) {
            res.json({
                data: {},
                msg: 'El libro no existe',
                status: 404
            });
        }else {
            res.json({
                data: {},
                msg: 'Datos actualizados',
                status: 200
            });
        }
       
    } catch(err) {
        return res.status(500).json({message: "Algo salió mal al actualizar los datos del libro"})
    } finally {
        if(db)
            db.end();
    }
});


app.listen(app.get('port'), () =>{
    console.log('app escuchando en el puerto', app.get('port'))
});


