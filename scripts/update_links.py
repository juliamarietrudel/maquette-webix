import re

# Map of service cards to their individual pages
service_map = {
    'Création Publicitaire': 'service-creation-publicitaire.html',
    'Marketing Payant': 'service-marketing-payant.html',
    'Agents IA': 'service-agents-ia.html',
    'CRM & Automatisation': 'service-crm-automatisation.html',
    'Processus de Ventes': 'service-processus-ventes.html',
}

# ---- Update services.html ----
with open('services.html', 'r') as f:
    content = f.read()

# Wrap each service-card div in an anchor tag
for service_name, page in service_map.items():
    # Find the service-card div containing this service name and make it clickable
    # Add href to the svc-arrow → link
    old = f'<div class="svc-title">{service_name}</div>'
    new = f'<a href="{page}" style="text-decoration:none;color:inherit;display:contents;"><div class="svc-title">{service_name}</div>'
    content = content.replace(old, new, 1)

# Also update the .service-card to be clickable by adding onclick
for service_name, page in service_map.items():
    old = f'<div class="svc-arrow">→</div>\n      </div>\n      <div class="service-card">'
    # We'll do it differently - add links to the arrows
    pass

# Better approach: replace the arrow div with a link for each service
arrows_replaced = 0
for service_name, page in service_map.items():
    # Find the block for this service and replace its arrow with a link
    pattern = f'(<div class="svc-title">{re.escape(service_name)}</div>.*?)<div class="svc-arrow">→</div>'
    replacement = f'\\1<a href="{page}" class="svc-arrow" style="text-decoration:none;color:inherit;">→</a>'
    new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    if new_content != content:
        content = new_content
        arrows_replaced += 1
        print(f'  Updated arrow for: {service_name}')

# Also make the entire service-card clickable via CSS cursor
content = content.replace(
    '.service-card {',
    '.service-card { cursor: pointer;'
)

# Add onclick to each service card
for service_name, page in service_map.items():
    old = f'<div class="svc-title">{service_name}</div>'
    # Find the parent service-card and add onclick
    # Use a different approach: wrap the whole card
    pass

with open('services.html', 'w') as f:
    f.write(content)
print(f'services.html updated: {arrows_replaced} arrows replaced')

# ---- Update index.html ----
with open('index.html', 'r') as f:
    idx = f.read()

# Add service links in index.html if service names appear
for service_name, page in service_map.items():
    # Look for service items in the homepage and add links
    if service_name in idx:
        print(f'  index.html contains: {service_name}')

# Update navigation in index.html to add dropdown or service links
# Add a Services dropdown with individual service links
# For now, ensure the Services nav link goes to services.html (already done)

with open('index.html', 'w') as f:
    f.write(idx)

print('Done updating links.')
