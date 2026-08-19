import re
import sys

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Change import
    content = re.sub(r'returnResponse', r'rtnRes', content)

    # Now we have rtnRes(res, statusCode, success, message, data, error)
    # We want to convert to rtnRes(res, statusCode, message, data)
    # Using regex to find rtnRes(res, 200, true, 'Message', data, error)
    
    # We can split by `rtnRes(` and parse arguments.
    parts = content.split('rtnRes(')
    new_content = parts[0]
    for part in parts[1:]:
        # Find the matching closing parenthesis
        open_parens = 1
        close_idx = -1
        in_string = False
        string_char = ''
        for i, char in enumerate(part):
            if char in ("'", '"', '`') and (i == 0 or part[i-1] != '\\'):
                if not in_string:
                    in_string = True
                    string_char = char
                elif string_char == char:
                    in_string = False
            elif not in_string:
                if char == '(':
                    open_parens += 1
                elif char == ')':
                    open_parens -= 1
                    if open_parens == 0:
                        close_idx = i
                        break
        
        if close_idx != -1:
            args_str = part[:close_idx]
            rest = part[close_idx:]
            
            # Split args by comma, respecting strings and objects
            args = []
            current_arg = ""
            open_braces = 0
            open_brackets = 0
            open_parens_arg = 0
            in_str = False
            str_ch = ''
            for ch in args_str:
                if ch in ("'", '"', '`') and not (current_arg.endswith('\\') and not current_arg.endswith('\\\\')):
                    if not in_str:
                        in_str = True
                        str_ch = ch
                    elif str_ch == ch:
                        in_str = False
                elif not in_str:
                    if ch == '{': open_braces += 1
                    elif ch == '}': open_braces -= 1
                    elif ch == '[': open_brackets += 1
                    elif ch == ']': open_brackets -= 1
                    elif ch == '(': open_parens_arg += 1
                    elif ch == ')': open_parens_arg -= 1
                    elif ch == ',' and open_braces == 0 and open_brackets == 0 and open_parens_arg == 0:
                        args.append(current_arg.strip())
                        current_arg = ""
                        continue
                current_arg += ch
            args.append(current_arg.strip())
            
            # args: [res, statusCode, success, message, data, error]
            # new args: res, statusCode, message, data
            new_args = []
            if len(args) >= 1: new_args.append(args[0]) # res
            if len(args) >= 2: new_args.append(args[1]) # statusCode
            if len(args) >= 4: new_args.append(args[3]) # message
            
            # Combine data and error if needed
            combined_data = None
            if len(args) >= 5 and args[4] != 'null':
                combined_data = args[4]
            if len(args) >= 6 and args[5] != 'null':
                if combined_data:
                    # Merge them
                    # if combined_data is an object literal '{ ... }', insert error
                    if combined_data.startswith('{') and combined_data.endswith('}'):
                        combined_data = combined_data[:-1] + f", error: {args[5]}" + "}"
                    else:
                        combined_data = f"{{ data: {combined_data}, error: {args[5]} }}"
                else:
                    combined_data = f"{{ error: {args[5]} }}"
                    
            if combined_data:
                new_args.append(combined_data)
                
            new_content += 'rtnRes(' + ', '.join(new_args) + rest
        else:
            new_content += 'rtnRes(' + part

    with open(filepath, 'w') as f:
        f.write(new_content)
        print(f"Refactored {filepath}")

import glob
files = glob.glob('apps/server/src/controllers/*.js')
for f in files:
    process_file(f)
