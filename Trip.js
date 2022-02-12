const FirestoreClient = require('./firebase_config');
const DataManipulator = require("./data_manipulator");
class Trip{
    constructor(){

    }
    getTripFare(pickup_location,final_destination){
        let price =200;
        return price;
    }
    getTripDistance(pickup_location,final_destination){
        let distance_in_km=0;
        // calculation 
        return distance_in_km;
    }
    
    async Possible(user,amount){
        let result = false;
        const userbalance = async()=> {
            const user_det = FirestoreClient.getData("Users",DataManipulator.decryptUserId(user));
            const current_balance = parseInt(user_det.balance);
            return current_balance;

        }
            const user_bal_await = await userbalance();
           
         if(amount > user_bal_await){
             result=true;
         }
        return result;
    }
    makePayment(trip_id){
        const transaction = async()=>{
            const trip =await FirestoreClient.getData("Trip",trip_id);
            const trip_amount = parseInt(trip.amount); 
            const user = trip.initiator;
            const driver = trip.driver; 
            
            // deduct money from user current balance  
            let current_user = await  FirestoreClient.getData("Users",DataManipulator.decryptUserId(user));
            let current_user_balance = parseInt(current_user.balance) - trip_amount;
            let field ={field:"balance",value:current_user_balance}
            await FirestoreClient.updateData("Users",DataManipulator.decryptUserId(user),field);

            // credit driver
             current_user = await  FirestoreClient.getData("Users",DataManipulator.decryptUserId(driver));
             current_user_balance = parseInt(current_user.balance) + trip_amount;
             field ={field:"balance",value:current_user_balance}
            await FirestoreClient.updateData("Users",DataManipulator.decryptUserId(driver),field);

                
        }
        transaction();

    }
}
module.exports = new Trip();