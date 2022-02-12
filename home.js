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
     if(response!=""){
        const stringify_response = JSON.stringify({message:"User found",data:response,status:"200"});
        res.status(200);
        res.send(stringify_response);
     }else{
        const stringify_response = JSON.stringify({message:"User not found",status:"400"});
        res.status(400);
        res.send(stringify_response);  
     }
     
 }
 pull();
});

server.get('/register', function(req,res){
    let user_name = req.query.name;
    let user_email = req.query.email;
    let user_phone =  req.query.phone;
    let user_pass = req.query.pass;
    let user_type = req.query.type;
    let user_details = {name:"",email:"",phone:"",pass:"",date:"",balance:"0",user_type:"",avi:"",status:"idle"};
    if(user_name!=undefined && user_email!=undefined && user_phone!=undefined && user_pass!=undefined,user_type!=undefined){
        user_details.name=user_name;
        user_details.email= user_email; 
        user_details.pass= user_pass; 
        user_details.phone=user_phone;
        user_details.user_type= user_type;
        user_details.date= new Date().toString();
        const user_id =DataManipulator.getUserId(user_email);
        const save = async() => {
            
            await FirestoreClient.save('Users',user_id,user_details);
            const stringify_response = JSON.stringify({
                message:"Registered Successfully",
                data:user_details,
                status:"200"
            });
            res.send(stringify_response);

            
        }
        
        save();

        
    }else{
        res.send("Validation error, incomplete data");
    }
    res.end();
});

server.get("/updateuser",function(req,res){
    const user_email = req.query.email;
    const field_to_update= req.query.data;
    const value_to_update = req.query.value;
    const user_id =DataManipulator.getUserId(user_email);
    let field={field:field_to_update,value:value_to_update};
    const update = async()=>{
        try{
          const response =  await FirestoreClient.updateData("Users",user_id,field);
            const JSON_response = {
                message:""+field_to_update+" field updated as "+value_to_update,
                data:response,
                status:"200"
            };
            const stringify_response = JSON.stringify(JSON_response);
            res.status(200);
            res.send(stringify_response);
        }catch(catcher){
            res.status(400);
            const JSON_responseE = {
                message:"User to update is not found",
                data:"error",
                status:"400"
            };
            const stringify_response = JSON.stringify(JSON_responseE);
            res.send(stringify_response);
        }
            

    }
    update();

});


server.get('/login', function(req,res){
    const user_name = req.query.email;
    const user_pass = req.query.pass;
    const result = async() =>{
        const response = await FirestoreClient.getData('Users',DataManipulator.getUserId(user_name));
        try{
            if(response!=undefined){
                if(response.pass==user_pass){
                    const response =await FirestoreClient.getData("Users",DataManipulator.getUserId(user_name));
                    const JSON_response = {
                        message:"Login Successful",
                        data:response,
                        status:"200"
                    };
                    const stringify_response = JSON.stringify(JSON_response);
                    res.status(200);
                    res.send(stringify_response);
                
        
                }else{
                    res.status(400);
                    const JSON_response = {
                        message:"Invalid login details",
                        data:response,
                        status:"400"
                    };
                    const stringify_response = JSON.stringify(JSON_response);
                    res.send(stringify_response);
                }
            }else{
                const JSON_response = {
                    message:"User not found",
                    data:response,
                    status:"400"
                };
                const stringify_response = JSON.stringify(JSON_response);
                res.status(200);
                res.send(stringify_response);
            }

        }catch(catcher){

            const JSON_response = {
                message:"User not found",
                data:response,
                status:"400"
            };
            const stringify_response = JSON.stringify(JSON_response);
            res.status(200);
            res.send(stringify_response);
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
            try{
                await FirestoreClient.save("Trip",trip_id,trip_details);
                res.status(200);
                const response ={
                    message:"Trip created",
                    status:"200"
                };
                const stringify_response = JSON.stringify(response);
                res.end(stringify_response);

            }catch(catcher){
                res.status(400);
                const response ={
                    message:"Trid ID does not match any we have ",
                    status:"400"
                };
                const stringify_response = JSON.stringify(response);
                res.end(stringify_response);
            }
            
            
        }
        save();
    }else{
         const response = {
             message:"You do not have sufficient balance to perform this trip",
            status:"200"
            };
            const stringify_response = JSON.stringify(response);
            res.end(stringify_response);
        
    }
    

});

server.get("/picktrip",function(req,res){
    const trip_id = req.query.trip_id;
    const driver = req.query.driver;
    let field={field:"driver",value:driver};
    const update = async()=>{

        const responseT = await FirestoreClient.getData('Users',DataManipulator.getUserId(user_name));
        let trip_status = responseT.trip_status;
        if(trip_status=="Initiated"){
        await FirestoreClient.updateData("Trip",trip_id,field);
        field ={field:"trip_status",value:"Picked"};
       try{
        await FirestoreClient.updateData("Trip",trip_id,field);
        res.status(200);
        const response = {
            message:"Trip Picked",
           status:"200"
           };
           const stringify_response = JSON.stringify(response);
           res.end(stringify_response);

       }catch(catcher){
        res.status(400);
        const response = {
            message:"No trip with ID",
           status:"400"
           };
           const stringify_response = JSON.stringify(response);
           res.end(stringify_response);

       }
    }else{
            res.status(400);
            const response = {
            message:"Trip has been picked by another Rider",
           status:"400"
           };
           const stringify_response = JSON.stringify(response);
           res.end(stringify_response);
    }
           
            
   
       
    }
    update();
    

});

server.get("/starttrip",function(req,res){
    const trip_id = req.query.trip_id;
    const time = new Date().toString();;
    let field={field:"trip_start_time",value:time};
    const update = async()=>{
        const responseT = await FirestoreClient.getData('Users',DataManipulator.getUserId(user_name));
        let trip_status = responseT.trip_status;
        if(trip_status=="Picked"){
        await FirestoreClient.updateData("Trip",trip_id,field);
        field ={field:"trip_status",value:"Started"};
        try{
            await FirestoreClient.updateData("Trip",trip_id,field);
            res.status(200);
            const response = {
                message:"Trip Started",
               status:"200"
               };
               const stringify_response = JSON.stringify(response);
               res.end(stringify_response);
    
           }catch(catcher){
            res.status(400);
            const response = {
                message:"No trip with ID",
               status:"400"
               };
               const stringify_response = JSON.stringif(response);
               res.end(stringify_response);
    
           }
        }else{
            res.status(400);
            const response = {
            message:"Trip is not ready to be started yet, trip is currently at "+trip_status,
           status:"400"
           };
           const stringify_response = JSON.stringify(response);
           res.end(stringify_response);
    }
    
    }
    update();

});

server.get("/endtrip",function(req,res){
    const trip_id = req.query.trip_id;
    const time = new Date().toString();
    let field={field:"trip_end_time",value:time};
    const update = async()=>{
        const responseT = await FirestoreClient.getData('Users',DataManipulator.getUserId(user_name));
        let trip_status = responseT.trip_status;
        if(trip_status=="Started"){
        Trip.makePayment(trip_id);
        await FirestoreClient.updateData("Trip",trip_id,field);
        field ={field:"trip_status",value:"Ended"};
        try{
            await FirestoreClient.updateData("Trip",trip_id,field);
            res.status(200);
            const response = {
                message:"Trip Ended",
               status:"200"
               };
               const stringify_response = JSON.stringify(response);
               res.end(stringify_response);
    
           }catch(catcher){
            res.status(400);
            const response = {
                message:"No trip with ID",
               status:"400"
               };
               const stringify_response = JSON.stringify(response);
               res.end(stringify_response);
    
           }
        }else{
            res.status(200);
            const response = {
            message:"Current trip state is not at started, current trip state is at "+trip_status,
           status:"400"
           };
           const stringify_response = JSON.stringify(response);
           res.end(stringify_response);
    }
      
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
        try{
            await FirestoreClient.updateData("Trip",trip_id,field);
            res.status(200);
            const response = {
                message:"Trip Canceled",
               status:"200"
               };
               const stringify_response = JSON.stringify(response);
               res.end(stringify_response);
    
           }catch(catcher){
            res.status(400);
            const response = {
                message:"No trip with ID",
               status:"400"
               };
               const stringify_response = JSON.stringify(response);
               res.end(stringify_response);
    
           }
        
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
            
            if(response!=undefined){
                let current_amount = parseInt(response.balance) + parseInt(amount);
                current_amount = current_amount.toString();
                const field = {field:"balance",value:current_amount}
                const update = async() => {
               
                try{
                    await FirestoreClient.updateData("Users",DataManipulator.getUserId(user_name),field);
                    res.status(200);
                    const response = {
                        message:"Wallet funded",
                        balance: current_amount,
                       status:"200"
                       };
                       const stringify_response = JSON.stringify(response);
                       res.end(stringify_response);
            
                   }catch(catcher){
                    res.status(400);
                    const response = {
                        message:"No trip with ID",
                       status:"400"
                       };
                       const stringify_response = JSON.stringify(response);
                       res.end(stringify_response);
            
                   }
            }
                update();
            }else{
                res.status(400);
                const JSON_response = JSON.stringify({message:"User does not exist",status:"400"});
                res.send(JSON_response);
            }
            
            
        }
        result();

        
    }else{
        res.status(200);
                    const response = {
                        message:"Minimum amount to fund wallet is 100",
                       status:"200"
                       };
                       const stringify_response = JSON.stringify(response);
                       res.end(stringify_response);
    }
});

server.listen(process.env.PORT || 3000, function(){
    console.log("Server is listening on port %d ",this.address().port,process.env.GOOGLE_APPLICATION_CREDENTIALS ="./deliiv_credentials.json");
});
