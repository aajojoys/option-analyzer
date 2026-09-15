from pricing.greeks import Greeks

def newton_raphson(pricing_func, market_price, S, K, T, r, option_type, q=0.0, sigma_init=0.3, tol=1e-8, max_iter=100):
    """
    Solve for implied volatility using the Newton-Raphson method.

    Args:
        market_price (float): Observed market option price.
        S (float): Spot price.
        K (float): Strike price.
        T (float): Time to expiry (years).
        r (float): Risk-free interest rate.
        option_type (str): OPTIONTYPE_ALL
        q (float): Dividend yield.
        sigma_init (float): Initial volatility guess
        tol (float): Absolute pricing tolerance.
        max_iter (int): Maximum Newton iterations.

    Returns:
    (float): implied volatility.
    """

    sigma = sigma_init

    for _ in range(max_iter):
        price = pricing_func(S=S, K=K, T=T, r=r, sigma=sigma, option_type=option_type, q=q)
        diff = price - market_price

        if abs(diff) < tol:
            return sigma

        vega = Greeks(S=S, K=K, T=T, r=r, sigma=sigma, q=q).vega()
        if abs(vega) < 1e-10:
            raise RuntimeError(
                "Newton-Raphson failed because Vega is approximately zero."
            )
        sigma -= diff / vega

    raise RuntimeError("Newton-Raphson failed to converge.")


def bisection(pricing_func, market_price, S, K, T, r, option_type, q=0.0, low=1e-6, high=5.0, tol=1e-8, max_iter=100):
    """
    Solve implied volatility using the bisection method.

    Args:
        market_price (float): Observed market option price.
        S (float): Spot price.
        K (float): Strike price.
        T (float): Time to expiry (years).
        r (float): Risk-free interest rate.
        option_type (str): OPTIONTYPE_ALL
        q (float): Dividend yield.
        low (float): initial low volatility value
        high (float): initial high volatility value
        tol (float): Absolute pricing tolerance.
        max_iter (int): Maximum Newton iterations.

    Returns:
    (float): implied volatility.

    """
    for _ in range(max_iter):
        sigma = (low + high) / 2
        price = pricing_func(S=S, K=K, T=T, r=r, sigma=sigma, option_type=option_type, q=q)
        diff = price - market_price

        if abs(diff) < tol:
            return sigma

        if diff > 0:
            high = sigma
        else:
            low = sigma

    raise RuntimeError("Bisection failed to converge.")
