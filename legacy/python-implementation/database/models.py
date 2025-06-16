from sqlalchemy import (
    Column, Integer, String, Text, Float, DateTime, ForeignKey, Enum, Table, create_engine
)
from sqlalchemy.orm import relationship, backref
from sqlalchemy.ext.declarative import declarative_base
import enum
from datetime import datetime

Base = declarative_base()

# Enums for Gender, POV, Difficulty, and LineType

class GenderEnum(enum.Enum):
    M = 'M'
    F = 'F'
    NONE = None

class POVEnum(enum.Enum):
    FIRST_PERSON_SINGULAR = '1PS'
    SECOND_PERSON_SINGULAR = '2PS'
    THIRD_PERSON_SINGULAR = '3PS'
    FIRST_PERSON_PLURAL = '1PP'
    NONE = None

class DifficultyEnum(enum.Enum):
    BASIC = 'BASIC'
    LIGHT = 'LIGHT'
    MODERATE = 'MODERATE'
    DEEP = 'DEEP'
    EXTREME = 'EXTREME'
    NONE = None

class LineTypeEnum(enum.Enum):
    INDUCTION = 'INDUCTION'
    DEEPENER = 'DEEPENER'
    FOCUSING = 'FOCUSING'
    DISSOCIATION = 'DISSOCIATION'
    EMERGENCE = 'EMERGENCE'
    SUGGESTION_IDENTITY = 'SUGGESTION_IDENTITY'
    SUGGESTION_FEELING = 'SUGGESTION_FEELING'
    SUGGESTION_POSTHYPNOTIC = 'SUGGESTION_POSTHYPNOTIC'
    SUGGESTION_COMMAND = 'SUGGESTION_COMMAND'
    SUGGESTION_MANTRA = 'SUGGESTION_MANTRA'
    SUGGESTION_AROUSAL = 'SUGGESTION_AROUSAL'
    SUGGESTION_BEHAVIORAL = 'SUGGESTION_BEHAVIORAL'

# Association table for User's favorite themes

user_favorite_themes = Table(
    'user_favorite_themes',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('theme_id', Integer, ForeignKey('themes.id'))
)

# Themes Table

class Theme(Base):
    __tablename__ = 'themes'

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    date_created = Column(DateTime, default=datetime.utcnow)
    date_modified = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    templates = relationship('Template', backref='theme', lazy=True)
    users = relationship('User', secondary=user_favorite_themes, back_populates='favorite_themes')

# Templates Table

class Template(Base):
    __tablename__ = 'templates'

    id = Column(Integer, primary_key=True)
    template_text = Column(Text, nullable=False, unique=True)
    line_type = Column(Enum(LineTypeEnum), nullable=True)
    difficulty = Column(Enum(DifficultyEnum), nullable=True)
    theme_id = Column(Integer, ForeignKey('themes.id'))
    #has_subject = Column(bool)
    #has_dominant = Column(bool)
    date_created = Column(DateTime, default=datetime.utcnow)
    date_modified = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    lines = relationship('Line', backref='template', lazy=True)

# Lines Table

class Line(Base):
    __tablename__ = 'lines'

    id = Column(Integer, primary_key=True)
    template_id = Column(Integer, ForeignKey('templates.id'))
    real_text = Column(Text, nullable=False, unique=True)
    subject = Column(String, nullable=True)
    sub_gender = Column(Enum(GenderEnum), nullable=True)
    sub_pov = Column(Enum(POVEnum), nullable=True)
    dominant = Column(String, nullable=True)
    dom_gender = Column(Enum(GenderEnum), nullable=True)
    dom_pov = Column(Enum(POVEnum), nullable=True)
    service = Column(String)
    voice = Column(String)
    audio_file_path = Column(Text)
    audio_length = Column(Float)
    date_created = Column(DateTime, default=datetime.utcnow)
    date_modified = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Users Table

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    total_score = Column(Float, default=0.0)
    preferred_dominant = Column(String)
    subject_name = Column(String)
    subject_gender = Column(Enum(GenderEnum), nullable=True)
    dominant_name = Column(String)
    dominant_gender = Column(Enum(GenderEnum), nullable=True)

    # Relationships
    favorite_themes = relationship('Theme', secondary=user_favorite_themes, back_populates='users')
    telemetry_logs = relationship('Telemetry', backref='user', lazy=True)

# Telemetry Table

class Telemetry(Base):
    __tablename__ = 'telemetry'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    timestamp = Column(DateTime, default=datetime.utcnow)
    endpoint = Column(String)
    request_method = Column(String)
    status_code = Column(Integer)
    response_time = Column(Float)
    request_data = Column(Text)
    response_data = Column(Text)

def create_tables(engine_url):
    engine = create_engine(engine_url)
    Base.metadata.create_all(engine)