class DataManipulator{
    constructor(){

    }
     getUserId(user_email){
        let result=user_email.replace("@","~");
        return result;
    }
    getTripId(initiator,time){
        return this.getUserId(initiator)+(Math.floor(Date.now() / 1000));
    }
}
module.exports = new DataManipulator();