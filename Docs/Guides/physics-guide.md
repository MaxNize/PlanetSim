# Physics Model & Numerical Engine Guide

## 1. Overview

The Planet Simulation engine models the gravitational orbital mechanics of celestial bodies using classical Newtonian mechanics. The core engine supports both the **Restricted Three-Body Problem** and generalized **$N$-Body gravitational interactions**, compiled to WebAssembly for 60 FPS real-time web performance.

---

## 2. Fundamental Physics Equations

### 2.1 Newton's Law of Universal Gravitation

The gravitational force magnitude $F$ between two point masses $m_1$ and $m_2$ separated by distance $r$ is:

$$F = G \cdot \frac{m_1 m_2}{r^2}$$

Where:
* $G = 6.67430 \times 10^{-11} \text{ m}^3 \text{ kg}^{-1} \text{ s}^{-2}$ (Universal Gravitational Constant)
* $m_1, m_2$: Masses in kilograms ($\text{kg}$)
* $r$: Euclidean distance in meters ($\text{m}$), $r = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$

The vector force $\mathbf{F}_{12}$ exerted on body 1 by body 2 is:

$$\mathbf{F}_{12} = G \cdot \frac{m_1 m_2}{r^3} (\mathbf{r}_2 - \mathbf{r}_1)$$

### 2.2 Acceleration

By Newton's Second Law ($\mathbf{F} = m \mathbf{a}$), the acceleration of body 1 due to body 2 is:

$$\mathbf{a}_1 = G \cdot \frac{m_2}{r^3} (\mathbf{r}_2 - \mathbf{r}_1)$$

Notice that the acceleration of a test particle is independent of its own mass.

---

## 3. Numerical Integration (Velocity-Verlet)

### 3.1 Why Velocity-Verlet?

Standard Euler integration ($\mathbf{x}_{n+1} = \mathbf{x}_n + \mathbf{v}_n \Delta t$) suffers from numerical energy drift, causing orbits to spiral outwards over time.

We use the **Symplectic Velocity-Verlet** algorithm, which preserves phase-space volume and maintains long-term orbital stability and energy conservation.

### 3.2 Algorithm Steps

Given position $\mathbf{r}_n$, velocity $\mathbf{v}_n$, acceleration $\mathbf{a}_n$ at step $n$, and time step $\Delta t$:

1. **Position Update**:
   $$\mathbf{r}_{n+1} = \mathbf{r}_n + \mathbf{v}_n \Delta t + \frac{1}{2} \mathbf{a}_n (\Delta t)^2$$

2. **Mid-Step Acceleration Calculation**:
   Compute new accelerations $\mathbf{a}_{n+1}$ using updated positions $\mathbf{r}_{n+1}$.

3. **Velocity Update**:
   $$\mathbf{v}_{n+1} = \mathbf{v}_n + \frac{1}{2} (\mathbf{a}_n + \mathbf{a}_{n+1}) \Delta t$$

---

## 4. Lagrange Points (Equilibrium Orbits)

In a restricted 3-body system (Primary mass $M_1$, Secondary mass $M_2$), there exist 5 equilibrium positions where gravitational and centrifugal forces balance in the rotating reference frame:

- **Collinear Points ($L_1, L_2, L_3$):** Located along the line connecting $M_1$ and $M_2$. Found numerically using Newton-Raphson root finding on the effective potential derivative.
- **Triangular Points ($L_4, L_5$):** Located at the vertices of equilateral triangles forming $60^\circ$ angles ahead and behind $M_2$ in its orbit.

---

## 5. Physical Units & Precision Limits

| Parameter | Physical Unit | Typical Range |
| :--- | :--- | :--- |
| Position ($\mathbf{r}$) | Meters ($\text{m}$) | $10^6 \text{ m}$ (Moon) to $10^{11} \text{ m}$ (Earth-Sun) |
| Velocity ($\mathbf{v}$) | Meters per second ($\text{m/s}$) | $1 \text{ km/s}$ to $30 \text{ km/s}$ |
| Mass ($m$) | Kilograms ($\text{kg}$) | $10^{15} \text{ kg}$ (Asteroid) to $10^{30} \text{ kg}$ (Star) |
| Time step ($\Delta t$) | Seconds ($\text{s}$) | $1.0 \text{ s}$ to $86,400 \text{ s}$ |

### Precision & Limits:
- **Floating-point Format:** IEEE 754 double precision (`f64`), relative error $\sim 10^{-16}$.
- **Softening Radius:** A minimum threshold $r_{\text{safe}} = 1000 \text{ m}$ avoids infinite forces during near-collision encounters.

---

## 6. References

1. Goldstein, H., Poole, C., & Safko, J. (2001). *Classical Mechanics* (3rd ed.). Addison-Wesley.
2. Murray, C. D., & Dermott, S. F. (1999). *Solar System Dynamics*. Cambridge University Press.
