import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import json

transcript_path = 'C:/Users/96656/.gemini/antigravity/brain/0de95090-23a6-4a7f-a9b2-09153ee49670/.system_generated/logs/transcript.jsonl'
with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        data = json.loads(line)
        if data.get('type') == 'USER_INPUT':
            media = data.get('media', [])
            content = data.get('content', '')
            if media or 'صورة' in content or 'تطبيقات' in content:
                print(f"Step {data.get('step_index')}: media={media}, content={content[:100]}")
