import re

def template_to_text(line, perspective, subject="Slave", dominant="Master", direct_conversation=False):
    # Dictionary mappings for different grammatical persons
    subject_switch = {
        "1PS": "I",
        "1PP": "we",
        "2PS": "you",
        "3PS": subject
    }
    subject_objective = {
        "1PS": "me",
        "1PP": "us",
        "2PS": "you",
        "3PS": subject
    }
    subject_possessive = {
        "1PS": "my",
        "1PP": "our",
        "2PS": "your", # the or those for dissociative language perhaps?
        "3PS": subject
    }
    dominant_objective = {
        "1PS": "you" if direct_conversation else "them",
        "1PP": "you" if direct_conversation else "them",
        "2PS": "me" if direct_conversation else "them",
        "3PS": "me" if direct_conversation else "them"
    }
    dominant_possessive = {
        "1PS": "your" if direct_conversation else "their",
        "1PP": "your" if direct_conversation else "their",
        "2PS": "my" if direct_conversation else "their",
        "3PS": "my" if direct_conversation else "their"
    }

    # Replace dominant and check if placeholders exist
    has_subject = "{subject}" in line or "{subject_objective}" in line or "{subject_possessive}" in line
    has_dominant = "{dominant}" in line or "{dominant_objective}" in line or "{dominant_possessive}" in line

    # Replace subjects, objects, and possessives

    replace_subject = subject_switch.get(perspective, "") if perspective is not None else ""
    replace_subject_objective = subject_objective.get(perspective, "") if perspective is not None else ""
    replace_subject_possessive = subject_possessive.get(perspective, "") if perspective is not None else ""
    replace_dominant = dominant if dominant is not None else ""
    replace_dominant_objective = dominant_objective.get(perspective, "") if perspective is not None else ""
    replace_dominant_possessive = dominant_possessive.get(perspective, "") if perspective is not None else ""

    # Regex to find complex conjugation verb forms like [am|are|are|is] and replace based on subject
    verb_pattern = re.compile(r'\[(\w+)\|(\w+)\|(\w+)\|(\w+)\]')
    subject_index = {"1PS": 0, "1PP": 1, "2PS": 2, "3PS": 3}
    verb_index = subject_index.get(perspective, 0)
    
    # Regex to replace simpler verb forms like [go|goes] based on subject
    verb_pattern_simple = re.compile(r'\[(\w+)\|(\w+)\]')
    subject_index_simple = {"1PS": 0, "1PP": 0, "2PS": 0, "3PS": 1}
    verb_index_simple = subject_index_simple.get(perspective, 0)

    def verb_replacer(match,index):
        verbs = match.group(0).strip('[]').split('|')
        return verbs[index]

    line = verb_pattern.sub(verb_replacer(index=verb_index), line)
    line = verb_pattern_simple.sub(verb_replacer(index=verb_index_simple), line)

    # Format the line with replacements
    formatted_line = line.format(subject=replace_subject, 
                                 dominant=replace_dominant,
                                 subject_objective=replace_subject_objective,
                                 subject_possessive=replace_subject_possessive,
                                 dominant_objective=replace_dominant_objective,
                                 dominant_possessive=replace_dominant_possessive)

    
    return formatted_line, has_subject, has_dominant

# Example usage
# line_template = "{dominant}, {subject} [beg|beg|beg|begs] for the pleasure only you can provide."
# formatted_line, has_subject, has_dominant = template_to_text(line_template, "3PS", "Goddess Venus")
# print(formatted_line)
