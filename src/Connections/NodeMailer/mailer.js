import nodemailer from "nodemailer";

class Mailer {
    constructor(){
        this.transporter = nodemailer.createTransport({
            service:"gmail",
            auth:{
                user:process.env.GOOGLE_MAIL_APP_NAME,
                pass:process.env.GOOGLE_MAIL_APP_PASSWORD
            }
        });
    }

    /** Send Mail */
    SendMail = async (payload) => {
        try {
            const {to,subject,body} = payload;
            const mailOptions = {
                from: process.env.GOOGLE_EMAIL,
                to:to,
                subject:subject,
                html:`
                    <div>
                    <h1> Welcome To Adds Platfrom validate </h1>
                    <p> Your Otp is <b>${body?.otp}</b> </p>
                    <hr />
                    Regards
                    WhatsApp Team
                    </div>
                `,
            };
            const sendedMail = await this.transporter.sendMail(mailOptions);
            return sendedMail;
        } catch (error) {
            throw error;
        }
    };
}

export default Mailer;