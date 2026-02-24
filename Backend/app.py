from flask import Flask, request, jsonify
from flask_mail import Mail, Message
from Config.email_config import Config
from Model.Email import Email
from Handler.Attachment_Handler import *
from Handler.Log_Handler import *
import os
from Handler.excel_handler import *
from flask_cors import CORS
import imaplib
import email
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from datetime import datetime

mail = Mail()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    mail.init_app(app)
    CORS(app)

    return app

app = create_app()

def save_to_sent_folder(msg, recipient, body, subject, attachment_path=None):
    """
    Save sent email to IMAP Sent folder
    """
    try:
        print("=" * 50)
        print("ATTEMPTING TO SAVE TO SENT FOLDER")
        print("=" * 50)
        
        # Get credentials from Flask-Mail config
        imap_server = app.config['MAIL_SERVER']
        imap_port = 993  # SSL port for IMAP
        email_user = app.config['MAIL_USERNAME']
        email_pass = app.config['MAIL_PASSWORD']
        
        print(f"IMAP Server: {imap_server}")
        print(f"IMAP Port: {imap_port}")
        print(f"Email User: {email_user}")
        
        # Create MIME message for IMAP
        mime_msg = MIMEMultipart('alternative')
        mime_msg['Subject'] = subject
        mime_msg['From'] = email_user
        mime_msg['To'] = recipient
        mime_msg['Date'] = email.utils.formatdate(localtime=True)
        
        # Add HTML body
        html_part = MIMEText(body, 'html')
        mime_msg.attach(html_part)
        
        # Add attachment if exists
        if attachment_path and os.path.exists(attachment_path):
            with open(attachment_path, 'rb') as f:
                part = MIMEBase('application', 'vnd.openxmlformats-officedocument.wordprocessingml.document')
                part.set_payload(f.read())
                encoders.encode_base64(part)
                part.add_header('Content-Disposition', 'attachment', filename="Initial_Evaluation_Result.docx")
                mime_msg.attach(part)
            print("Attachment added to MIME message")
        
        # Connect to IMAP server
        print(f"Connecting to IMAP server...")
        imap = imaplib.IMAP4_SSL(imap_server, imap_port)
        print("Connected! Attempting login...")
        
        imap.login(email_user, email_pass)
        print("Login successful!")
        
        # List all folders to see what's available
        print("\nAvailable folders:")
        status, folders = imap.list()
        if status == 'OK':
            for folder in folders:
                print(f"  - {folder.decode()}")
        
        # Append to Sent folder (common folder names)
        sent_folders = ['Sent', 'INBOX.Sent', '[Gmail]/Sent Mail', 'Sent Items', 'INBOX.Sent Items']
        
        saved = False
        for folder in sent_folders:
            try:
                print(f"\nTrying folder: {folder}")
                result = imap.append(
                    folder,
                    '\\Seen',
                    imaplib.Time2Internaldate(datetime.now()),
                    mime_msg.as_bytes()
                )
                print(f"✓ Email saved to '{folder}' successfully!")
                print(f"Result: {result}")
                saved = True
                break
            except Exception as folder_error:
                print(f"✗ Failed to save to '{folder}': {str(folder_error)}")
                continue
        
        if not saved:
            print("\n⚠ WARNING: Could not save to any Sent folder!")
        
        imap.logout()
        print("=" * 50)
        return saved
        
    except Exception as e:
        print(f"=" * 50)
        print(f"ERROR SAVING TO SENT FOLDER: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        print("=" * 50)
        return False

# === Route: Send Plain Text Email ===
@app.route('/send-email', methods=['POST'])
def send_email():
    try:
        data = request.json
        application_code = data.get('application_code', 'No Subject')
        position = data.get('position')
        name = data.get('name')
        sex = data.get('sex')
        recipient = data.get('recipient')
        qualification = data.get('qualification')

        resp = generate_attachment(request)
        output_path = "Emails/Output/Output.docx"

        if resp['statusCode'] == 500:
            return jsonify({'error': resp['message']}), 500

        email_obj = Email(position=position, name=name, sex=sex, qualification=qualification)
        body = email_obj.generate_email()

        subject = f"Initial Evaluation Result: {position} - {application_code}"

        if not recipient:
            return jsonify({'error': 'Recipient is required'}), 400

        # Send via SMTP (Flask-Mail)
        msg = Message(subject, recipients=[recipient])
        msg.body = "test"
        msg.html = body
        
        # BCC yourself to keep a copy in Inbox (fallback if IMAP fails)
        msg.bcc = [app.config['MAIL_USERNAME']]

        with open(output_path, "rb") as f:
            msg.attach("Initial_Evaluation_Result.docx", 
                      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
                      f.read())

        mail.send(msg)
        
        # Try to save to Sent folder via IMAP
        imap_success = save_to_sent_folder(msg, recipient, body, subject, output_path)
        
        if not imap_success:
            print("⚠ IMAP save failed, but email was sent. BCC copy should be in Inbox.")

        # Clean up attachment
        if os.path.exists(output_path):
            os.remove(output_path)
            
        return jsonify({'message': 'Email sent successfully and saved to Sent folder'})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/upload-excel', methods=['POST'])
def handle_upload_excel():
    return upload_excel()

#Log API
@app.route('/add_to_log', methods=['POST'])
def add_email():
    return add_to_log(request)

@app.route('/emails', methods=['GET'])
def get_emails():
    return get_all_email()

@app.route('/emails/<application_code>', methods=['GET'])
def get_log(application_code):
    return get_email(application_code)

@app.route('/emails/<application_code>', methods=['DELETE'])
def delete_email(application_code):
    return delete_log(application_code)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)