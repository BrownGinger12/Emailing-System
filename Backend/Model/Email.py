from pydantic import BaseModel, Field

class Email(BaseModel):
    name: str = Field(..., description="Name cannot be empty")
    position: str = Field(..., description="Position cannot be empty")
    sex: str = Field(..., description="Sex cannot be empty")


    def generate_email(self):

        prefix = "Ms." if self.sex == "Female" else "Mr."

        email_body = f"""
                        <p>Dear <strong>{prefix} {self.name}</strong>,</p>
                        <p>Good Day and <strong>Congratulations!</strong></p>
                        <p>
                            Attached is the Initial Evaluation Result of your Application for 
                            <strong>{self.position}</strong>.
                        </p>
                        <p>
                            For posting of the <strong>Teacher’s Reflection</strong> and 
                            <strong>Demonstration Teaching Schedules</strong>, and for more updates, 
                            please follow us on our Facebook Page, 
                            <strong>DepEd Cadiz City SDO Personnel</strong>.
                        </p>
                        <p>Thank you and God Bless.</p>
                        <br>
                        <p>Signed:</p>
                        <p><strong>JOVITT M. MANANGAN</strong><br>
                        Administrative Officer IV<br>
                        Personnel Unit</p>
                    """
        
        return email_body