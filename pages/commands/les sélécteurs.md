{
    "name":"Les sélécteurs",
    "description":"Avec les commandes blocks il est très simple de cibler un joueur. Mais savez-vous utiliser tous les sélécteurs correctement ?",
	"version":"1.16.4"
}
<===>

# Items:
- chat/command blocks

# Difficulté:
FACILE

# Tuto:

## [1]=> Les types de sélécteurs:

|Types|Cible|
|:-:|---|
|@a|tous les joueurs|
|@e|toutes les entitées (les joueurs sont des entitées)|
|@p|le joueur le plus proche|
|@r|un joueur au hasard|
|@s|l'entitée qui execute la commande (les commandes blocks ne sont pas des entitées)|

## [2]=> Les attributs des sélécteurs:
A utiliser de la façons suivante:
`@selecteur[attribut=argument]`
Avant de vous dévoiler les sélécteurs, vous devez connaitre les types d'argument qui peuvent être utilisé:

|TYPE|CORRESPONDANCE|EXEMPLES|
|---|:-:|---|
|Entiers|Tous les nombre non décimaux (sans virgules).|1, 2, 3, 15, -521, 54651651, -541352|
|Flottant|Tous les nombres décimaux (avec une virgule). Cette famille de nombres comprend les nombre entiers (car n = n.0 où n = un entier)|2.7, 8.9, -15.985|
|Booléen|Un valeur de type "vrai", ou "faux"|true, false (ce sont les 2 seules valeurs possibles)|
|Intervalle|Toute valeurs comprises entre 2 nombres|..5 (= <5), 15.. (= >15), 18..20 (= ]18; 20[ ), 18 (= [18; 18])|
|Texte|Une chaine de caractères (comprises obligatoirement entre "")|Ceci est une chaine de caractères, 159 aussi|

Maintenant que le vocabulaire est acqui, voici les attributs possible:

|ATTRIBUT|CIBLE|TYPE D'ARGUMENT|
|---|:-:|---|
|x|Coordonné absolu de l'axe des absisses par rapport au centre du séléctionné|Flottant|
|y|Coordonné absolu de l'axe des ordonnées par rapport au centre du séléctionné|Flottant|
|z|Coordonné absolu de la profondeur par rapport au centre du séléctionné|Flottant|
|dx|La distance absolu entre le séléctionné et la valeur par rapport à l'axe des absisses|Flottant|
|dy|La distance absolu entre le séléctionné et la valeur par rapport à l'axe des ordonnées|Flottant|
|dz|La distance absolu entre le séléctionné et la valeur par rapport à l'axe de la profondeur|Flottant|
|x_rotation|La rotation du séléctionné par rapport à l'axe horizontal|Intervalle (Flottant)|
|y_rotation|La rotation du séléctionné par rapport à l'axe vertical|Intervalle (Flottant)|
|distance|Toutes les positions entre le sélécteur et une sphère dont le rayon est l'argument|Intervalle (Flottant)|
|gamemode|Le mode de jeu du séléctionné. Valeur possible: `advendure` = jeu en mode aventure / `creative` = jeu en mode créatif / `survival` = jeu en mode survie / `spectator` = jeu en mode spéctateur|Texte|
|limit|Nombre maximal de séléctionné|Entiers (>0)|
|level|Le niveau du joueur séléctionné|Intervalle|
|score|list de score à tester. ex: `@selecteur[score={nom=valeur, nom2=valeur}]`|Intervalle|
|team|Equipe à tester. Note: Si aucune team n'est indiqué, le sélécteur séléctionnera les joueurs qui n'ont pas d'équipe|Texte|
|type|Type d'entité (cochon, joueur, vache, ...)|Texte|
|tag|Tag à testers|Texte|
|nbt|Expression nbt à tester. Ex: `@selecteur[nbt={nbt: valeur}]`|NBT|
|advencements|Liste de progrès à tester. Ex: `@selecteur[advencements={advencement=true, advencement=false}]`|Liste (Booléen)|
|sort|Type de tri des séléctionnés à effectuer. 4 valeurs sont possible: - nearest = du plus proche au plus loin (par défaut de @p) - furthest = du plus loin au plus proche - random = aléatoire (par défaut de @r) - arbitrary = n'applique aucun tri (par défaut de @a et @e)|Texte|