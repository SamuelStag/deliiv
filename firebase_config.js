const Firestore = require("@google-cloud/firestore");


class FirestoreClient{
  constructor(){
    this.firestore = new Firestore({
      apiKey: "AIzaSyCDsanqSMFq6NHzEYb6v35YTG0pcdijp98",
      authDomain: "deliiv.firebaseapp.com",
      projectId: "deliiv",
      storageBucket: "deliiv.appspot.com",
      messagingSenderId: "743018935905",
      appId: "1:743018935905:web:9c8771880a78e657395c20",
      measurementId: "G-JPG3QCGVL0"
      
    });
  }

 async save(collection,document,data){
   const docRef = this.firestore.collection(collection).doc(document);
   await docRef.set(data);

 }
 async getData(collection,document){
  let result={};
  const docRef = this.firestore.collection(collection).doc(document);
  result =await docRef.get();
  return result.data();
 }
 async updateData(collection,document,field){
  const docRef = this.firestore.collection(collection).doc(document);
  const res = await docRef.update(field.field,field.value);
 }
 
}

module.exports = new FirestoreClient();