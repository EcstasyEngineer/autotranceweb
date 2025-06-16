import os
from theme_pool import ThemePool, load_json_into_pool
from filters import FilterCriteria
from src.config import AUDIO_DIR, THEMES_DIR, OUTPUT_FILE, CHOSEN_THEME, DOMINANT_WHITELIST, NUM_LINES
from cyclers.random import RandomCycler
from src.players.stereo_split import StereoSplitPlayer

if __name__ == "__main__":
    # Create a ThemePool
    pool = ThemePool()

    # Load JSON files from THEMES_DIR
    for filename in os.listdir(THEMES_DIR):
        if filename.endswith(".json"):
            load_json_into_pool(os.path.join(THEMES_DIR, filename), pool)

    # Apply filter criteria
    criteria = FilterCriteria(theme=CHOSEN_THEME, dominant_whitelist=DOMINANT_WHITELIST)
    filtered_pool = pool.subset(criteria)

    if not filtered_pool.items:
        print("No lines found for the given theme and filters.")
        exit(0)

    # Use a RandomCycler
    cycler = RandomCycler(filtered_pool.items, NUM_LINES)
    sequence = cycler.get_sequence()

    # Use a StereoSplitPlayer
    player = StereoSplitPlayer()
    final_audio = player.play_sequence(sequence)

    final_audio.export(OUTPUT_FILE, format="mp3")
    print(f"Session exported to {OUTPUT_FILE}")