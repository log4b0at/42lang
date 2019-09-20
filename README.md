# 42lang
Voici mon projet de création d'un langage de programmation haut niveau type C++.
Le langage se veut plus intuitif et plus simple à prendre en main que C++.
(PS: Les contributeurs motivés sont les bienvenus 😉)

## Ma philosophie
Voici des axiomes que j'essaierais de respecter dans les choix de syntaxe,
de sémantique et d'approche algorithmique;
- Promouvoir le code explicite, facile à écrire, stricte et intuitif.
- Destituer le code implicite ou ambiguë et error-prone.
- Ré-utiliser, substituer ou unifier des conceptes importés d'autres langages.
- Limiter le par-coeur aux concepts fondamentaux du langage.
- Innover sans s'agenouiller devant les doctrines prépondérantes de la programmation actuelle.

## Consignes
### Langage
- Fortement typé
- Orienté objets
- Ignore les whitespaces & Respecte la casse
### Compilateur
Voici les caractéristiques imposées par moi-même concernant le compilateur;
- Compilation multi-passes
- Compilation streamée (entrée streamé, lexing streamé, error-reporting streamé, sortie compilée streamée)
- Performance dans le temps de compilation
- Liberté sur le choix du langage d'implémentation (Langages compilés uniquement)
### Interpréteur
Même chose pour l'interpréteur à l'exception que le langage d'implémentation pourrait être interprété.

## Syntaxe actuellement proposée

### Boucle et itération
La boucle while, vérifiant itérativement une expression vraie:
```
while(i < str.length)
{
	print(str[i++]);
}
```
La boucle until, vérifiant itérativement une expression fausse:
```
until(i >= str.length)
{
	print(str[i++]);
}
```
Protocoles d'itération spécifiques, la boucle for devient une fonction relevant de l'objet concerné.
Une boucle each assure que l'itération sera faite sur chacun des éléments existant avant l'appel de la fonction.
```
array.for(callback);
array.each(callback);
```
### Fonction
Une fonction commence par son identifiant optionnellement suivit d'une liste d'arguments, optionnellement un type de retour et optionnellement une déclaration
```
main(int ac, **char av): int
{
	ret 0;
}
```
Analoguement une procédure sans type de retour ni argument pourra être déclaré de la façon suivante
```
someprocedure
{
	print(&"Hello");
}
```
### Variable et cast

Une variable ne peut être déclaré qu'au début d'une fonction, autrement c'est un cast

```
main: int
{
	uint exitstatus;

	if (globalvar < 50)
		status = 0;
	else
		status = 1;
	
	ret int status;
}
```

Le cast est noté sans parenthèses, écrit comme une instruction le cast change le type de la variable,
écrit comme une expression le cast n'affecte pas le type de la variable, seulement le résultat de l'expression.
Cast avec perte d'information successive:

```
main: bool
{
	long variable = 2147483649;

	ret bool char short int variable;
}
```

### Les pointeurs et les flags
Les pointeurs vers type peuvent être écrit de 2 manières différentes, en utilisant le type 'Pointer' ou le type primitif 'ptr'.
La notation avec le type primitif 'ptr' convient lorsque l'on a pas d'information sur la cible du pointeur.
Exemple avec la fonction malloc.
```
ptr pointer = malloc(8);
```
La notation avec le type 'Pointer' permet de stocker des informations concernant la cible du pointeur.
On peut l'écrire directement avec un astérix avant le type cible.
```
Pointer<Object> pointer = malloc(ptr.size);
*Object pointer = malloc(ptr.size);
```
Des fois il est utile ou nécessaire d'avoir plus d'information concernant le type ciblé par un pointeur.
Il est possible d'utiliser les flags suivants:
- Nullable noté `?`
- Immutable noté `!`
```
?!Object pointer = malloc(Object.size);
```
> L'ordre d'apparition des flags est injonctif.
> Les flags ne s'applique qu'aux pointeurs.
### Declaration

Syntaxe:

```
[annotation...] [EXPORT]
[MODEL]
[TEMPLATE '<' types... '>']
[IMPL patterns...]
[TYPE primitive] (function|enum|class|union)
```

Exemple:
```
@description("A Car class") 
export
template<MotorType>
impl Drivable
type ptr
class Car { }
```

- Les annotations servent a référencer des meta-informations concernant la déclaration
- Le mot clé "export" rend accessible la déclaration depuis une importation externe
- Le mot clé "model" signifit que la déclaration servira de modèle d'implémentation (analogue aux interfaces)
- L'outil "template" permet de paramétrer la déclaration
- L'outil "impl" permet d'implémenter un ou plusieurs modèles
- Le mot clé "type" détermine le type de la déclaration 
- La déclaration en elle-même

> Tout les mots clés et outils sont optionnels.

> L'ordre d'apparition des mots clés et outils est injonctif.