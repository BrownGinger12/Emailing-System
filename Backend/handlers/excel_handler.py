from flask import request, jsonify
import os
from werkzeug.utils import secure_filename
from excel_parser import parse_excel_to_json
import json

ALLOWED_EXTENSIONS = {'xlsx', 'xls'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def upload_excel():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(os.getcwd(), filename)
        file.save(file_path)
        try:
            json_output = parse_excel_to_json(file_path)
            os.remove(file_path)  # Clean up the file after processing
            return jsonify(json.loads(json_output)), 200
        except Exception as e:
            os.remove(file_path)  # Clean up on error
            return jsonify({'error': str(e)}), 500
        
    return jsonify({'error': 'File type not allowed'}), 400 