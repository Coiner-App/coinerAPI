import nodemailer from 'nodemailer';

export default class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'outlook',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        this.transporter.verify();
    }

    /**
     * Sends a verification email containing a registration link to the user
     * @async
     * @param targetEmail - The recipient's email address
     * @param finalurl - The full verification URL including the unique token
     */
    public async sendVerificationMail(targetEmail: string, finalurl: string) {
        try {
            const info = await this.transporter.sendMail({
                from: '"Coiner Auth" <hamthrower7@outlook.com>',
                to: targetEmail,
                subject: "Coiner Email Verify",
                text: "Link for register on coiner:\n" + finalurl + "\nThis code will expire in 30 minutes.\nDO NOT SHARE THIS LINK WITH ANYONE"
            });
            console.log(`Email sent perfectly: ${info.messageId}`);
        } catch (error) {
            console.error('SMTP Error: ', error);
            throw error;
        }
    }

    /**
     * Sends a welcome email to the user after successful registration
     * @async
     * @param targetEmail - The recipient's email address
     * @returns A boolean indicating if the email was sent successfully
     */
    public async sendWelcomeEmail(targetEmail: string): Promise<boolean> {
        try {
            const info = await this.transporter.sendMail({
                from: '"Coiner Auth" <hamthrower7@outlook.com>',
                to: targetEmail,
                subject: 'Welcome to the platform 🚀',
                html: '<b>Your account is live.</b> <br>Time to trade.'
            });

            console.log(`Email sent perfectly: ${info.messageId}`);
            return true;
        } catch (error) {
            console.error('SMTP Error: ', error);
            return false;
        }
    }
}