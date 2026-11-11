import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Let's see the end of scripts before </body>
script_end = html.rfind('</script>')
print(f"Last </script> at: {script_end}")
print(html[script_end-1500:script_end])
