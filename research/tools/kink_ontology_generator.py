import argparse
import openai
import json
import os
import sys

client = openai.OpenAI()

# Prompt template identical to the notebook version
prompt = """\
Given a hypnokink headspace, generate a detailed ontology including the headspace description, psychological appeal explanation, a concise set of thematic keywords, and functional metadata.

Input:
- Kink Name: {kink_name}
- Guidance: {guidance}

Output (in JSON format):
{{
    "description": "A vivid and detailed description defining the desired hypnotic headspace. Focus on the subjective experience, emotional tone, and how the subject feels or behaves while immersed in the headspace. Describe how this state unfolds or is induced, and what it might feel like to someone going through it.",
    
    "appeal": "An insightful explanation describing the core psychological or emotional reasons individuals might find this hypnokink fulfilling or appealing. Emphasize what makes the state attractive or desirable, especially how it may serve as an emotional outlet or contrast to day-to-day responsibilities. Avoid assuming specific narratives unless implied by the guidance.",
    
    "keywords": ["A concise, curated list of approximately 10–15 simple, universally understood keywords or short phrases that reflect the emotional tone, behaviors, and symbolic language of the kink. These should be suitable for embedding as hypnotic triggers, mantra repetitions, or thematic reinforcement within scripts. Avoid overly complex or esoteric terms."],
    
    "tags": ["List one or more names from the approved tag list below, based on what categories best apply to this kink."],

    "cnc": false  // Set to true only if the theme includes elements of implied non-consent, overwhelming compulsion, helplessness, or psychological manipulation that may require a consent-education warning. Do not set true for general submission, obedience, or control unless there is a loss of agency or unsafe framing.
}}
"""

def generate_hypnokink_ontology(kink_name, guidance, max_tokens=1000):
    formatted_prompt = prompt.format(kink_name=kink_name, guidance=guidance)
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a helpful assistant skilled in creating hypnokink ontologies."},
                {"role": "user", "content": formatted_prompt}
            ],
            response_format={"type": "json_object"},
            max_tokens=max_tokens,
            temperature=0
        )
        return response.choices[0].message.content
    except Exception as e:
        sys.exit(f"Error generating ontology: {e}")

def main():
    parser = argparse.ArgumentParser(description="Generate a hypnokink ontology from CLI parameters.")
    parser.add_argument("kink_name", help="Name of the kink.")
    parser.add_argument("--guidance", "-g", help="Initial description/guidance for the kink.", default="No description provided.")
    parser.add_argument("--output", "-o", help="Output JSON file path. If not provided, prints the output.", default=None)
    args = parser.parse_args()

    ontology_str = generate_hypnokink_ontology(args.kink_name, args.guidance)
    
    try:
        ontology_json = json.loads(ontology_str)
    except json.JSONDecodeError:
        sys.exit("Failed to parse ontology as JSON.")

    if args.output:
        output_folder = os.path.dirname(args.output)
        if output_folder and not os.path.exists(output_folder):
            os.makedirs(output_folder)
        with open(args.output, "w", encoding="utf-8") as f:
            json.dump(ontology_json, f, indent=4, ensure_ascii=False)
        print(f"Ontology saved to {args.output}")
    else:
        print(json.dumps(ontology_json, indent=4, ensure_ascii=False))

if __name__ == "__main__":
    main()
