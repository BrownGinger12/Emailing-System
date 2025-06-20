from pydantic import BaseModel, Field
from Gateway.MySQL_Gateway import query, fetch

class Log(BaseModel):
    application_code: str = Field(..., description="Application code for the letter")
    name: str = Field(..., description="Full name of the recipient (without last name)")
    email: str = Field(..., description="Email of the recipient")
    position: str = Field(..., description="Position applied for")

    def create(self):
        try:
            response = query(
                            """
                            INSERT INTO emails (
                                application_code, name, email, position
                            ) VALUES (%s, %s, %s, %s)
                            """,
                            (
                                self.application_code, self.name, self.email, self.position
                            )
                        )

            if response["statusCode"] != 200:
                return {"statusCode": response["statusCode"], "message": response["message"]}
            
            return {"statusCode": 200, "message": "Email logged successfully"}
        except Exception as e:
            return {"statusCode": 500, "message": str(e)}
    
    @staticmethod
    def delete(application_code: str):
        try:
            checkIfExists = Log.get(application_code)

            if checkIfExists["statusCode"] != 200:
                return {"statusCode": 405, "message": "Logs not found"}
            
            response = query("DELETE FROM emails WHERE application_code = %s", (application_code,))

            if response["statusCode"] != 200:
                return {"statusCode": 500, "message": "Failed to delete student"}
            
            return {"statusCode": 200, "message": "Logs deleted successfully"}
        except Exception as e:
            return {"statusCode": 500, "message": str(e)}
    
    @staticmethod
    def get_all():
        try:
            response = fetch("emails")
            if not response:
                return {"statusCode": 404, "message": "Email not found"}
            return {"statusCode": 200, "data": response}
        except Exception as e:
            return {"statusCode": 500, "message": str(e)}

    @staticmethod
    def get(application_code: str):
        try:
            response = fetch("emails", {"application_code": application_code})
            if not response:
                return {"statusCode": 404, "message": "Email not found"}
            return {"statusCode": 200, "data": response}
        except Exception as e:
            return {"statusCode": 500, "message": str(e)}