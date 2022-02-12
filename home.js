const  express =require('express');
const server =  express();
const FirestoreClient = require('./firebase_config');
const DataManipulator = require("./data_manipulator");
const Trip = require("./Trip");


server.get('/',function(req,res){
    res.send("WELCOME");

});

server.get("/getUser",function(req,res){
const email = req.query.user_token;
 const pull = async()=>{
     const response =await FirestoreClient.getData("Users",DataManipulator.decryptUserId(email));
   
     if(response!=undefined){
        delete response.pass;
        delete response.date;
        const stringify_response = JSON.stringify({message:"User found",data:response,status:"200"});
        res.status(200);
        res.send(stringify_response);
     }else{
        const stringify_response = JSON.stringify({message:"User not found",status:"400"});
        res.status(404);
        res.send(stringify_response);  
     }
     
 }
 pull();
});

server.get("/wallet",function(req,res){
    const email = req.query.token;
    if(email!=undefined){
        const pull = async()=>{
            const response =await FirestoreClient.getData("Users",DataManipulator.decryptUserId(email));
            if(response!=undefined){
               const stringify_response = JSON.stringify({message:"User found",data:response.balance,state:"success"});
               res.status(200);
               res.send(stringify_response);
            }else{
               const stringify_response = JSON.stringify({message:"User not found",status:"400"});
               res.status(404);
               res.send(stringify_response);  
            }
            
        }
        pull();
    }else{
        const stringify_response = JSON.stringify({message:"Bad request",state:"Error"});
               res.status(400);
               res.send(stringify_response); 
    }

    });

    server.get("/tripcost",function(req,res){
        const lat = req.query.lat;
        const long = req.query.long;
        const cost = Trip.getTripFare(lat,long); 
        res.status(200);
        const response = {Message:"Trip cost gotten",data:cost,state:"Success"}
        res.send(JSON.stringify(response));
        
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
            const response = await FirestoreClient.getData('Users',DataManipulator.decryptUserId(user_id));

            if(response==undefined){
                
            await FirestoreClient.save('Users',DataManipulator.decryptUserId(user_id),user_details);
            delete user_details.pass;
            delete user_details.date;
            delete user_details.user_type;
            delete user_details.status;
            user_details["token"]=user_id;
            const stringify_response = JSON.stringify({
                message:"Registered Successfully",
                data:user_details,
            });
            res.status(201);
            res.send(stringify_response);

            
        }else{
            const stringify_response = JSON.stringify({
                message:"Account already exist",
                error:"Duplicate entry",
                state:"error"
            });
            res.status(409);
            res.send(stringify_response);
        }
    }
        
        save();

        
    }else{
        res.send("Validation error, incomplete data");
    }
   
});

server.get("/updateuser",function(req,res){
    const user_email = req.query.user_token;
    const field_to_update= req.query.data;
    const value_to_update = req.query.value;
    //const user_id =DataManipulator.getUserId(user_email);
    let field={field:field_to_update,value:value_to_update};
    const update = async()=>{
        try{
          const response =  await FirestoreClient.updateData("Users",DataManipulator.decryptUserId(user_email),field);
          const responseU = await FirestoreClient.getData('Users',DataManipulator.decryptUserId(user_email));
         delete responseU.pass;
         delete responseU.date;
            const JSON_response = {
                message:""+field_to_update+" field updated as "+value_to_update,
                data:responseU,
                state:"Successful"
            };
            const stringify_response = JSON.stringify(JSON_response);
            res.status(202);
            res.send(stringify_response);
           
        }catch(catcher){
            res.status(404);
            const JSON_responseE = {
                message:"User to update is not found",
                state:"error"
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
        const response = await FirestoreClient.getData('Users',DataManipulator.getBasicUserId(user_name));
        try{
            if(response!=undefined){
                if(response.pass==user_pass){
                    const response =await FirestoreClient.getData("Users",DataManipulator.getBasicUserId(user_name));
                    response["token"]=DataManipulator.getUserId(user_name);
                    delete response.pass;
                    delete response.date;
                    const JSON_response = {
                        message:"Login Successful",
                        data:response,
                        state:"Success"
                    };
                    const stringify_response = JSON.stringify(JSON_response);
                    res.status(200);
                    res.send(stringify_response);
                
        
                }else{
                    res.status(400);
                    const JSON_response = {
                        message:"Invalid login details",
                        data:"Password not corect",
                        state:"Error"
                        
                    };
                    const stringify_response = JSON.stringify(JSON_response);
                    res.send(stringify_response);
                }
            }else{
                const JSON_response = {
                    message:"User not found",
                    data:"User has not registered with the platform",
                    state:"Error"
                };
                const stringify_response = JSON.stringify(JSON_response);
                res.status(404);
                res.send(stringify_response);
            }

        }catch(catcher){
        
            const JSON_response = {
                message:"User not found",
                data:catcher, 
                state:"Error"
            };
            const stringify_response = JSON.stringify(JSON_response);
            res.status(404);
            res.send(stringify_response);
        }
     
        
    }
    result();
});

server.get('/createtrip',function(req,res){
    let pickup_location =req.query.pickup_location;
    let final_destination=req.query.final_destination;
    let package_description = req.query.package_description;
    let package_name = req.query.package_name;
    let lat_coord = req.query.lat_coord;
    let long_coord = req.query.long_coord;
    let amount= Trip.getTripFare(lat_coord,long_coord);
    let sender_name = req.query.sender_name;
    let sender_phone = req.query.sender_phone;
    let receiver_name = req.query.receiver_name;
    let receiver_phone = req.query.receiver_phone;
    let initiator=req.query.user_token;
    let time =new Date().toString();
    let trip_id=DataManipulator.getTripId(initiator,time);
    if(Trip.Possible(initiator,amount)){

        const trip_details ={pickup_location:pickup_location,final_destination:final_destination,
            lat_coord:lat_coord,long_coord:long_coord,amount:amount,driver:"",time:time,id:trip_id,
            trip_start_time:"",trip_end_time:"",trip_status:"Initiated",initiator:DataManipulator.decryptUserId(initiator),
            package_description:package_description,package_name:package_name,driver_name:"",driver_phone:"",
            sender_name:sender_name,sender_phone:sender_phone,receiver_name:receiver_name,receiver_phone:receiver_phone};
            
        const save = async()=>{
            try{
                await FirestoreClient.save("Trip",trip_id,trip_details);
                const trip_information={pickup_location:trip_details.pickup_location,final_destination:final_destination,amount:amount,package_description:package_description,receiver_name:receiver_name,receiver_phone:receiver_phone,sender_name:sender_name,sender_phone:sender_phone,trip_id:trip_id};
                res.status(201);
                const response ={
                    message:"Trip created, searching for a rider...",
                    state:"Successful",
                    data:trip_information
                    
                };
                const stringify_response = JSON.stringify(response);
                res.end(stringify_response);

            }catch(catcher){
                res.status(404);
                const response ={
                    message:"Error creating trip",
                    state:"Error",
                    
                };
                const stringify_response = JSON.stringify(response);
                res.end(stringify_response);
            }
            
            
        }
        save();
    }else{
        res.status(402);
         const response = {
             message:"You do not have sufficient balance to perform this trip",
             state:"Error"
            };
            const stringify_response = JSON.stringify(response);
            res.end(stringify_response);
        
    }
    

});

server.get("/picktrip",function(req,res){
    const trip_id = req.query.trip_id;
    const user_name = req.query.user_token;
    let field={field:"driver",value:DataManipulator.decryptUserId(user_name)};
    const update = async()=>{

        const responseT = await FirestoreClient.getData('Trip',trip_id);
        let trip_status = responseT.trip_status;
        
        if(trip_status=="Initiated"){
        await FirestoreClient.updateData("Trip",trip_id,field);

        const responseU = await FirestoreClient.getData('Users',DataManipulator.decryptUserId(user_name));
        
            
        field={field:"driver_name",value:responseU.name};
        await FirestoreClient.updateData("Trip",trip_id,field);
        field={field:"driver_phone",value:responseU.phone};
        await FirestoreClient.updateData("Trip",trip_id,field);
        

        field ={field:"trip_status",value:"Picked"};
       try{
        await FirestoreClient.updateData("Trip",trip_id,field);
        res.status(202);
        const response = {
            message:"Trip Picked",
            state:"Success",
            data:responseU
           };
           const stringify_response = JSON.stringify(response);
           res.end(stringify_response);

       }catch(catcher){
        res.status(404);
        const response = {
            message:"No trip with ID",
            state:"Error"
           };
           const stringify_response = JSON.stringify(response);
           res.end(stringify_response);

       }
    }else{
            res.status(403);
            const response = {
            message:"Trip has been picked by another Rider",
            state:"error",
            
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
        const responseT = await FirestoreClient.getData('Trip',DataManipulator.getTripId(trip_id));
        let trip_status = responseT.trip_status;
        if(trip_status=="Picked"){
        await FirestoreClient.updateData("Trip",trip_id,field);
        field ={field:"trip_status",value:"Started"};
        try{
            await FirestoreClient.updateData("Trip",trip_id,field);
            res.status(202);
            const response = {
                message:"Trip Started",
               state:"Success"
               };
               const stringify_response = JSON.stringify(response);
               res.end(stringify_response);
    
           }catch(catcher){
            res.status(404);
            const response = {
                message:"No trip with ID",
               state:"Error"
               };
               const stringify_response = JSON.stringif(response);
               res.end(stringify_response);
    
           }
        }else{
            res.status(406);
            const response = {
            message:"Trip is not ready to be started yet, trip is currently at "+trip_status,
            status:"Error"
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
        const responseT = await FirestoreClient.getData('Trip',DataManipulator.getTripId(trip_id));
        let trip_status = responseT.trip_status;
        if(trip_status=="Started"){
        Trip.makePayment(trip_id);
        await FirestoreClient.updateData("Trip",trip_id,field);
        field ={field:"trip_status",value:"Ended"};
        try{
            await FirestoreClient.updateData("Trip",trip_id,field);
            res.status(202);
            const response = {
                message:"Trip Ended",
               state:"Success"
               };
               const stringify_response = JSON.stringify(response);
               res.end(stringify_response);
    
           }catch(catcher){
            res.status(404);
            const response = {
                message:"No trip with ID",
               state:"Error"
               };
               const stringify_response = JSON.stringify(response);
               res.end(stringify_response);
    
           }
        }else{
            res.status(406);
            const response = {
            message:"Current trip state is not at started, current trip state is at "+trip_status,
           state:"Error"
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
            res.status(202);
            const response = {
                message:"Trip Canceled",
               state:"Error"
               };
               const stringify_response = JSON.stringify(response);
               res.end(stringify_response);
    
           }catch(catcher){
            res.status(404);
            const response = {
                message:"No trip with ID",
               state:"Error"
               };
               const stringify_response = JSON.stringify(response);
               res.end(stringify_response);
    
           }
        
    }
    update();

});



server.get("/fundwallet",function(req,res){
    const user_name = req.query.token;
    let amount = req.query.amount;
    amount = parseInt(amount);
    if(amount > 100){

        const result = async() =>{
            const response = await FirestoreClient.getData('Users',DataManipulator.decryptUserId(user_name));
            
            if(response!=undefined){
                let current_amount = parseInt(response.balance) + parseInt(amount);
                current_amount = current_amount.toString();
                const field = {field:"balance",value:current_amount}
                const update = async() => {
               
                try{
                    await FirestoreClient.updateData("Users",DataManipulator.decryptUserId(user_name),field);
                    res.status(200);
                    const response = {
                        message:"Wallet funded",
                        data: current_amount,
                       state:"Success"
                       };
                       const stringify_response = JSON.stringify(response);
                       res.end(stringify_response);
            
                   }catch(catcher){
                    res.status(404);
                    const response = {
                        message:"No trip with ID",
                        state:"Error"
                       };
                       const stringify_response = JSON.stringify(response);
                       res.end(stringify_response);
            
                   }
            }
                update();
            }else{
                res.status(404);
                const JSON_response = JSON.stringify({message:"User does not exist",state:"Error"});
                res.send(JSON_response);
            }
            
            
        }
        result();

        
    }else{
        res.status(403);
                    const response = {
                        message:"Minimum amount to fund wallet is 100",
                        state:"Error"
                       };
                       const stringify_response = JSON.stringify(response);
                       res.end(stringify_response);
    }
});

server.listen(process.env.PORT || 3000, function(){
    console.log("Server is listening on port %d ",this.address().port,process.env.GOOGLE_APPLICATION_CREDENTIALS ="./deliiv_credentials.json");
});
