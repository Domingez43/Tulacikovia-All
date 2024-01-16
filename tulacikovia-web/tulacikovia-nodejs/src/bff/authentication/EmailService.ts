import nodemailer from 'nodemailer';
 
export class EmailService {
    async sendMail(email: string, resetToken: string){
        const emailText = `Click the following link to reset your password:  http://88.212.54.66/passwordReset/${resetToken}`;
        
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
              user: 'tulacikoviahelp@gmail.com',
              pass: 'smpf ltfk jpjr pgzl'
            }
          });

          // Define the email content
        const mailOptions = {
            from: 'tulacikoviahelp@gmail.com',
            to: email,
            subject: 'Tulacikovia password Reset',
            text: emailText,
        };

        try {
            // Send the email
            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent:', info.response);
        } catch (error) {
            console.error('Error sending email:', error);
        }
    }
}

