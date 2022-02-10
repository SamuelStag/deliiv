const  express =require('express');
const server =  express();
const FirestoreClient = require('./firebase_config');
const DataManipulator = require("./data_manipulator");
const Trip = require("./Trip");


server.get('/',function(req,res){
    res.send("WELCOME");

});

server.get("/getUser",function(req,res){
const email = req.query.email;
 const pull = async()=>{
     const response =await FirestoreClient.getData("Users",DataManipulator.getUserId(email));
     res.send(response);
 }
 pull();
});

server.get('/register', function(req,res){
    let user_name = req.query.name;
    let user_email = req.query.email;
    let user_phone =  req.query.phone;
    let user_pass = req.query.pass;
    let user_type = req.query.type;
    let user_details = {name:"",email:"",phone:"",pass:"",date:"",balance:"0",user_type:"",avi:""};
    if(user_name!=undefined && user_email!=undefined && user_phone!=undefined && user_pass!=undefined,user_type!=undefined){
        user_details.name=user_name;
        user_details.email= user_email; 
        user_details.pass= user_pass; 
        user_details.phone=user_phone;
        user_details.user_type= user_type;
        user_details.date= new Date().toString();
        const user_id =DataManipulator.getUserId(user_email);
        const save = async() => {
            res.send("Registered Successfully "+user_name);
            await FirestoreClient.save('Users',user_id,user_details);
            
        }
        
        save();

        
    }else{
        res.send("Validation error, incomplete data");
    }
    res.end();
});

server.get('/login', function(req,res){
    const user_name = req.query.email;
    const user_pass = req.query.pass;
    const result = async() =>{
        const response = await FirestoreClient.getData('Users',DataManipulator.getUserId(user_name));
        if(response.pass==user_pass){
            res.send("OK");
        }else{
            res.send("Wrong details");
        }
    }
    result();
});

server.get('/createtrip',function(req,res){
    let pickup_location =req.query.pickup_location;
    let final_destination=req.query.final_destination;
    let amount= Trip.getTripFare(pickup_location,final_destination);
    let initiator=req.query.initiator;
    let time =new Date().toString();
    let trip_id=DataManipulator.getTripId(initiator,time);
    if(Trip.Possible(initiator,amount)){
        
        const trip_details ={pickup_location:pickup_location,final_destination:final_destination,amount:amount,driver:"",time:time,id:trip_id,trip_start_time:"",trip_end_time:"",trip_status:"Initiated",initiator:initiator}
        const save = async()=>{
            await FirestoreClient.save("Trip",trip_id,trip_details);
            res.send("Trip created");
        }
        save();
    }else{
        res.send("You do not have sufficient balance to perform this trip");
    }
    

});

server.get("/picktrip",function(req,res){
    const trip_id = req.query.trip_id;
    const driver = req.query.driver;
    let field={field:"driver",value:driver};
    const update = async()=>{
        await FirestoreClient.updateData("Trip",trip_id,field);
        field ={field:"trip_status",value:"Picked"};
       
            await FirestoreClient.updateData("Trip",trip_id,field);
            res.send("Trip Picked");
   
       
    }
    update();
    

});

server.get("/starttrip",function(req,res){
    const trip_id = req.query.trip_id;
    const time = new Date().toString();;
    let field={field:"trip_start_time",value:time};
    const update = async()=>{
        await FirestoreClient.updateData("Trip",trip_id,field);
        field ={field:"trip_status",value:"Started"};
        
            await FirestoreClient.updateData("Trip",trip_id,field);
            res.send("Trip Started");
    
    }
    update();

});

server.get("/endtrip",function(req,res){
    const trip_id = req.query.trip_id;
    const time = new Date().toString();
    let field={field:"trip_end_time",value:time};
    const update = async()=>{
        Trip.makePayment(trip_id);
        await FirestoreClient.updateData("Trip",trip_id,field);
        field ={field:"trip_status",value:"Ended"};
        await FirestoreClient.updateData("Trip",trip_id,field);
        res.send("Trip Ended");
      
    }
    update();

});

server.get("/canceltrip",function(req,res){
    const trip_id = req.query.trip_id;
    const time = new Date().toString();;
    let field={field:"trip_end_time",value:time};
    const update = async()=>{
        await FirestoreClient.updateData("Trip",trip_id,field);
        field ={field:"trip_status",value:"Canceled"};
        await FirestoreClient.updateData("Trip",trip_id,field);
            res.send("Trip Ended");
        
    }
    update();

});

server.get("/fundwallet",function(req,res){
    const user_name = req.query.email;
    let amount = req.query.amount;
    amount = parseInt(amount);
    if(amount > 100){

        const result = async() =>{
            const response = await FirestoreClient.getData('Users',DataManipulator.getUserId(user_name));
            if(response!=""){
                let current_amount = parseInt(response.balance) + parseInt(amount);
                current_amount = current_amount.toString();
                const field = {field:"balance",value:current_amount}
                const update = async() => {
                await FirestoreClient.updateData("Users",DataManipulator.getUserId(user_name),field);
                res.send("Wallet funded");
            }
                update();
            }else{
                res.send("User does not exist");
            }
            
            
        }
        result();

        
    }else{
        res.send("Minimum amount to fund wallet is 100 naira");
    }
});

server.listen(process.env.PORT || 3000, function(){
    console.log("Server is listening on port %d in %s mode",this.address().port);
});
