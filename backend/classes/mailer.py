import smtplib
import ssl
from email.message import EmailMessage
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '../appdata/secrets.env'))
app_password = os.getenv("GMAIL_APP_PASSWORD")

class Mailer:
    def __init__(self):
        self._smtp_server : str = "smtp.gmail.com"
        self._port : int = 587
        self._sender_email : str = "deepsearchusers@gmail.com"
        self._reciever_email : str = "deepsearch.hq@gmail.com"
    def send_mail(self, content):
        msg = EmailMessage()
        msg['From'] = self._sender_email
        msg['To'] = self._reciever_email
        msg['Subject'] = 'Feedback'
        msg.set_content(content)
        try:
            context = ssl.create_default_context()
            with smtplib.SMTP(self._smtp_server, self._port) as server:
                server.starttls(context=context)
                server.login(self._sender_email, app_password)
                server.send_message(msg)
            print("trah")
        except:
            pass