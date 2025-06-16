import os
import re
import sys
import argparse

def load_verb_conjugations(filepath):
    verb_templates_1ps = {}
    verb_templates_1pp = {}
    verb_templates_2ps = {}
    verb_templates_3ps = {}
    with open(filepath, 'r', encoding='utf-8') as file:
        for line in file:
            conjugations = line.strip().split('|')
            if len(conjugations) == 2: # format is "go|goes"
                verb_templates_1ps[conjugations[0]] = line.strip() # I go
                verb_templates_1pp[conjugations[1]] = line.strip() # we go
                verb_templates_2ps[conjugations[0]] = line.strip() # you go
                verb_templates_3ps[conjugations[1]] = line.strip() # she goes
            elif len(conjugations) == 4:  #format is "am|are|is|is"
                verb_templates_1ps[conjugations[0]] = line.strip() # I am
                verb_templates_1pp[conjugations[1]] = line.strip() # we are
                verb_templates_2ps[conjugations[2]] = line.strip() # you are
                verb_templates_3ps[conjugations[3]] = line.strip() # she is
    return verb_templates_1ps, verb_templates_1pp, verb_templates_2ps, verb_templates_3ps

def process_file_to_template(input_file_path, output_file_path, subject_name, dominant_name):
    # mapping rules:
    # named subject  - 3ps -> 3ps (subject)
    # named dominant - 3ps -> 3ps (dominant)
    # 1ps -> 1ps (subject)
    # 1pp -> 1ps (subject)
    # 2ps -> 2ps (dominant)
    # 3ps -> 2ps (dominant)
    patterns = {
        re.compile(rf'\b{subject_name}\b', re.IGNORECASE): '{subject_name}',  # subject name (3rd person)
        re.compile(rf'\b{dominant_name}\b', re.IGNORECASE): '{dominant_name}', # dominant name (3nd person)
        re.compile(r'\bi(\'|\’)m\b', re.IGNORECASE): '{subject_subjective} am', # no conjunctions
        re.compile(r'\bwe(\'|\’)re\b', re.IGNORECASE): '{subject_subjective} am', # no conjunctions (also convert to 1ps)
        re.compile(r'\bi\b', re.IGNORECASE): '{subject_subjective}',  # "I" as subjective
        re.compile(r'\bwe\b', re.IGNORECASE): '{subject_subjective}',  # "we" as subject
        re.compile(r'\bmy|mine\b', re.IGNORECASE): '{subject_possessive}',
        re.compile(r'\bme\b', re.IGNORECASE): '{subject_objective}',
        re.compile(r'\bus\b', re.IGNORECASE): '{subject_objective}',  # "us" as objective
        re.compile(r'\byou\'re\b', re.IGNORECASE): '{dominant_subjective} are',  # no conjunctions
        re.compile(r'\bthey\'re\b', re.IGNORECASE): '{dominant_subjective} are',  # no conjunctions
        re.compile(r'\byou\b', re.IGNORECASE): '{dominant_subjective}',  # warning, "you" can be subjective as well
        re.compile(r'\bshe\b', re.IGNORECASE): '{dominant_subjective}',  # "she" as subjective
        re.compile(r'\bhe\b', re.IGNORECASE): '{dominant_subjective}',  # "he" as subjective
        re.compile(r'\bhim\b', re.IGNORECASE): '{dominant_objective}',
        re.compile(r'\bthem\b', re.IGNORECASE): '{dominant_objective}',  # "them" as objective
        re.compile(r'\byour|yours\b', re.IGNORECASE): '{dominant_possessive}',
        re.compile(r'\bhis\b', re.IGNORECASE): '{dominant_possessive}',
        re.compile(r'\bher|hers\b', re.IGNORECASE): '{dominant_possessive}', # warning, "her" can be objective as well
        re.compile(r'\btheir|theirs\b', re.IGNORECASE): '{dominant_possessive}',
        re.compile(r'\b(girl|boy)\b', re.IGNORECASE): '{subject_gender_noun}', 
    }

    try:
        
        verbs_1ps,verbs_1pp,verbs_2ps,verbs_3ps = load_verb_conjugations('verb_conjugations.txt')

        with open(input_file_path, 'r', encoding='utf-8') as file:
            lines = file.readlines()
        
        with open(output_file_path, 'w', encoding='utf-8') as file:
            for line in lines:
                # search line for \byou\b or \bher\b
                has_ambiguous = False
                matches = re.findall(r'\b(you|her)\b', line, re.IGNORECASE)
                for match in matches:
                    if match[0].lower() == 'you':
                        print("Warning: 'you' is ambiguous. Please verify {dominant_subjective}")
                        print("original: ", line)
                        has_ambiguous = True
                    if match[0].lower() == 'her':
                        print("Warning: 'her' is ambiguous. Please verify {dominant_possessive}")
                        print("original: ", line)
                        has_ambiguous = True
                
                # Replace all patterns in the line {dominant}, {subject}, {subject_possessive}, etc.
                for pattern, replacement in patterns.items():
                    line = pattern.sub(replacement, line)

                matches = re.findall(r'\{subject_name\}\s+(\w+\b(?:\'\w+)?)', line, re.IGNORECASE)
                for match in matches:
                    verb_original = match
                    verb = verb_original.lower()
                    if verb in verbs_3ps:
                        pattern = r'(?<!\[)\b' + re.escape(verb_original) + r'\b(?!\])'
                        replacement = "[" + verbs_3ps[verb] + "]"
                        line = re.sub(pattern, replacement, line, flags=re.IGNORECASE)
                    else:
                        print("Warning: verb not found in 3ps: ", verb)
                        
                matches = re.findall(r'\{dominant_name\}\s+(\w+\b(?:\'\w+)?)', line, re.IGNORECASE)
                for match in matches:
                    verb_original = match
                    verb = verb_original.lower()
                    if verb in verbs_3ps:
                        pattern = r'(?<!\[)\b' + re.escape(verb_original) + r'\b(?!\])'
                        replacement = "[" + verbs_3ps[verb] + "]"
                        line = re.sub(pattern, replacement, line, flags=re.IGNORECASE)
                    else:
                        print("Warning: verb not found in 3ps: ", verb)
                        
                matches = re.findall(r'\{subject(_subjective)?\}\s+(\w+\b(?:\'\w+)?)', line, re.IGNORECASE)
                for match in matches:
                    verb_original = match[1]
                    verb = verb_original.lower()
                    if verb in verbs_1ps:
                        pattern = r'(?<!\[)\b' + re.escape(verb_original) + r'\b(?!\])'
                        replacement = "[" + verbs_1ps[verb] + "]"
                        line = re.sub(pattern, replacement, line, flags=re.IGNORECASE)
                    if verb in verbs_1pp:
                        pattern = r'(?<!\[)\b' + re.escape(verb_original) + r'\b(?!\])'
                        replacement = "[" + verbs_1pp[verb] + "]"
                        line = re.sub(pattern, replacement, line, flags=re.IGNORECASE)
                    if verb not in verbs_1ps and verb not in verbs_1pp:
                        print("Warning: verb not found in 1ps or 1pp: ", verb)
                        
                matches = re.findall(r'\{dominant(_subjective)?\}\s+(\w+)\b', line, re.IGNORECASE)
                for match in matches:
                    verb_original = match[1]
                    verb = verb_original.lower()
                    if verb in verbs_2ps:
                        pattern = r'(?<!\[)\b' + re.escape(verb_original) + r'\b(?!\])'
                        replacement = "[" + verbs_2ps[verb] + "]"
                        line = re.sub(pattern, replacement, line, flags=re.IGNORECASE)
                    if verb in verbs_3ps:
                        pattern = r'(?<!\[)\b' + re.escape(verb_original) + r'\b(?!\])'
                        replacement = "[" + verbs_3ps[verb] + "]"
                        line = re.sub(pattern, replacement, line, flags=re.IGNORECASE)

                matches = re.findall(r'\b(boy|girl)\b', line, re.IGNORECASE)
                for match in matches:
                    print(f"Warning: '{match}' found. This may need {{subject_gender_noun}} for generalization.")
                        
                if has_ambiguous:
                    print("converted: ", line)
                        
                file.write(line)
        
        print(f"File processed successfully. Output saved to {output_file_path}")
    
    except FileNotFoundError as e:
        print(f"Error: The file specified does not exist: {e}")
    except KeyError as e:
        print(f"Error: {e} not found in the verb conjugations for line: {line}")
    except Exception as e:
        print(f"An error occurred: {e} for line: {line}")

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python convert_lines.py <input_file> <output_file> <dominant_name> <subject_name>")
        input_files = os.listdir("preconverted")
        output_directory = "converted"
        for file in input_files:
            input_file_path = os.path.join("preconverted", file)
            output_file_path = os.path.join(output_directory, file)
            dominant_name = "Master"
            subject_name = "Slave"
            process_file_to_template(input_file_path, output_file_path, dominant_name, subject_name)
    else:
        input_file_path = sys.argv[1]
        output_file_path = sys.argv[2]
        dominant_name = sys.argv[3]
        subject_name = sys.argv[4]
        process_file_to_template(input_file_path, output_file_path, dominant_name, subject_name)


# Example usage
# python convert_lines.py input.txt output.txt "Master" "Slave"