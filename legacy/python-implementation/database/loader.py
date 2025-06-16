# loader.py
import os
from .database import get_session
from .models import Line

def insert_into_db(template_text, real_text, 
                   subject, sub_gender, sub_pov, 
                   dominant, dom_gender, dom_pov,
                   theme, difficulty, line_type, trigger, 
                   service, voice, 
                   audio_path, audio_length):
    session = get_session()

    # validate input
    # subject should be the name of the subject (eg Bambi, Slave, Pet etc)
    # sub_pov should be of the form '1PS', '1PP', '2PS', '3ps' or None
    # sub_gender should be "M", "F", None
    # dominant should be the name of the dominant (eg Master, Mistress)
    # dom_pov should be of the form '1PS', '1PP', '2PS', '3ps' or None
    # dom_gender should be "M", "F", None
    # difficulty should be one of 'BASIC', 'LIGHT', 'MODERATE', 'DEEP', 'EXTREME'
    # if audio file path is not none, it should be a valid path
    # line_type should be "DIRECT", "INDIRECT", "COMMAND", "ANCHOR", "TRIGGER", "DEEPENER", "EMERGENCE", "INDUCTION", "EVENT"

    if not sub_pov in ['1PS', '1PP', '2PS', '3PS', None]:
        raise ValueError(f"Invalid subject: {subject}")
    if not dom_pov in ['1PS', '1PP', '2PS', '3PS', None]:
        raise ValueError(f"Invalid subject: {subject}")
    if not (sub_gender in ['M', 'F', None]):
        raise ValueError(f"Invalid gender: {sub_gender}")
    if not (sub_gender in ['M', 'F', None]):
        raise ValueError(f"Invalid gender: {dom_gender}")
    
    if not difficulty in ['BASIC', 'LIGHT', 'MODERATE', 'DEEP', 'EXTREME']:
        raise ValueError(f"Invalid difficulty level: {difficulty}")
    if audio_path is not None and not os.path.exists(audio_path):
        raise ValueError(f"Invalid audio file path: {audio_path}")

    new_line = Line(
        template_text=template_text,
        real_text=real_text,
        subject=subject,
        sub_gender=sub_gender,
        sub_pov=sub_pov,
        dom=dominant,
        dom_gender=dom_gender,
        dom_pov=dom_pov,
        theme=theme,
        difficulty=difficulty,
        line_type=line_type,
        trigger=trigger,
        service=service,
        voice=voice,
        audio_file_path=audio_path,
        audio_length=audio_length
    )
    session.add(new_line)
    session.commit()
    session.close()