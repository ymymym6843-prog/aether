"""
Convert Gemini Constellation Data
Converts the stroke-based data from constellations_gemini.txt to the star-based format
required by SkyViewRenderer.js.
"""

import re
import json
import math

def parse_gemini_data():
    path = 'e:/NEW/codex/data/constellations_gemini.txt'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract the array content
    match = re.search(r'zodiac_data:\s*\[([\s\S]*)\]', content)
    if not match:
        print("Could not find zodiac_data array")
        return []

    data_block = match.group(1)
    
    # Parse individual constellation objects
    # This regex looks for objects starting with { and ending with }
    # It's a simple parser, assuming the file formatting is consistent
    constellations = []
    
    # We'll split by "name:" to find blocks, then parse each block
    raw_blocks = data_block.split('name:')[1:] # Skip first empty split
    
    for block in raw_blocks:
        # Extract name
        name_match = re.search(r'[\'"](\w+)[\'"]', block)
        if not name_match: continue
        name = name_match.group(1)
        
        # Extract dates
        start_match = re.search(r'start:\s*[\'"]([\d-]+)[\'"]', block)
        end_match = re.search(r'end:\s*[\'"]([\d-]+)[\'"]', block)
        start = start_match.group(1) if start_match else ""
        end = end_match.group(1) if end_match else ""
        
        # Extract points (strokes)
        # Look for points: [ ... ]
        points_block_match = re.search(r'points:\s*\[([\s\S]*?)\]\s*\}', block)
        if not points_block_match: continue
        
        points_content = points_block_match.group(1)
        
        # Parse strokes: arrays of objects [{x,y}, {x,y}]
        strokes = []
        # Find all arrays [...] inside points
        stroke_matches = re.finditer(r'\[([\s\S]*?)\]', points_content)
        
        for s_match in stroke_matches:
            stroke_str = s_match.group(1)
            stroke_points = []
            # Find all {x,y} objects
            p_matches = re.finditer(r'\{\s*x:\s*([\d.-]+),\s*y:\s*([\d.-]+)\s*\}', stroke_str)
            for p in p_matches:
                stroke_points.append({
                    'x': float(p.group(1)),
                    'y': float(p.group(2))
                })
            if stroke_points:
                strokes.append(stroke_points)
        
        constellations.append({
            'name': name,
            'start': start,
            'end': end,
            'strokes': strokes
        })
        
    return constellations

def convert_to_renderer_format(constellations):
    output_js = "    constellations: [\n"
    
    for i, c in enumerate(constellations):
        unique_points = []
        connections = []
        
        # Helper to find or add point
        def get_point_index(x, y):
            for idx, p in enumerate(unique_points):
                # Use a small epsilon for float comparison
                if abs(p['x'] - x) < 0.1 and abs(p['y'] - y) < 0.1:
                    return idx
            
            # Add new point
            # Assign brightness based on "importance" (heuristic: nodes with more connections are brighter)
            unique_points.append({'x': x, 'y': y, 'connections_count': 0})
            return len(unique_points) - 1

        # Process strokes
        for stroke in c['strokes']:
            for j in range(len(stroke) - 1):
                p1 = stroke[j]
                p2 = stroke[j+1]
                
                idx1 = get_point_index(p1['x'], p1['y'])
                idx2 = get_point_index(p2['x'], p2['y'])
                
                # Add connection
                # Check if connection already exists
                exists = False
                for conn in connections:
                    if (conn[0] == idx1 and conn[1] == idx2) or (conn[0] == idx2 and conn[1] == idx1):
                        exists = True
                        break
                
                if not exists:
                    connections.append([idx1, idx2])
                    unique_points[idx1]['connections_count'] += 1
                    unique_points[idx2]['connections_count'] += 1

        # Assign brightness and format points
        formatted_points = []
        for p in unique_points:
            # Heuristic: more connections = brighter star
            # Base brightness 1.2, max 1.8
            brightness = 1.2 + min(0.6, p['connections_count'] * 0.15)
            # Add some randomness
            brightness += (hash(str(p['x']) + str(p['y'])) % 10) * 0.01
            
            formatted_points.append({
                'x': p['x'] * 2.5, # Scale up by 2.5x
                'y': p['y'] * -2.5, # Flip Y axis and scale
                'brightness': round(brightness, 2)
            })

        # Generate JS string
        output_js += f"        // {i+1}. {c['name']} - Converted from Gemini Data\n"
        output_js += "        {\n"
        output_js += f"            name: '{c['name']}',\n"
        output_js += f"            start: '{c['start']}',\n"
        output_js += f"            end: '{c['end']}',\n"
        output_js += "            points: [\n"
        
        for j, p in enumerate(formatted_points):
            comma = "," if j < len(formatted_points) - 1 else ""
            output_js += f"                {{ x: {p['x']}, y: {p['y']}, brightness: {p['brightness']} }}{comma}\n"
            
        output_js += "            ],\n"
        output_js += f"            connections: {json.dumps(connections)}\n"
        
        comma = "," if i < len(constellations) - 1 else ""
        output_js += f"        }}{comma}\n"

    output_js += "    ],\n"
    return output_js

def main():
    constellations = parse_gemini_data()
    if not constellations:
        print("No constellations parsed.")
        return

    js_code = convert_to_renderer_format(constellations)
    
    with open('e:/NEW/codex/data/converted_gemini_constellations.txt', 'w', encoding='utf-8') as f:
        f.write(js_code)
        
    print(f"✅ Converted {len(constellations)} constellations.")

if __name__ == '__main__':
    main()
