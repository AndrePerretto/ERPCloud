var sql = require("mssql");

function teste(){
    return "aa";
}

function query()
{

    // config for your database
    var config = {
        user: 'sa',
        password: 'IntSql2015@',
        server: '172.31.8.216', 
        database: 'eCloud-homologa' 
    };

    // connect to your database
    sql.connect(config, function (err) {    
        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();
           
        // query to the database and get the records
        request.query('select TOP 2 * from entidade', function (err, recordset) {            
            if (err) console.log(err)

            // send records as a response
            return recordset;            
        });
    });
}