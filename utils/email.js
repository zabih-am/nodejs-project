const nodemailer = require('nodemailer')
//nodemailer is a package for sending email using nodejs
const sendEmail =async options => {
    // 1) create a transporter => a service that is send the email something like gmail, yahoo and for production we don't use this services because this services mark as spamer . and it's better to use services like mailgun
    //we use mailtrap service because it's good for development
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    })
    // 2) Defind the email options
    const mailOptions = {
        from: 'zabih arab <zabih-user@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message
        //html:
    }
    //3)Actually send the email
    await transporter.sendMail(mailOptions)
}

module.exports = sendEmail