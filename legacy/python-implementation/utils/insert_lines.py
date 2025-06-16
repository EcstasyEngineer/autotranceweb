# Assuming the structure of your project and the presence of these modules
from old.database.loader import insert_into_db
from old.database.models import Line, Base  # Assuming your model definitions are here
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import boto3
import os

from tts.tts_engine import text_to_file
from utils.tools import template_to_text

# Setup database connection
engine = create_engine(os.getenv('DATABASE_URL'))
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)
session = Session()

# AWS Polly client setup
polly_client = boto3.client(
    'polly',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_REGION_NAME')
)

# Example usage
themes=["worship", "discipline", "broken", "bimbo", "empty"] #1644 lines in total
dominants=["Master", "Mistress", "Goddess", "Daddy", "Bambi"]
perspectives = ["1PS", "1PP", "2PS", "3PS"]
for theme in themes:
    with open(os.path.join("utils/preconverted",f'{theme}.txt'), 'r') as file:
        for line in file:
            for dominant in dominants:
                for perspective in perspectives:
                    real_text, contains_subject, contains_dominant= template_to_text(line, perspective, subject="Slave", dominant=dominant, direct_conversation=False)
                    audio_path = text_to_file(real_text)
                    insert_into_db(session, 
                                    line, 
                                    real_text, 
                                    perspective if contains_subject else None, 
                                    dominant if contains_dominant else None, 
                                    theme, 
                                    'MODERATE', # todo, would probably need to be part of the template
                                    "Polly",    # todo, enable 11labs support
                                    "Salli", 
                                    audio_path
                                    )

session.close()
