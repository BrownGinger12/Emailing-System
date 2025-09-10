from typing import Tuple
from Model.Attachment import Attachment  # Assuming Attachment is your Pydantic model


def parse_name(full_name: str) -> Tuple[str, str]:
    try:
        last_name, rest = full_name.split(",", 1)
        last_name = last_name.strip().title()
        name = rest.strip().title()
        return name, last_name
    except ValueError:
        return full_name.title(), ""


def generate_attachment(request):
    try:
        prefix_val = "Ms." if request.json.get('sex') == "F" else "Mr."
        name, last_name = parse_name(request.json.get('name'))

        qualification = request.json.get('qualification', '')

        performance = request.json.get('performance', '')

        remarks = "Not met"
        letter_path = "Emails/Template/"


        if performance:
            letter_path += "DO-20/"
        else:
           letter_path += "DO-007/"

        if qualification.lower() == "qualified":
            letter_path += "Qualified.docx"
            remarks = "Met"
        else:
            letter_path += "Disqualified.docx"



        letter_data = Attachment(
            application_code=request.json.get('application_code'),
            date=request.json.get('date'),
            prefix=prefix_val,
            last_name=last_name,
            street=request.json.get('street'),
            city=request.json.get('city'),
            name=name,
            position=request.json.get('position'),
            education_required=request.json.get('education_required'),
            education=request.json.get('education'),
            experience_required=request.json.get('experience_required'),
            experience=request.json.get('experience'),
            training_required=request.json.get('training_required'),
            training=request.json.get('training'),
            eligibility_required=request.json.get('eligibility_required'),
            eligibility=request.json.get('eligibility'),
            education_remarks=request.json.get('education_remarks'),
            experience_remarks=request.json.get('experience_remarks'),
            training_remarks=request.json.get('training_remarks'),
            eligibility_remarks=request.json.get('eligibility_remarks'),
            performance_required=request.json.get('performance_required'),
            performance=request.json.get('performance'),
            remarks=remarks
        )
        

        # Generate and save the DOCX file
        result = letter_data.generate_docx(letter_path, "Emails/Output/Output.docx")
        print(result)

        if result["statusCode"] != 200:
            return {
                "message": result["message"],
                "statusCode": 200
            }
        
        return {
                "message": "File generated successfully",
                "statusCode": 200
            }

    except Exception as e:
        return {
            "message": str(e),
            "error": str(e),
            "statusCode": 500
        }
