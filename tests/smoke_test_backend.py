#!/usr/bin/env python3
"""
Smoke tests for OrgMind backend API
Tests critical endpoints and agent functionality
"""

import requests
import json
import sys
from time import time

BASE_URL = "http://localhost:8000"
TIMEOUT = 10

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_test(name, status, message="", elapsed=0):
    """Print formatted test result"""
    icon = "✅" if status else "❌"
    color = Colors.GREEN if status else Colors.RED
    elapsed_str = f" ({elapsed:.0f}ms)" if elapsed else ""
    print(f"{icon} {color}{name}{Colors.END}{elapsed_str}")
    if message:
        print(f"   {message}")

def test_health():
    """Test 1: Health endpoint"""
    try:
        start = time()
        response = requests.get(f"{BASE_URL}/health", timeout=TIMEOUT)
        elapsed = (time() - start) * 1000
        
        if response.status_code != 200:
            print_test("Health Check", False, f"Status: {response.status_code}", elapsed)
            return False
        
        data = response.json()
        checks = [
            data.get("status") == "ok",
            data.get("graph_loaded") == True,
            data.get("agents_initialized") == True,
            data.get("graph", {}).get("nodes_total", 0) > 0
        ]
        
        if all(checks):
            print_test("Health Check", True, f"Nodes: {data['graph']['nodes_total']}, Agents: ✓", elapsed)
            return True
        else:
            print_test("Health Check", False, "Missing required data", elapsed)
            return False
    except Exception as e:
        print_test("Health Check", False, f"Error: {str(e)}")
        return False

def test_agents_status():
    """Test 2: Agents status endpoint"""
    try:
        start = time()
        response = requests.get(f"{BASE_URL}/agents/status", timeout=TIMEOUT)
        elapsed = (time() - start) * 1000
        
        if response.status_code != 200:
            print_test("Agents Status", False, f"Status: {response.status_code}", elapsed)
            return False
        
        data = response.json()
        agents = data.get("agents", {})
        required_agents = ["intelligence", "critic", "memory", "router"]
        
        checks = [agent in agents for agent in required_agents]
        
        if all(checks):
            print_test("Agents Status", True, f"All 4 agents registered", elapsed)
            return True
        else:
            missing = [a for a in required_agents if a not in agents]
            print_test("Agents Status", False, f"Missing: {missing}", elapsed)
            return False
    except Exception as e:
        print_test("Agents Status", False, f"Error: {str(e)}")
        return False

def test_graph_endpoint():
    """Test 3: Graph export endpoint"""
    try:
        start = time()
        response = requests.get(f"{BASE_URL}/graph", timeout=TIMEOUT)
        elapsed = (time() - start) * 1000
        
        if response.status_code != 200:
            print_test("Graph Export", False, f"Status: {response.status_code}", elapsed)
            return False
        
        data = response.json()
        checks = [
            "nodes" in data,
            "edges" in data,
            len(data.get("nodes", [])) > 0,
            isinstance(data.get("nodes"), list)
        ]
        
        if all(checks):
            print_test("Graph Export", True, f"Nodes: {len(data['nodes'])}, Edges: {len(data['edges'])}", elapsed)
            return True
        else:
            print_test("Graph Export", False, "Invalid graph structure", elapsed)
            return False
    except Exception as e:
        print_test("Graph Export", False, f"Error: {str(e)}")
        return False

def test_intelligence_query(query, expected_fields):
    """Test intelligence agent query"""
    try:
        start = time()
        response = requests.post(
            f"{BASE_URL}/agent/process",
            json={
                "intent": "intelligence",
                "query": query,
                "context": {"role": "user"}
            },
            timeout=TIMEOUT
        )
        elapsed = (time() - start) * 1000
        
        if response.status_code != 200:
            print_test(f"Query: '{query}'", False, f"Status: {response.status_code}", elapsed)
            return False
        
        data = response.json()
        result = data.get("result", {})
        brief = result.get("brief", {})
        
        # Check for expected fields
        checks = [field in brief for field in expected_fields]
        
        if all(checks):
            answer_len = len(result.get("answer", ""))
            print_test(f"Query: '{query}'", True, f"Answer: {answer_len} chars", elapsed)
            return True
        else:
            missing = [f for f in expected_fields if f not in brief]
            print_test(f"Query: '{query}'", False, f"Missing: {missing}", elapsed)
            return False
    except Exception as e:
        print_test(f"Query: '{query}'", False, f"Error: {str(e)}")
        return False

def test_intelligence_queries():
    """Test 4-6: Intelligence agent queries"""
    results = []
    
    # Test blockers query
    results.append(test_intelligence_query(
        "Who is blocked?",
        ["summary", "blockers", "executive_insight", "recommended_actions"]
    ))
    
    # Test changes query
    results.append(test_intelligence_query(
        "What changed today?",
        ["summary", "changes", "executive_insight"]
    ))
    
    # Test risks query
    results.append(test_intelligence_query(
        "What are the biggest risks?",
        ["summary", "risks", "executive_insight", "recommended_actions"]
    ))
    
    return all(results)

def test_visual_reasoning():
    """Test 7: Visual reasoning generation"""
    try:
        start = time()
        response = requests.post(
            f"{BASE_URL}/agent/process",
            json={
                "intent": "intelligence",
                "query": "Who is blocked?",
                "context": {"role": "user"}
            },
            timeout=TIMEOUT
        )
        elapsed = (time() - start) * 1000
        
        if response.status_code != 200:
            print_test("Visual Reasoning", False, f"Status: {response.status_code}", elapsed)
            return False
        
        data = response.json()
        visual = data.get("result", {}).get("visual_reasoning", {})
        
        checks = [
            "nodes" in visual,
            "edges" in visual,
            len(visual.get("nodes", [])) > 0
        ]
        
        if all(checks):
            print_test("Visual Reasoning", True, f"Nodes: {len(visual['nodes'])}, Edges: {len(visual['edges'])}", elapsed)
            return True
        else:
            print_test("Visual Reasoning", False, "Missing graph data", elapsed)
            return False
    except Exception as e:
        print_test("Visual Reasoning", False, f"Error: {str(e)}")
        return False

def main():
    """Run all smoke tests"""
    print(f"\n{Colors.BOLD}{Colors.BLUE}🧪 OrgMind Backend Smoke Tests{Colors.END}\n")
    print(f"Testing: {BASE_URL}\n")
    
    results = []
    
    # Core endpoints
    print(f"{Colors.BOLD}Core Endpoints:{Colors.END}")
    results.append(test_health())
    results.append(test_agents_status())
    results.append(test_graph_endpoint())
    
    # Intelligence queries
    print(f"\n{Colors.BOLD}Intelligence Queries:{Colors.END}")
    results.append(test_intelligence_queries())
    
    # Visual reasoning
    print(f"\n{Colors.BOLD}Visual Features:{Colors.END}")
    results.append(test_visual_reasoning())
    
    # Summary
    passed = sum(results)
    total = len(results)
    success_rate = (passed / total) * 100
    
    print(f"\n{Colors.BOLD}{'='*50}{Colors.END}")
    print(f"{Colors.BOLD}Summary:{Colors.END}")
    print(f"  Passed: {passed}/{total} ({success_rate:.0f}%)")
    
    if success_rate == 100:
        print(f"  {Colors.GREEN}Status: ✅ ALL TESTS PASSED{Colors.END}")
        sys.exit(0)
    elif success_rate >= 80:
        print(f"  {Colors.YELLOW}Status: ⚠️  MOSTLY PASSING{Colors.END}")
        sys.exit(0)
    else:
        print(f"  {Colors.RED}Status: ❌ TESTS FAILED{Colors.END}")
        sys.exit(1)

if __name__ == "__main__":
    main()
