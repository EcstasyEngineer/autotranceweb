import argparse
import openai
import json
import os
import sys

client = openai.OpenAI()

def load_prompt_template():
    """Load the prompt template from the docs/prompts directory."""
    # Get the directory where this script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    # Navigate to the prompt file relative to the script location
    prompt_file = os.path.join(script_dir, "..", "..", "docs", "prompts", "Generate_Ontology_Theme.txt")
    
    try:
        with open(prompt_file, "r", encoding="utf-8") as f:
            prompt_content = f.read()
        
        # Add the input parameters instruction
        formatted_prompt = prompt_content + f"""

## INPUT PARAMETERS
Theme Name: {{theme_name}}

Generate the complete JSON file for the given theme name, following these specifications exactly.
"""
        return formatted_prompt
    except FileNotFoundError:
        sys.exit(f"Error: Could not find prompt file at {prompt_file}")
    except Exception as e:
        sys.exit(f"Error loading prompt file: {e}")

def generate_hypnokink_ontology(theme_name, max_tokens=2000):
    """Generate ontology using the loaded prompt template."""
    prompt_template = load_prompt_template()
    formatted_prompt = prompt_template.format(theme_name=theme_name)
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a skilled assistant specialized in creating detailed hypnokink ontologies. Follow the provided specifications exactly."},
                {"role": "user", "content": formatted_prompt}
            ],
            response_format={"type": "json_object"},
            max_tokens=max_tokens,
            temperature=0.1
        )
        return response.choices[0].message.content
    except Exception as e:
        sys.exit(f"Error generating ontology: {e}")

def main():
    parser = argparse.ArgumentParser(description="Generate a hypnokink ontology using the detailed prompt template.")
    parser.add_argument("theme_name", help="Name of the theme/kink to generate ontology for.")
    parser.add_argument("--output", "-o", help="Output JSON file path. If not provided, prints to stdout.", default=None)
    parser.add_argument("--max-tokens", "-t", type=int, help="Maximum tokens for API response.", default=2000)
    args = parser.parse_args()

    print(f"Generating ontology for theme: {args.theme_name}")
    print("Using prompt template from docs/prompts/Generate_Ontology_Theme.txt")
    
    ontology_str = generate_hypnokink_ontology(args.theme_name, args.max_tokens)
    
    try:
        ontology_json = json.loads(ontology_str)
    except json.JSONDecodeError as e:
        sys.exit(f"Failed to parse ontology as JSON: {e}")

    if args.output:
        output_folder = os.path.dirname(args.output)
        if output_folder and not os.path.exists(output_folder):
            os.makedirs(output_folder)
        with open(args.output, "w", encoding="utf-8") as f:
            json.dump(ontology_json, f, indent=4, ensure_ascii=False)
        print(f"✅ Ontology saved to {args.output}")
    else:
        print("\n" + "="*50)
        print("GENERATED ONTOLOGY:")
        print("="*50)
        print(json.dumps(ontology_json, indent=4, ensure_ascii=False))

if __name__ == "__main__":
    main()
