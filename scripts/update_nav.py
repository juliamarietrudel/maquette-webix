import os
import re

# The dropdown CSS to inject after nav a styles
DROPDOWN_CSS = """
    /* DROPDOWN */
    .nav-dropdown { position: relative; }
    .nav-dropdown > a { cursor: pointer; }
    .dropdown-menu { position: absolute; top: calc(100% + 20px); left: 50%; transform: translateX(-50%); background: rgba(235,231,227,0.97); backdrop-filter: blur(24px); border: 1px solid rgba(22,27,128,0.1); min-width: 260px; padding: 12px 0; opacity: 0; visibility: hidden; transition: all 0.22s ease; z-index: 200; }
    .nav-dropdown:hover .dropdown-menu { opacity: 1; visibility: visible; }
    .dropdown-menu a { display: block; padding: 10px 20px; font-family: 'Montserrat', sans-serif; font-size: 10px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--black); text-decoration: none; transition: all 0.18s; border-left: 2px solid transparent; opacity: 1; }
    .dropdown-menu a:hover { color: var(--blue); border-left-color: var(--gold); background: rgba(22,27,128,0.04); }
    .dropdown-menu a.active { color: var(--blue); border-left-color: var(--blue); }
    .dropdown-divider { height: 1px; background: rgba(22,27,128,0.08); margin: 8px 0; }
    .dropdown-all { font-weight: 700 !important; color: var(--blue) !important; }"""

# Files to update (not services.html which is already done, not the new service pages which already have it)
files_to_update = [
    'index.html',
    'systeme.html', 
    'etudes-de-cas.html',
    'contact.html',
    'service-creation-publicitaire.html',
    'service-marketing-payant.html',
    'service-agents-ia.html',
    'service-crm-automatisation.html',
    'service-processus-ventes.html',
]

# Patterns for old nav (flat) to replace with dropdown version
# We need to find the nav block and replace the Services link with the dropdown

def make_dropdown(active_page):
    """Generate the dropdown HTML for a given active page"""
    pages = {
        'index': ('index.html', False),
        'systeme': ('systeme.html', False),
        'services': ('services.html', True),
        'etudes': ('etudes-de-cas.html', False),
        'contact': ('contact.html', False),
    }
    
    service_links = [
        ('service-creation-publicitaire.html', 'Contenu Vidéo'),
        ('service-marketing-payant.html', 'Campagnes Marketing'),
        ('service-agents-ia.html', 'Qualification IA'),
        ('service-crm-automatisation.html', 'Booking + CRM'),
        ('service-processus-ventes.html', 'Processus de Ventes'),
        ('service-conception-web.html', 'Conception Web'),
        ('service-seo-complet.html', 'SEO Complet'),
        ('service-ai-seo.html', 'AI SEO (GEO)'),
        ('service-contenu-organique.html', 'Contenu Organique'),
    ]
    
    # Determine if services link should be active
    is_service_page = active_page.startswith('service-')
    services_active = ' class="active"' if (active_page == 'services' or is_service_page) else ''
    
    links_html = ''
    for href, name in service_links:
        active_class = ' class="active"' if href == active_page + '.html' else ''
        links_html += f'\n            <a href="{href}"{active_class}>{name}</a>'
    
    return f'''        <div class="nav-dropdown">
          <a href="services.html"{services_active}>Services</a>
          <div class="dropdown-menu">
            <a href="services.html" class="dropdown-all">→ Tous les services</a>
            <div class="dropdown-divider"></div>{links_html}
          </div>
        </div>'''

for filename in files_to_update:
    filepath = os.path.join('/home/ubuntu/webix-full', filename)
    if not os.path.exists(filepath):
        print(f"SKIP (not found): {filename}")
        continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Skip if already has dropdown
    if 'nav-dropdown' in content:
        print(f"SKIP (already has dropdown): {filename}")
        continue
    
    # Determine active page
    base = filename.replace('.html', '')
    
    # Add dropdown CSS after nav a styles
    # Find a good insertion point - after .btn-cta:hover rule
    css_marker = '.btn-cta:hover { background: rgba(22,27,128,0.88); transform: translateY(-1px); }'
    if css_marker in content and 'nav-dropdown' not in content:
        content = content.replace(css_marker, css_marker + DROPDOWN_CSS)
    
    # Replace the Services nav link with dropdown
    # Pattern 1: for pages using nav-wrap style (systeme, contact, etudes, index)
    old_nav_pattern1 = '        <a href="services.html">Services</a>'
    old_nav_pattern1_active = '        <a href="services.html" class="active">Services</a>'
    
    # Pattern 2: for old service pages using header style
    old_nav_pattern2 = '        <a href="services.html" class="active">Services</a>'
    old_nav_pattern2_inactive = '        <a href="services.html">Services</a>'
    
    dropdown_html = make_dropdown(base)
    
    if old_nav_pattern1_active in content:
        content = content.replace(old_nav_pattern1_active, dropdown_html)
        print(f"Updated (active services): {filename}")
    elif old_nav_pattern1 in content:
        content = content.replace(old_nav_pattern1, dropdown_html)
        print(f"Updated: {filename}")
    else:
        # Try with different indentation
        alt1 = '      <a href="services.html">Services</a>'
        alt2 = '      <a href="services.html" class="active">Services</a>'
        if alt2 in content:
            content = content.replace(alt2, dropdown_html.replace('        ', '      '))
            print(f"Updated (alt indent active): {filename}")
        elif alt1 in content:
            content = content.replace(alt1, dropdown_html.replace('        ', '      '))
            print(f"Updated (alt indent): {filename}")
        else:
            print(f"WARNING - could not find nav pattern in: {filename}")
            # Debug: show nav section
            nav_idx = content.find('<nav>')
            if nav_idx > 0:
                print(f"  Nav section: {content[nav_idx:nav_idx+400]}")
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("\nDone!")
