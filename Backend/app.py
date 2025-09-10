from flask import Flask, request, jsonify
from flask_mail import Mail, Message
from Config.email_config import Config
from Model.Email import Email
from Handler.Attachment_Handler import *
from Handler.Log_Handler import *
import os
from Handler.excel_handler import *
from flask_cors import CORS

mail = Mail()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    mail.init_app(app)
    CORS(app)

    return app

app = create_app()

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

        email = Email(position=position, name=name, sex=sex, qualification=qualification)
        body = email.generate_email()

        subject = f"Initial Evaluation Result: {position} - {application_code}"

        if not recipient:
            return jsonify({'error': 'Recipient is required'}), 400

        msg = Message(subject, recipients=[recipient])
        msg.body = "test"
        msg.html = body

        with open(output_path, "rb") as f:
            msg.attach("Initial_Evaluation_Result.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", f.read())


        mail.send(msg)

        
        if os.path.exists(output_path):
            os.remove(output_path)
            
        return jsonify({'message': 'Plain email sent successfully'})

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
    app.run(debug=True, host='0.0.0.0', port=5000)
