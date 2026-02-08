"""Load company emails directly into the knowledge graph."""

import pandas as pd
import sys
import os
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from knowledge_graph import GraphBuilder

def load_emails_to_graph(csv_path: str, graph_path: str):
    """Load emails from CSV and build knowledge graph."""
    
    # Read emails
    df = pd.read_csv(csv_path)
    print(f"Loaded {len(df)} emails")
    
    # Build graph
    graph = GraphBuilder()
    
    # Extract unique people
    people = set()
    for _, row in df.iterrows():
        sender = str(row['sender']).split('@')[0].replace('.', ' ').title()
        people.add(sender)
        
        # Extract recipients
        if pd.notna(row['to']):
            for recip in str(row['to']).split(','):
                name = recip.strip().split('@')[0].replace('.', ' ').title()
                people.add(name)
    
    # Add people as nodes
    for person in people:
        graph.add_entity(person, person, {"type": "person"})
    
    print(f"Added {len(people)} people to graph")
    
    # Process emails
    decisions = []
    topics = set()
    
    for idx, row in df.iterrows():
        subject = str(row['subject'])
        body = str(row['body'])
        sender = str(row['sender']).split('@')[0].replace('.', ' ').title()
        
        # Extract topic from subject
        topic = subject.split(':')[0].strip().lower().replace(' ', '_')
        topics.add(topic)
        
        # Check if it's a decision
        decision_keywords = ['approved', 'finalized', 'decided', 'announcement', 'update']
        if any(kw in subject.lower() or kw in body.lower() for kw in decision_keywords):
            decision_id = f"decision_{idx}"
            graph.add_decision(decision_id, content=f"{subject}: {body[:100]}...", date=row['date'])
            decisions.append(decision_id)
            
            # Link decision to sender
            graph.add_relation(decision_id, sender, "made_by")
    
    # Add topics
    for topic in topics:
        graph.add_entity(topic, topic.replace('_', ' ').title(), {"type": "topic"})
    
    print(f"Added {len(decisions)} decisions and {len(topics)} topics")
    
    # Save graph
    output_path = Path(graph_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    graph.save(str(output_path))
    
    stats = graph.get_stats()
    print(f"\nGraph built successfully!")
    print(f"Nodes: {stats['nodes_total']}")
    print(f"Edges: {stats['edges_total']}")
    print(f"Saved to: {graph_path}")
    
    return graph

if __name__ == "__main__":
    csv_file = "data/raw/company_emails.csv"
    output_file = "data/processed/knowledge_graph.pkl"
    
    load_emails_to_graph(csv_file, output_file)
