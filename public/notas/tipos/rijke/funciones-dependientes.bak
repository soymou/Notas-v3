---
title: Funciones dependientes
type: docs
prev: dependiente
next: /notas/tipos/rijke/_index
weight: 2
---

Consideremos una sección \(b\) sobre \(A\) en un contexto \(\Gamma\),es decir, consideremos
\[
  \Gamma, x: A \vdash b(x): B(x).
\]
Vemos que \(b\) es una elección de un elemento de cada \(B(x)\), el tipo de la salida 
depende de \(x: A\). La asignación \(x \mapsto b(x)\) es, en este sentido, una 
*función dependiente*. El tipo de todas estas funciones es llamado
**tipo función dependiente**, y lo escribimos como 
\[
  \Pi_{(x: A)} B(x).
\]
Hay cuatro reglas principales para los \(\Pi\)-tipos:

1. La *regla de formación*, que nos dice como formar tipos función dependiente.
2. La *regla de introducción*, que nos dice como introducir términos del tipo función 
  dependiente.
3. La *regla de eliminación*, que nos dice como usar términos arbitrarios del tipo función
  dependiente.
4. Las *reglas de computación*, que nos dicen como interactúan las reglas de introducción 
  y de eliminación. 

En los casos de las reglas de formación, introducción y eliminación, también necesitamos 
reglas que afirmen que estas construcciones preservar la igualdad juiciosa. Estas reglas
son llamadas **reglas de congruencia**.

## La regla de \(\Pi\)-formación
La regla de \(\Pi\)-formación nos dice cómos e construyen los \(\Pi\)-tipos. La idea es que
\(\Pi_{(x: A)} B(x)\) es un tipo **función dependiente**, para cada familia de tipos \(B\)
sobre \(A\), de modo que la regla de \(Pi\)-formación dice:
\[
  \frac{\Gamma, x: A \vdash B(x) ~~~ \text{type}}{\Gamma \vdash \Pi_{(x: A)} B(x) ~~~ \text{type}} \Pi.
\]
Esta regla simplemente dice que para formar el tipo \(\Pi_{(x: A)} B(x)\) en el contexto 
\(\Gamma\), debemos tener una familia de tipos \(B\) sobre \(A\) en el contexto \(\Gamma\).

También requerimos que la regla de formación de tipos función dependiente preserva la 
igualdad juiciosa. Es decir, tenemos la **regla de congruencia** para \(\Pi\)-tipos:
\[
  \frac
  {\Gamma \vdash A \stackrel{\cdot}{=} A' ~~~ \text{type} ~~~ ~~~ \Gamma,x: A \vdash B(x) \stackrel{\cdot}{=} B'(x) ~~~ \text{type}}
  {\Gamma \vdash \Pi_{(x: A)} B(x) B(x) \stackrel{\cdot}{=} \Pi_{(x: A')} B'(x) ~~~ \text{type}} \Pi-eq
\]

## La regla de \(\Pi\)-introducción









