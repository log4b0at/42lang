# 42lang
Voici mon projet de création d'un langage de programmation haut niveau type C++.
Le langage se veut plus intuitif et plus simple à prendre en main que C++.
Les contributeurs motivés sont les bienvenus.

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
#### Protocoles d'itération spécifiques
La boucle for devient une fonction relevant de l'objet concerné.

Une boucle each assure que l'itération sera faite sur chacun des éléments existant avant l'appel de la fonction.
```
list.for(callback);
list.each(callback);
```
### Fonction
Une fonction commence par son identifiant optionnellement suivit d'une liste d'arguments, optionnellement un type de retour et un bloc d'instruction.
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
Une fonction-template peut être défini à l'aide des pointillet. Par exemple print:
```
...print(int i)
{
	let str = itoa(i);
	write(1, str, strlen(str));
}
```
### Variable et cast
Une variable ne peut être déclaré qu'au début d'une fonction, autrement c'est un cast
```
main: int {
	uint exitstatus;
	if (globalvar < 50)
		status = 0;
	else
		status = 1;
	ret int status;
}
```
Le cast est noté sans chevrons si il s'agit d'un type primitif.
Ecrit comme une instruction le cast change le type de la variable.
Ecrit comme une expression le cast n'affecte pas le type de la variable, seulement le résultat de l'expression.
```
let object = <Object> malloc(Object.size);
```
Pertes d'informations successives:
```
let information = (bool char short int variable);
```

#### Typage automatique
Le typage automatique se fait en utilisant le mot clé `let` à la place du type.
```
let i = 42;		// int
let i2= 0b0001_1010;	// int
let f = 42.2;		// float
let c = "H";		// char
let s = &"Hello";	// !*[5]char
let o = new Car;	// Car (class)
let d = <Driveable> o;	// Driveable (class@model)
```
Le typage automatique est également effectif lors d'une déclaration de variable ou dans les arguments d'un appel à fonction.
(Enumérations uniquement)
```
enum ABC { A B C };
f(ABC a) { };

main {
	ABC a = A;
	f(B);
	// 'A' and 'B' aren't global symbols
}
```
### Marquage des variables
#### Constance
```
const char a = "A";
```
Marqué du mot clé `const` la ré-assignation de la variable est prohibée.
#### Volatilité
````
volatile char a = "A";
````
Marqué du mot clé `volatile`, aucune optimisation ne sera faite.
#### Staticité
````
static char a = "A";
````
Marqué du mot clé `static`, la variable sera traité comme globale.
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
!*char string = &"Immutable string";
```
> L'ordre d'apparition des flags est injonctif.
> Les flags ne s'applique qu'aux pointeurs.
#### Séquentialité du pointage
````
const !*[3]char a = &"abc";
````
`a` peut pointer sur un seul char ou une séquence de plusieurs char, ainsi nous renseignont la longueur de cette séquence.
#### Séquentialité dynamique
```
const *[length]char str = "Hello";
```
Si la longueur de la séquence est dynamique, renseignez une expression dans les crochets.
### Condition & Branching
L'instruction `if` peut être utilisé comme expression.
Utilisez `ret` pour retourner une valeur, comme si il s'agissait d'une fonction.
```
main: int
{
	ret if(condition) ret 5 else ret 2;
}
```
> Le `else` sera obligatoire si il s'agit d'une expression.
#### Else dangling
```
if (cond1)
	if (cond2)
		{ action1(); }
	else
		{ action2(); }
```
Pour eviter les erreurs de else-dangling vous pouvez utiliser le point-virgule à la fin des "if" ne possédant pas de else.
```
if (cond1)
	if (cond2)
		{ action1(); };
else
	{ action2(); }
```
Vous stipulez au compilateur que le second `if` n'aura pas de `else`.
Il en conclu que le `else` appartient au `if` parent.

La méthode est analogue avec des `if` d'une et unique instruction.
### Fonction lambda
Créer une fonction lamdba en suivant cette syntaxe, sans preciser les types des arguments.
```
list.sort((a, b) => if (a < b) ret a else ret b);
```
Les types des arguments sont déterminés par le type du premier argument de la fonction sort.

Voici comment déclarer une fonction prenant en paramètre une fonction lambda.
```
model LambdaCallback(int input): int;

call(LambdaCallback callback, int input): int
{
	ret callback(input);
}
```
### Déclarations
#### Classe
```
class Car
{
	int property = 400

	method: int
	{
		ret property
	}
}
```
Une classe est obligatoirement un type de pointeur, tout comme les fonctions, inutile de le préciser avant la déclaration.
Pour étendre la classe il faudra implémenter un modèle. Voir l'utilisation des modèles.
#### Enumération
```
type uint
enum Alphabet
{
	A B C D E F G H I J K L M N O P Q R S T U V W X Y
	Z = 25

	between(Alphabet left, Alphabet right): bool
	{
		ret (this >= left && this <= right);
	}
}
```
Les énumérations comme les classes peuvent posséder des méthodes.
Aucun outil du type variable iota (comme en Go) n'est disponible pour définir les valeurs des membres d'énumération. 
Tout se fera manuellement.
#### Union
```
type ptr union Cars { Mercedes Dacia Renault Ford }
```
Le type de chaque membre doit correspondre au type de l'union.
Comme l'énumération par exemple, l'union peut posséder ses propres méthodes.
#### Template
Les templates permettent de récuperer des tokens.
```
template<Type>
class Name {
	get: Type {
		ret 42;
	}
}
```
Utilisation:
```
uint num = Name<uint>.new().get();
```
#### Modèle
Une déclaration peut servir de modèle pour d'autres. Utilisez le mot clé `impl` pour implémenter un modèle.

Voici un exemple de modèle de classe qui jouera le role d'interface.
```
model class Interface {
	int properties;
	method(int input): int;
}

class ParentClass {
	int properties = 42 * 2
}

impl ParentClass, Interface
class Class {
	int properties = 42
	method(int a): int { ret 42; }
}
```

### Syntaxe générale
```
@sometag("Some token")
template<Tokens, Tokens2>
model
impl Driveable
type ptr
class Car { }
```

- Les annotations servent a référencer des meta-informations concernant la déclaration
- Le mot clé "export" rend accessible la déclaration depuis une importation externe
- Le mot clé "model" signifit que la déclaration servira de modèle d'implémentation
- L'outil "template" permet de paramétrer la déclaration
- L'outil "impl" permet d'implémenter un ou plusieurs modèles
- Le mot clé "type" détermine le type de la déclaration 
- La déclaration en elle-même

> Tout les mots clés et outils sont optionnels.

> L'ordre d'apparition des mots clés et outils est injonctif.
