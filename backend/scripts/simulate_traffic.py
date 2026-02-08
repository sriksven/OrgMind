import asyncio
import json
import os
import sys
import httpx
from datetime import datetime

# Configuration
DATA_FILE = "data/simulation_emails.json"
API_URL = os.getenv("API_URL", "https://orgmind.onrender.com/process")

async def send_email(client, email):
    """Send a single email to the backend."""
    payload = {
        "type": "email",
        "content": email["content"],
        "date": email["date"],
        "metadata": {
            "sender": email["sender"],
            "subject": email["subject"]
        }
    }
    
    print(f"Sending: {email['subject']}")
    try:
        resp = await client.post(API_URL, json=payload, timeout=30.0)
        resp.raise_for_status()
        print(f"✅ Sent: {email['subject']} - Status: {resp.status_code}")
        return True
    except Exception as e:
        print(f"❌ Failed: {email['subject']} - Error: {e}")
        return False

async def main():
    # Load data
    try:
        with open(DATA_FILE, "r") as f:
            batches = json.load(f)
    except FileNotFoundError:
        print(f"Error: Data file {DATA_FILE} not found.")
        sys.exit(1)

    # Determine which batch to send
    # For a 24-hour simulation running hourly, we can map:
    # Hour % Total Batches -> Batch Index
    # This ensures it loops through the content across the day.
    current_hour = datetime.utcnow().hour
    batch_index = current_hour % len(batches)
    
    batch = batches[batch_index]
    emails = batch.get("emails", [])
    
    print(f"--- Simulation Run: Hour {current_hour} (UTC) ---")
    print(f"Targeting Batch #{batch_index} with {len(emails)} emails.")
    
    # Send all emails in the batch concurrently
    async with httpx.AsyncClient() as client:
        tasks = [send_email(client, email) for email in emails]
        results = await asyncio.gather(*tasks)
    
    success_count = sum(results)
    print(f"--- Completed: {success_count}/{len(emails)} sent successfully. ---")

if __name__ == "__main__":
    asyncio.run(main())
