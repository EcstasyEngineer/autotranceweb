import boto3
import os
from ..database.database import get_session
from ..database.models import Line

def generate_audio_for_lines():
    session = get_session()
    polly_client = boto3.client('polly', region_name='us-east-1')

    lines_without_audio = session.query(Line).filter(Line.audio_file_path == None).all()

    for line in lines_without_audio:
        response = polly_client.synthesize_speech(
            Text=line.real_text,
            OutputFormat='mp3',
            VoiceId='Joanna'
        )

        audio_file_path = f'/static/audio/line_{line.id}.mp3'
        with open(f'app{audio_file_path}', 'wb') as file:
            file.write(response['AudioStream'].read())

        line.audio_file_path = audio_file_path
        session.add(line)

    session.commit()
    session.close()
