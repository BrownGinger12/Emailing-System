from flask import jsonify
from Model.Logs import Log

from pydantic import ValidationError

def add_to_log(request):
    try:
        log = Log(**request.json)

        response = log.create()

        if not request:
            return jsonify({"message": "No data provided"}), 400
        
        return jsonify({"message": response["message"]}), response["statusCode"]

    except ValidationError as e:
        return jsonify({"message": str(e)}), 400
    except Exception as e:
        return jsonify({"message": "test"}), 500

def delete_log(application_code):
    try:
        log = Log.delete(application_code)

        if not log:
            return jsonify({"message": "Email not found"}), 404

        return jsonify({"message": log["message"]}), log["statusCode"]

    except ValidationError as e:
        return jsonify({"message": str(e)}), 400
    except Exception as e:
        return jsonify({"message": str(e)}), 500


def get_email(application_code):
    try:
        log = Log.get(application_code)

        if not log:
            return jsonify({"message": "Email not found"}), 404

        return jsonify({"email": log}), 200

    except ValidationError as e:
        return jsonify({"message": str(e)}), 400
    except Exception as e:
        return jsonify({"message": str(e)}), 500

def get_all_email():
    try:
        log = Log.get_all()

        if not log:
            return jsonify({"message": "No emails found"}), 404

        return jsonify({"emails": log}), 200

    except ValidationError as e:
        return jsonify({"message": str(e)}), 400
    except Exception as e:
        return jsonify({"message": str(e)}), 500
    
    