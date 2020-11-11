


//import * as dotenv from 'dotenv';
import * as jwt from 'jsonwebtoken';
import * as nodemailer from 'nodemailer';
import { EmailTokenDto } from '../models/email-token.dto';

//dotenv.config();


export class EmailVerificationHelper{

    
    static  privateScret: string = "EMAIL_SECRET" || '';

    //Returns the user document id
    static verifyToken(token:string):string{
       try{
        const decoded = jwt.verify(token,this.privateScret);
        return (decoded as EmailTokenDto).userId ;
       }catch(error){
           console.log('verifyToken error',error);
           throw error;
       }
    }

     static async sendVerificationEmail(email:string,userId: string){

     try{

        const testAccount = await nodemailer.createTestAccount();

        const transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
              user: testAccount.user, // generated ethereal user
              pass: testAccount.pass, // generated ethereal password
            },
          });
        
       const emailToken =  jwt.sign({userId: userId }, this.privateScret ,{expiresIn: '1d'} );
       console.log('emailToken',emailToken);
        const url = `https://us-central1-kyc-app-cfdec.cloudfunctions.net/confirmation?token=${emailToken}`;
        const info = await transporter.sendMail({
            to: email,
            subject: 'Confirm Email',
            html: `Please click this link to confirm your email address <a href= "${url}">${url}</a>`,
        });
        console.log("Message sent: %s", info.messageId);
    }catch(error){
         console.log('sendVerificationEmail error',error);
     }  

    }
}