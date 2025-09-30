---
title: Teoría de tipos dependiente
type: docs
prev: intro
next: funciones-dependientes
---
La teoría de tipos dependiente es un conjunto de reglas de inferencia que se pueden 
combinar para crear *derivaciones*. El objetivo de estas derivaciones es 
frecuentemente construir un elemento de un cierto tipo. En cierto sentido, un tipo 
no es más que una colección de objetos matemáticos y construir elementos de un cierto 
tipo es el desafío matemático del día a día. y construir elementos de un cierto 
tipo es el desafío matemático del día a día.

## Juicios y contextos
Un argumento matemático consiste de una sucesión de pasos, cada uno con una cantidad 
finita de premisas para llegar a la siguiente etapa de la demostración o construcción.
Estos pasos se puden representar mediante **reglas de inferencia**, que se escriben 
en la forma 
\[
  \frac{\mathcal{H}_1 ~~~ \mathcal{H}_2 \ldots \mathcal{H}_n}{\mathcal{C}}
\]
Arriba de la línea horizontal hay una lista finita de juicios como las **premisas** y,
debajo, un sólo juicio llamado la **conclusión**. El sistema de la teoría de tipos 
está descrito por una serie de reglas de inferencias.

Un ejemplo de regla de inferencia lo obtenemos con los tipos función:
\[
  \frac{\Gamma \vdash a: A ~~~ \Gamma \vdash f: A \to B}{\Gamma \vdash f(a): B}.
\]
Esta regla afirma que en un contexto \(\Gamma\) podemos usar un elemento \(a: A\) y una 
función \(f: A \to B\) para obtener un elemento \(f(a): B\). Cada una de las expresiones 

- \(\Gamma \vdash a: A\)
- \(\Gamma \vdash f: A \to B\)
- \(\Gamma \vdash f(a): B\)

son ejemplos de juicios.

<div id="def-1-1-1">
{{<callout type="idea">}}
**Definición 1.1.1**: Hay cuatro tipos de **juicios** en la teoría de tipos de Marrtin-Löf:

1. \(A\) es un **tipo**"(bien formado) en un contexto \(\Gamma\). Expresamos este juicio 
  como \[ \Gamma \vdash A ~~~ \text{type}. \]
2. \(A\) y \(B\) son **tipos juiciosamente iguales** en un contexto \(\Gamma\). Expresamos 
  este juicio como \[\Gamma \vdash A \stackrel{\cdot}{=} B ~~~ \text{type}\]
3. \(a\) es un **elemento** de tipo \(A\) en un contexto \(\Gamma\). Expresamos este juicio
  como \[ \Gamma \vdash a: A. \]
4. \(a\) y \(b\) son **elementos juiciosamente iguales** de tipo \(A\) en un contexto 
  \(\Gamma\). Expresamos este juicio como \[ \Gamma \vdash a \stackrel{\cdot}{=} b: A. \]
{{</callout>}}
</div>

Observemos que cualquier juicio es de la forma \(\Gamma \vdash \mathcal{J}\), donde 
\(\Gamma\) es un contexto y \(\mathcal{J}\) es una *tesis de juicio* con una de las formas
que mencionamos antes. El rol del contexto es declarar los **elementos hipotéticos** que 
son asumidos junto con sus tipos. Los elementos hipotéticos también son llamados 
**variables**.

<div id="def-1-1-2">
{{<callout type="idea">}}
**Definición 1.1.2**: Un **contexto** es una lista finita de **declaraciones de variables**
\[
  x_1: A_1, x_2: A_2(x_1), \ldots, x_n: A_n(x_1, \ldots, x_{n-1}) 
\]
que satisface la condición de que para cada \(1 \leq k \leq n\) podemos derivar el juicio 
\[
  x_1: A_1, \ldots, x_{k-1}: A_{k-1}(x_1, \ldots, x_{k-2}) \vdash A_k(x_1, \ldots, x_{k-1}) ~~~ \text{type}
\]
usando las reglas de inferencia de la teoría de tipos.
{{</callout>}}
</div>

La condición en la definición [1.1.2](#def-1-1-2) de que cada elemento hipotético tiene un 
tipo asignado, se verifica recursivamente. 

## Familias de tipos
<div id="def-1-2-1">
{{<callout name="idea">}}
**Definición 1.2.1**: Consideremos un tipo \(A\) en un contexto \(\Gamma\). Una **famlia**
de tipos sobre \(A\) en el contexto \(\Gamma\) es un tipo \(B(x)\) en el contexto 
\(\Gamma, x: A\). En otras palabras, en la situación en la que 
\(\Gamma, x: A \vdash B(x) ~~~ \text{type}\), decimos que \(B\) es una familia de tipos 
sobre \(A\) en el contexto \(\Gamma\). Alternativamente, decimos que \(B(x)\) es un tipo
indizado por \(x: A\) en el contexto \(\Gamma\).
{{</callout>}}
</div>

Un ejemplo básico de familia de tipos ocurrirá cuando intrdouzcamos los *tipos identidad*.
Se introducen como sigue:
\[
  \frac{\Gamma \vdash a: A}{\Gamma, x: A \vdash a = x ~~~ \text{type}}.
\]
Esta regla asegura que dado un elemento \(a: A\) en un contexto \(\Gamma\), podemo formar
el tipo \(a = x\) en el contexto \(\Gamma, x: A\). El tipo \(a = x\) en el contexto 
\(\Gamma, x: A\) es un ejemplo de una famliia de tipos sobre \(A\) en el contexto 
\(\Gamma\). 

<div id="def-1-2-2">
{{<callout type="idea">}}
Consideremos una familia de tipos \(B\) sobre \(A\) en un contexto \(\Gamma\). Una 
**sección** de la familia \(B\) sobre \(A\) en el contexto \(\Gamma\) es un elemento 
de tipo \(B(x)\) en el contexto \(\Gamma, x: A\), es decir, en el juicio 
\[
  \Gamma, x: A \vdash b(x): B(x).
\]
Decimos que \(b\) es una sección de la familia \(B\) sobre \(A\) en el contexto \(\Gamma\).
Alternativamente, decimos que \(b(x)\) es un elemento de tipo \(B(x)\) indizado por 
\(x: A\) en el contexto \(\Gamma\).
{{</callout>}}
</div>



