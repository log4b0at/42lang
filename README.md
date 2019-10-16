# 42lang
Voici mon projet de création d'un langage de programmation haut niveau.
Le langage se veut plus intuitif et plus simple à prendre en main que C++.
Les contributeurs motivés sont les bienvenus.

## Ma philosophie
Voici des axiomes que j'essaierais de respecter dans les choix de syntaxe,
de sémantique et d'approche algorithmique;
- Promouvoir le code explicite, facile à écrire, stricte et intuitif.
- Destituer le code implicite ou ambiguë et error-prone.
- Ré-utiliser, substituer ou unifier des conceptes importés d'autres langages.
- Limiter le par-coeur aux concepts fondamentaux du langage.
## Consignes
### Langage
- Fortement typé
- Orienté objets
- Ignore les whitespaces & Respecte la casse
### Compilateur
Voici les caractéristiques imposées par moi-même concernant le compilateur:
- Compilation multi-passes
- Performance dans le temps de compilation

## Spécifications proposée

### Primitifs
| Symbole      | Type numérique | Description                |
| :-------------- | :------ | :------------------------- |
| ptr | non-signé | Adresse mémoire |
| char | signé | Charactère habituellement de taille 1 octet, de -128 à 127 |
| uchar | non-signé | Charactère non-signé habituellement de taille 1 octet, de 0 à 255 |
| word | signé | Mot habituellement de taille 2 octets, de -32767 à 32767 |
| uword | non-signé | Mot non-signé habituellement de taille 2 octets, de 0 à 65535 |
| int | signé | Entier habituellement de taille 4 octets, de -2147483648 à 2147483647 |
| uint | non-signé | Entier non-signé habituellement de taille 2 à 4 octets, de 0 à 4294967295 |
| long | signé | Long habituellement de taille 8 octets, de -9_223_372_036_854_775_808 à -9_223_372_036_854_775_807 |
| ulong | non-signé | Long non-signé habituellement de taille 8 octets, de 0 à +18_446_744_073_709_551_615 |
| float | signé | Nombre flotant, habituellement de taille 4 octets |
| double | signé | Nombre flotant, habituellement de taille 8 octets |
| quad | signé | Nombre flotant, taille >= double |

### Opérateurs
#### priorité: 1, associativité: Gauche à droite
| Opération       | Symbole | Description                |
| :-------------- | :------ | :------------------------- |
| Incrémentation  | ++ -\- | Incrémentation et décrementation suffixe |
| Appel           | () | Appel de fonction |
| Déréférencement sommatif | [] | Déréférencement de la somme d'un pointeur et d'une expression spécifiée |
| Sélection membre | . | Selection membre avec déréférencement |

#### priorité: 2, associativité: Droite à gauche
| Opération          | Symbole | Description                |
| :----------------- | :------ | :------------------------- |
| Incrémentation     | ++ -\- | Incrémentation et décrementation préfixe |
| Négation numérique | - | Négation du signe de l'opérande |
| Négations          | ! ~ | Négation logique et négation binaire |
| Transtypage        | <type> | Changement du type de l'opérande |
| Conversion         | primitif | Conversion avec ou sans pertes d'informations |
| Déréférencement    | * | Déréférencement du pointeur opérande |
| Référencement      | & | Obtiention d'un pointeur vers l'opérande |
| Allocation         | new type | Allocation dynamique par l'appel du modèle de la méthode statique "constructor" du type-opérande |
| Libération         | delete | Libération dynamique par l'appel du modèle de la méthode statique "destructor" du type de l'opérande |

Substition aux symboles:
- type : type, exemple !*char, ?Object, ptr...
- primitif: type primitif, exemple ptr, int, float...

#### associativité: Gauche à droite
| Priorité | Opération          | Symbole | Description                |
| :-- | :----------------- | :------ | :------------------------- |
| 3 | Multiplication, Division, Modulo | * / % | Multiplication, division ou modulo numérique modulée à la valeur maximal du type des opérandes |
| 4 | Addition, Soustraction | + - | Addition ou soustraction numérique modulée à la valeur maximal du type des opérandes |
| 5 | Décalage | << >> | Décalage binaire à gauche ou à droite
| 6 | Comparaison | < > <= >= | Opérateurs de comparaisons numériques
| 7 | Comparaison | == != | Opérateurs de comparaisons numériques
| 8 | ET binaire | & | ET binaire
| 9 | OU exclusif binaire | ^ | OU exclusif binaire
| 10 | OU binaire | \| | OU binaire
| 11 | ET logique | && | ET logique
| 12 | OU logique | \|\| | ET logique
| 13 | OU selectif | : | OU selectif, retournant l'opérande gauche si elle est non nulle, sinon l'opérande droite. left + (left != 0)*right
| 14 | Assignation | = | Assignation d'une variable opérande par une valeur opérande
| 14 | Assignation | *= /= %= += -= | Ré-assignation par opérateurs numériques
| 14 | Assignation | <<= >>= &= \|= ^= | Ré-assignation par opérateurs binaires
| 15 | Lambda | => | Déclaration de fonction lambda
### Mot clés et identifiants réservés
Les mots suivants sont réservés pour une utilisation syntaxique et ne peuvent pas être utilisés en tant qu'identifiant.

`asm`, `char`, `class`, `const`, `double`, `else`, `enum`, `float`, `global`, `goto`, 

`if`, `impl`, `int`, `is`, `let`, `long`, `model`, `new`, `ptr`, `quad`, `ret`, `throw`,

`type`, `uchar`, `uint`, `ulong`, `union`, `until`, `unstable`, `use`, `uword`, `while`,

`word`
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
Analoguement une procédure sans type de retour ni argument pourra être déclaré de la façon suivante.
```
someprocedure
{
	print("Hello");
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
let c = 'H';		// char
let s = "Hello";	// !*[5]char
let o = new Car;	// Car (class)
let d = <Driveable> o;	// Driveable (class@model)
```
Le typage automatique des énumérations est également effectif lors d'une déclaration de variable ou dans les arguments d'un appel à fonction.
```
enum Letter { A B C };

f(Letter a) { };

main {
	Letter a = A;
	f(B);
}
```
### Marquage des variables
#### Constance
```
const char a = 'A';
```
Marquée `const` la ré-assignation de la variable est prohibée.
#### Instabilitée
````
unstable char a = 'A';
````
Marquée `unstable`, aucune optimisation ne sera faite.
#### Globalité (staticité)
````
global char a = 'A';
````
Marquée `global`, la variable sera traité comme globale.
### Les pointeurs et les flags
Les pointeurs vers type peuvent être écrit de 2 manières différentes, en utilisant le type 'Pointer' ou le type primitif 'ptr'.
La notation avec le type primitif 'ptr' convient lorsque l'on a pas d'information sur la cible du pointeur.
Exemple avec la fonction alloc.
```
ptr pointer = alloc(8);
```
La notation avec le type 'Pointer' permet de stocker des informations concernant la cible du pointeur.
On peut l'écrire directement avec un astérix avant le type cible.
```
Pointer<Object> pointer = alloc(ptr.size);
*Object pointer = alloc(ptr.size);
```
Il est possible d'utiliser les flags suivants sur les types pointeur:
- Nullable noté `?`
- Immutable noté `!`
- Local noté `&`
Les flags empêche le cast implicite dans les certains cas.
| :-- | :-- | :--
| de | à | implicitement |
| `!*var` | `*var`  | oui |
| `?*var` | `*var`  | oui |
| `*var`  | `&*var` | oui |
| `&*var` | `*var`  | non |
| `*var`  | `!*var` | non |
| `*var`  | `?var`  | non |
```
?!Object pointer = alloc(Object.size);
!*char string = "Immutable string";
```
> L'ordre d'apparition des flags est injonctif.
> Les flags ne s'applique qu'aux pointeurs.
#### Séquentialité du pointage
````
const !*[3]char a = "abc";
````
`a` peut pointer sur un seul char ou une séquence de plusieurs char, ainsi nous renseignont la longueur de cette séquence contiguë.
### Condition & Branching
L'instruction `if` peut être utilisé comme expression.
Utilisez `ret` pour retourner une valeur, comme si il s'agissait d'une fonction.
```
main: int
{
	ret if(condition) 5 else 2;
}
```
```
main: int
{
	ret if(condition) { ret 5; } else { ret 2; };
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
Vous stipulez que le second `if` n'aura pas de `else`.
Il est conclu que le `else` appartient au `if` parent.
### Fonction lambda
Exemple sans paramètres:
```
element.on(CHANGE, => alert("it change") );
```
Exemple trier une liste:
```
list.sort((a, b) => if (a < b) ret -1 else ret 1);
```
Voici comment déclarer une fonction prenant en paramètre une fonction lambda.
```
model LambdaCallback(int input): int;

function(LambdaCallback callback): int result
{
	ret callback(42);
}
```
### Overload et labels
Overload d'une fonction possédant les mêmes types d'arguments.
```
getBy(int column): Object {}
getBy(int row): Object {}
```
Utilisez le nom de l'argument comme label dans l'appel pour cibler la fonction souhaitée.
```
let object = getBy(45); // implicitly by column
let object = getBy(column: 45);
let object = getBy(row: 2);
```
### Tableaux
Allouer de la mémoire sur la stack de manière fonctionnelle avec wrap et copy:
```
let array = wrap(42);
copy(array, "Hello world!");
```
Par défaut le type retourné par wrap est de la forme `&*[42]char`
Allouer de la mémoire sur la heap avec alloc:
```
let array = alloc(42);
copy(array, "Hello world!");
```
Par défaut le type retourné par alloc est de la forme `*[42]char`
> Notez que copy déduit la taille à copier à partir du type de la source, ici `!*[12]char`. Si la taille de la source est inconnue il convient d'utiliser strcpy ou strncpy
### Instantiation d'objet
Pour instancier un objet sur la stack, on utilisera l'opérateur esperluette `&`, comme pour obtenir l'addresse d'une variable.
```
&HeapObserver observer = &HeapObserver();
```
Pour instancier l'objet sur la heap on utilisera l'opérateur new.
```
HeapObserver observer = new HeapObserver();
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
Les templates permettent de récuperer des types ou des expressions.
Exemple sur une classe:
```
model<TYPE>
class Number {
	TYPE value;
	constructor(TYPE value) { this.value = value; }
}
```
Utilisation:
```
let number = &Number<uint>(42);
uint num = number.value;
```
Autre exemple sur une fonction, cette fois si la template récupère les expressions passées en paramêtre de la fonction de manière statique.
```
model<EXPR>
do_nothing(EXPR.type parameter): EXPR.type 
{ 
	ret parameter; 
}
```
Utilisation:
```
let num = do_nothing(42);
```
#### Modèle
Une déclaration peut servir de modèle pour d'autres. Utilisez le mot clé `impl` pour implémenter un modèle.

Voici un exemple de modèle de classe qui jouera le role d'interface, et un autre modèle qui sera classe parente.
```
model class Interface {
	model method(int input): int;
}

model class Parent {
	construct
	{}

	destruct
	{}
}

impl Parent, Interface
class Class {
	int properties = 42
	method(int a): int { ret 42; }
}
```

### Syntaxe générale
```
@tag("string")
model<Type, Expression>
impl Driveable
type ptr
class Car { }
```

- Les tags servent a stocker des informations concernant la déclaration
- "export" rend accessible la déclaration depuis une importation externe
- "model" signifit que la déclaration servira de modèle d'implémentation
- "impl" permet d'implémenter un ou plusieurs modèles
- "type" détermine le type de la déclaration 

> Tout ces outils sont optionnels.

> L'ordre d'apparition est injonctif.
