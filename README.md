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
Même chose que pour le compilateur, à exception que le langage d'implémentation pourrait être interprété.

## Syntaxe actuellement proposée

Syntaxe d'une déclaration de type.

```
[etiquette...] [EXPORT]
[TEMPLATE '<' reference... '>']
[PATTERN | IMPL reference...]
[TYPE primitive] (function|enum|class|union)
```

Exemple
```java
@CustomDescription("Voiture électrique zoé") 
// Les étiquettes peuvent prendre un token en paramètre, exemple une string, un nombre, un identifiant.
export
template<MotorType>
impl Drivable
type ptr
class RenaultZoe
{
  uint position_x = 0;
  
  drive(Driver driver)
  {
    if (driver.skill > 6)
      position += 2;
    else
      position++;
  }
}
```
