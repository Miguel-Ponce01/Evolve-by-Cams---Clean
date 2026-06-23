import asyncio
import os
import json
import urllib.request
import urllib.error
from pathlib import Path
from dotenv import load_dotenv

# Load env variables from .env.local
env_path = Path(__file__).parent.parent / '.env.local'
load_dotenv(dotenv_path=env_path)

# Toggle to True to bypass the google-antigravity SDK and use direct HTTP requests
FORCE_HTTP_FALLBACK = True

try:
    if FORCE_HTTP_FALLBACK:
        raise ImportError()
    from google.antigravity import Agent, LocalAgentConfig
    SDK_AVAILABLE = True
except ImportError:
    SDK_AVAILABLE = False
    if FORCE_HTTP_FALLBACK:
        print("Using direct HTTP integration (google-antigravity SDK bypassed).")
    else:
        print("Warning: google-antigravity package is not installed. Using urllib standard fallback.")

# Paths to personas
PERSONA_DIR = Path(__file__).parent / 'personas'

def load_persona(name: str) -> str:
    path = PERSONA_DIR / f"{name}.txt"
    if path.exists():
        return path.read_text(encoding='utf-8')
    return f"You are the {name.capitalize()} Agent."

async def call_gemini_api_fallback(api_key: str, system_instruction: str, prompt: str) -> str:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "systemInstruction": {
            "parts": [
                {"text": system_instruction}
            ]
        }
    }
    
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        url,
        data=data,
        headers={'Content-Type': 'application/json'}
    )
    
    loop = asyncio.get_event_loop()
    max_retries = 3
    delay = 2.0
    
    for attempt in range(max_retries):
        try:
            def do_request():
                with urllib.request.urlopen(req) as response:
                    return response.read().decode('utf-8')
            
            response_body = await loop.run_in_executor(None, do_request)
            res_data = json.loads(response_body)
            
            candidates = res_data.get('candidates', [])
            if candidates:
                parts = candidates[0].get('content', {}).get('parts', [])
                if parts:
                    return parts[0].get('text', 'No response text found.')
            return "Empty response from Gemini API."
        except urllib.error.HTTPError as e:
            error_body = e.read().decode('utf-8') if e.fp else str(e)
            if e.code in (429, 503) and attempt < max_retries - 1:
                print(f"Transient HTTP Error {e.code} encountered. Retrying in {delay}s...")
                await asyncio.sleep(delay)
                delay *= 2
                continue
            return f"HTTP Error {e.code}: {error_body}"
        except Exception as e:
            if attempt < max_retries - 1:
                print(f"Request Error {e} encountered. Retrying in {delay}s...")
                await asyncio.sleep(delay)
                delay *= 2
                continue
            return f"Request Error: {e}"

async def run_agent_workflow(agent_name: str, prompt: str):
    persona = load_persona(agent_name)
    
    if SDK_AVAILABLE:
        config = LocalAgentConfig(
            system_instructions=persona
        )
        
        print(f"Initializing {agent_name.capitalize()} Agent context...")
        try:
            async with Agent(config) as agent:
                print(f"Agent context active. Sending prompt to Gemini API...")
                response = await agent.chat(prompt)
                print(f"Prompt sent. Awaiting response text...")
                text_output = await response.text()
                print(f"\n[{agent_name.upper()} RESPONSE]:")
                print(text_output)
                return
        except Exception as e:
            print(f"Error using google-antigravity SDK: {e}. Falling back to urllib...")
            
    # Fallback to direct HTTP request
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("[Error]: GEMINI_API_KEY is not defined in the environment or .env.local file.")
        return
        
    print(f"Sending prompt to Gemini API (live HTTP fallback)...")
    text_output = await call_gemini_api_fallback(api_key, persona, prompt)
    print(f"\n[{agent_name.upper()} RESPONSE]:")
    print(text_output)

async def main():
    print("Evolve by Cams POS - Multi-Agent Orchestrator")
    print("---------------------------------------------")
    
    # Test initialization
    prompt = "Hello! Verify you are ready to assist with the Evolve by Cams POS mobile conversion."
    
    print("Testing Coding Agent:")
    await run_agent_workflow('coding', prompt)
    
    print("\nTesting Debugging Agent:")
    await run_agent_workflow('debugging', prompt)
    
    print("\nTesting Deployment Agent:")
    await run_agent_workflow('deployment', prompt)

if __name__ == "__main__":
    asyncio.run(main())
