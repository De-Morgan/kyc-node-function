
import * as bcrypt from 'bcrypt';

export class PasswordHelper{

   static async  hashPassword(password:string,salt: string): Promise<string>{
       return bcrypt.hash(password,salt);
    }

    static async isPasswordValid(hashPassword:string,salt:string,password:string):Promise<boolean>{
        const hash = await bcrypt.hash(password,salt);
        return hash===hashPassword;
    }
}