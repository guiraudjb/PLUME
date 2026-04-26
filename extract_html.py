import json
from bs4 import BeautifulSoup

def extraire_et_indenter_html(chemin_fichier):
    try:
        # 1. Lire le fichier JSON
        with open(chemin_fichier, 'r', encoding='utf-8') as f:
            donnees = json.load(f)
            
        html_trouve = False

        # 2. Fonction récursive pour parcourir le JSON
        def chercher_html(objet):
            nonlocal html_trouve
            if isinstance(objet, dict):
                for cle, valeur in objet.items():
                    # Si la valeur est une chaîne de caractères et ressemble à du HTML
                    if isinstance(valeur, str) and '<' in valeur and '>' in valeur and '</' in valeur:
                        html_trouve = True
                        print(f"=== HTML trouvé dans la clé : '{cle}' ===")
                        
                        # 3. Formater et indenter le HTML avec BeautifulSoup
                        soup = BeautifulSoup(valeur, 'html.parser')
                        html_indente = soup.prettify()
                        print(html_indente)
                        print("=" * 40 + "\n")
                    else:
                        chercher_html(valeur)
                        
            elif isinstance(objet, list):
                for element in objet:
                    chercher_html(element)

        # Lancer la recherche
        chercher_html(donnees)
        
        if not html_trouve:
            print("Aucune balise HTML n'a été trouvée dans les valeurs du fichier JSON.")

    except FileNotFoundError:
        print(f"Erreur : Le fichier '{chemin_fichier}' est introuvable.")
    except json.JSONDecodeError:
        print("Erreur : Le fichier n'est pas un JSON valide.")

# --- Exécution du script ---
# Assurez-vous que le nom du fichier correspond à celui de votre fichier JSON
nom_fichier = 'lettre-plume-26-04-2026 11H07 26 04.json'
extraire_et_indenter_html(nom_fichier)
