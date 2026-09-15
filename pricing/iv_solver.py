from pricing.core import newton_raphson, bisection

IVMETHOD_AUTO = "auto"
IVMETHOD_NEWTON = "newton"
IVMETHOD_BISECTION = "bisection"

def solve_iv(market_price, S, K, T, r, option_type, q=0.0, method="auto", sigma_init=0.3, tol=1e-8, max_iter=100):
    kwargs = dict(market_price=market_price, S=S, K=K, T=T, r=r, option_type=option_type, q=q, tol=tol, max_iter=max_iter)
    newton_kwargs = { **kwargs, 'sigma_init': sigma_init}
    if method == IVMETHOD_BISECTION:
        return bisection(**kwargs)
    elif method == IVMETHOD_NEWTON:
        return newton_raphson(**newton_kwargs)
    else:
        try:
            return newton_raphson(**newton_kwargs)
        except:
            return bisection(**kwargs)
