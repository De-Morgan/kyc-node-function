import * as functions from 'firebase-functions';
import { UserCredentials } from './models/user-credentials';
import { PasswordHelper } from './services/password-helper';

import * as bcrypt from 'bcrypt';
import * as admin from 'firebase-admin';
import { EmailVerificationHelper } from './services/email-verification-helper';
import { AuthResponse } from './models/auth.response.dto';
admin.initializeApp();



// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

export const signup =   functions.https.onRequest (async (request, response)  =>  {
    var res: AuthResponse;
    try{
        const data: UserCredentials = request.body;
        const salt = await bcrypt.genSalt();
        console.log("salt",salt);
        const hashedPassword = await PasswordHelper.hashPassword(data.password,salt);
     const userDoc = await admin.firestore().collection('users').add({
        name: data.name,
        username: data.username,
        email: data.email,
        salt: salt,
        emailVerified: false,
        password: hashedPassword,
        kycLevel: 0,
    });
    console.log("userDoc.id",userDoc.id);
    await EmailVerificationHelper.sendVerificationEmail(data.email,userDoc.id);
    response.status(201);
     res  = {success:true,message:"User created successfully" };
     response.send(res);

    }catch(error){
        console.log('signup error:', error);
        response.status(500);
        res  = {success:false,message:`${error}` };
        response.send(res);  
      }
});

export const confirmation =  functions.https.onRequest (async (request, response)  =>  {
    try{
        const token  = request.query.token as string;
        console.log('token',token);
        const userId = EmailVerificationHelper.verifyToken(token);
        console.log('userId',userId);
       const userData =  await admin.firestore().collection('users').doc(userId);
       console.log('userData',userData);
      await userData.update({
        emailVerified: true,
       });

    }catch(error){
        console.log('signup error:', error);
        response.status(500);
        response.send(error);
    }
});



export const signIn =  functions.https.onRequest (async (request, response)  =>  {
    try{

        const  {email, password} = request.body;

       const usesnap =  await admin.firestore().collection('users').where('email', '==', email ).limit(1).get();
       usesnap.forEach(async doc=>{
           console.log('user',doc);
           const isUser  = await PasswordHelper.isPasswordValid(doc.data().password,doc.data().salt,password);
           console.log('isUser',isUser);
           if(isUser){
               response.status(200);
               const user =  {
                   name: doc.data().name,
                   email: doc.data().email,
                   username: doc.data().username,
                   kycLevel: doc.data().kycLevel,
               }
               response.send(user);
           }else{
            response.status(404);
            response.send({message: "Incorrect credentials"});

           }
       });
         
    }catch(error){
        console.log('signup error:', error);
        response.status(500);
        response.send(error);
    }
});

