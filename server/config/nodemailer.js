import nodemailer from 'nodemailer';

//this is the transporter that will be used to send the email
const transporter = nodemailer.createTransport({
    //we are using the smtp transport service to send the email using gmail.
    //the port 587 uses TLS encryption to send the email. This is used to send the email using the gmail smtp server.
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});
export default transporter;