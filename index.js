var fs = require("fs"),
    path = require("path");

var MAIN_JSON = "/index.json";
var ListDB = function(db){
    if(this.constructor !== arguments.callee){
        return new ListDB(db);
    }else{
        this.db = db;
    }
    
    var root = this.root = path.join(__dirname, db);
    var list = this.list = [];
    try{
        list = this.list = JSON.parse( fs.readFileSync( this.root + MAIN_JSON, 'utf-8') );
    }catch(e){
        fs.mkdir(root, {}, function(){
            fs.writeFile( root + MAIN_JSON, "[]" );   
        });
    }

    function save(){
        var tmp;
        while(list.length > 200){
            tmp = list.splice(0,100);
            fs.writeFile( root + MAIN_JSON.replace(/\./, (+ new Date) + "."), JSON.stringify(tmp,null,4) );
        }
        fs.writeFile( root + MAIN_JSON , JSON.stringify(list,null,4) );
        setTimeout(save, 1000*60*2);
    };
    save();
};

ListDB.prototype.setModel = function(model, validate) {
    this.model = model;
    this.validate = new Function( validate || "return true" );
};

ListDB.prototype.save = function(obj){
    if( this.validate(obj) ){
        this.list.push(obj);
    }
};

ListDB.prototype.find = function(param){
    switch( typeof param ){
        case "function":
            return this.list.filter(param);
        case "string":
            return this.list.filter(function(item){
                return param in item;
            });
        default:
            return this.list.filter(function(item){
                for(var k in item){
                    if( param[k] && param[k] instanceof RegExp && !param[k].test(item[k]) ){
                        return false
                    }
                }
                return true;
            });
    }
};

module.exports = ListDB;
